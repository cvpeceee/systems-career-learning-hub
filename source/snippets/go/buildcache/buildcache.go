package buildcache

import (
	"crypto/sha256"
	"encoding/hex"
	"sort"
	"strings"
)

type Action struct {
	Cmd    []string
	Env    map[string]string // only variables the action may read
	Inputs map[string]string // path -> content digest
	Tool   string            // toolchain identity, e.g. compiler digest
}

type Result struct {
	Exit   int
	Output []byte
}

type Cache interface {
	Get(key string) (Result, bool)
	Put(key string, r Result)
}

func sortedKeys(m map[string]string) []string {
	ks := make([]string, 0, len(m))
	for k := range m {
		ks = append(ks, k)
	}
	sort.Strings(ks)
	return ks
}

// Key hashes everything the action depends on.
func Key(a Action) string {
	h := sha256.New()
	w := func(s string) { h.Write([]byte(s)); h.Write([]byte{0}) }
	w("tool:" + a.Tool)
	w("cmd:" + strings.Join(a.Cmd, "\x00"))
	for _, k := range sortedKeys(a.Env) {
		w("env:" + k + "=" + a.Env[k])
	}
	for _, p := range sortedKeys(a.Inputs) {
		w("in:" + p + "=" + a.Inputs[p])
	}
	return hex.EncodeToString(h.Sum(nil))
}

type Stats struct{ Hits, Misses int }

// Run returns a cached result or executes and stores it if it succeeded.
func Run(a Action, c Cache, exec func(Action) Result, canWrite bool, st *Stats) (Result, bool) {
	k := Key(a)
	if r, ok := c.Get(k); ok {
		st.Hits++
		return r, true
	}
	st.Misses++
	r := exec(a)
	if r.Exit == 0 && canWrite {
		c.Put(k, r)
	}
	return r, false
}

func (s Stats) HitRate() float64 {
	if s.Hits+s.Misses == 0 {
		return 0
	}
	return float64(s.Hits) / float64(s.Hits+s.Misses)
}
