package ckpt

import (
	"context"
	"errors"
	"sort"
	"strings"
	"sync"
	"testing"
)

type mem struct {
	mu      sync.Mutex
	m       map[string][]byte
	failKey string
}

func newMem() *mem { return &mem{m: map[string][]byte{}} }
func (s *mem) Put(k string, b []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.failKey != "" && strings.HasSuffix(k, s.failKey) {
		return errors.New("injected")
	}
	s.m[k] = append([]byte(nil), b...)
	return nil
}
func (s *mem) Get(k string) ([]byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, ok := s.m[k]
	if !ok {
		return nil, errors.New("missing")
	}
	return b, nil
}
func (s *mem) List(p string) []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	var ks []string
	for k := range s.m {
		if strings.HasPrefix(k, p) {
			ks = append(ks, k)
		}
	}
	sort.Strings(ks)
	return ks
}
func (s *mem) Delete(k string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.m, k)
	return nil
}

func shards(n int, tag byte) [][]byte {
	out := make([][]byte, n)
	for i := range out {
		out[i] = []byte{tag, byte(i), 1, 2, 3}
	}
	return out
}

func TestSaveLatestRetain(t *testing.T) {
	s := newMem()
	ctx := context.Background()
	if _, _, err := Latest(s); err != ErrNone {
		t.Fatal("want ErrNone")
	}
	for step := 1; step <= 3; step++ {
		if err := Save(ctx, s, step*100, shards(16, byte(step)), 4); err != nil {
			t.Fatal(err)
		}
	}
	st, data, err := Latest(s)
	if err != nil || st != 300 || data[5][0] != 3 {
		t.Fatalf("latest %d %v", st, err)
	}
	// crash before manifest: shard puts ok, manifest fails
	s.failKey = "MANIFEST"
	if err := Save(ctx, s, 400, shards(16, 4), 4); err == nil {
		t.Fatal("want error")
	}
	s.failKey = ""
	if st, _, _ := Latest(s); st != 300 {
		t.Fatalf("uncommitted step visible: %d", st)
	}
	// corrupt newest committed: falls back
	_ = s.Put("ckpt/step-00000300/shard-00003", []byte("bad"))
	if st, _, _ := Latest(s); st != 200 {
		t.Fatalf("fallback got %d", st)
	}
	Retain(s, 1)
	if len(s.List("ckpt/step-00000100/")) != 0 || len(s.List("ckpt/step-00000200/")) != 0 {
		t.Fatal("old steps not deleted")
	}
	// async: mutate source after call; snapshot must be unaffected
	src := shards(8, 9)
	ch := SaveAsync(ctx, s, 500, src, 2)
	src[0][0] = 77
	if err := <-ch; err != nil {
		t.Fatal(err)
	}
	if _, d, _ := Latest(s); d[0][0] != 9 {
		t.Fatal("snapshot not isolated")
	}
	cctx, cancel := context.WithCancel(ctx)
	cancel()
	if err := Save(cctx, s, 600, shards(4, 6), 2); err == nil {
		t.Fatal("cancelled save should fail")
	}
}
