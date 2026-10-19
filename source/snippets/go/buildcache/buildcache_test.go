package buildcache

import "testing"

type mc map[string]Result

func (m mc) Get(k string) (Result, bool) { r, ok := m[k]; return r, ok }
func (m mc) Put(k string, r Result)      { m[k] = r }

func TestCache(t *testing.T) {
	a := Action{Cmd: []string{"cc", "-c", "x.c"}, Env: map[string]string{"A": "1", "B": "2"}, Inputs: map[string]string{"x.c": "d1", "y.h": "d2"}, Tool: "gcc14"}
	b := Action{Cmd: []string{"cc", "-c", "x.c"}, Env: map[string]string{"B": "2", "A": "1"}, Inputs: map[string]string{"y.h": "d2", "x.c": "d1"}, Tool: "gcc14"}
	if Key(a) != Key(b) {
		t.Fatal("key must not depend on map order")
	}
	if Key(Action{Cmd: []string{"ab", "c"}}) == Key(Action{Cmd: []string{"a", "bc"}}) {
		t.Fatal("separator collision")
	}
	c := mc{}
	var st Stats
	runs := 0
	exec := func(Action) Result { runs++; return Result{0, []byte("o")} }
	Run(a, c, exec, true, &st)
	if _, hit := Run(b, c, exec, true, &st); !hit || runs != 1 {
		t.Fatal("second run should hit")
	}
	fail := Action{Cmd: []string{"false"}}
	Run(fail, c, func(Action) Result { return Result{1, nil} }, true, &st)
	if _, ok := c.Get(Key(fail)); ok {
		t.Fatal("failures must not be cached")
	}
	ro := Action{Cmd: []string{"ro"}}
	Run(ro, c, exec, false, &st)
	if _, ok := c.Get(Key(ro)); ok {
		t.Fatal("read-only client wrote")
	}
	if st.HitRate() <= 0 || (Stats{}).HitRate() != 0 {
		t.Fatal("hit rate")
	}
}
