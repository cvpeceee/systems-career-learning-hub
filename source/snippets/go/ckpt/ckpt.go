package ckpt

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
)

// Store is object storage: whole-object puts, no partial reads of a put in progress.
type Store interface {
	Put(key string, data []byte) error
	Get(key string) ([]byte, error)
	List(prefix string) []string
	Delete(key string) error
}

type Manifest struct {
	Step   int      `json:"step"`
	Shards []string `json:"shards"`
}

func prefix(step int) string { return fmt.Sprintf("ckpt/step-%08d/", step) }

func sum(b []byte) string {
	h := sha256.Sum256(b)
	return hex.EncodeToString(h[:])
}

// Save writes shards in parallel (at most par at once), then commits the manifest.
func Save(ctx context.Context, s Store, step int, shards [][]byte, par int) error {
	if par < 1 {
		par = 1
	}
	m := Manifest{Step: step, Shards: make([]string, len(shards))}
	sem := make(chan struct{}, par)
	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error
	for i, b := range shards {
		if ctx.Err() != nil {
			break
		}
		sem <- struct{}{}
		wg.Add(1)
		go func(i int, b []byte) {
			defer wg.Done()
			defer func() { <-sem }()
			m.Shards[i] = sum(b)
			if err := s.Put(fmt.Sprintf("%sshard-%05d", prefix(step), i), b); err != nil {
				mu.Lock()
				if firstErr == nil {
					firstErr = err
				}
				mu.Unlock()
			}
		}(i, b)
	}
	wg.Wait()
	if firstErr != nil {
		return firstErr
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	mb, _ := json.Marshal(m)
	return s.Put(prefix(step)+"MANIFEST", mb)
}

// SaveAsync snapshots now and uploads in the background.
func SaveAsync(ctx context.Context, s Store, step int, shards [][]byte, par int) <-chan error {
	snap := make([][]byte, len(shards))
	for i, b := range shards {
		snap[i] = append([]byte(nil), b...)
	}
	done := make(chan error, 1)
	go func() { done <- Save(ctx, s, step, snap, par) }()
	return done
}

var ErrNone = errors.New("no valid checkpoint")

// Latest returns the newest step whose manifest exists and whose shards verify.
func Latest(s Store) (int, [][]byte, error) {
	var steps []int
	for _, k := range s.List("ckpt/") {
		var st int
		if strings.HasSuffix(k, "/MANIFEST") {
			if _, err := fmt.Sscanf(k, "ckpt/step-%08d/MANIFEST", &st); err == nil {
				steps = append(steps, st)
			}
		}
	}
	sort.Sort(sort.Reverse(sort.IntSlice(steps)))
	for _, st := range steps {
		if data, err := Load(s, st); err == nil {
			return st, data, nil
		}
	}
	return 0, nil, ErrNone
}

// Load reads one step and verifies every shard against the manifest.
func Load(s Store, step int) ([][]byte, error) {
	mb, err := s.Get(prefix(step) + "MANIFEST")
	if err != nil {
		return nil, err
	}
	var m Manifest
	if err := json.Unmarshal(mb, &m); err != nil {
		return nil, err
	}
	out := make([][]byte, len(m.Shards))
	for i, want := range m.Shards {
		b, err := s.Get(fmt.Sprintf("%sshard-%05d", prefix(step), i))
		if err != nil {
			return nil, err
		}
		if sum(b) != want {
			return nil, fmt.Errorf("step %d shard %d: checksum mismatch", step, i)
		}
		out[i] = b
	}
	return out, nil
}

// Retain keeps the newest keep committed steps and deletes the rest safely.
func Retain(s Store, keep int) {
	var steps []int
	for _, k := range s.List("ckpt/") {
		var st int
		if _, err := fmt.Sscanf(k, "ckpt/step-%08d/MANIFEST", &st); err == nil {
			steps = append(steps, st)
		}
	}
	sort.Ints(steps)
	for i := 0; i+keep < len(steps); i++ {
		p := prefix(steps[i])
		_ = s.Delete(p + "MANIFEST")
		for _, k := range s.List(p) {
			_ = s.Delete(k)
		}
	}
}
