package rollout

import (
	"fmt"
	"testing"
)

func TestRollout(t *testing.T) {
	var nodes []Node
	size := map[string]int{}
	for i := 0; i < 1000; i++ {
		p := fmt.Sprintf("p%d", i%5)
		nodes = append(nodes, Node{fmt.Sprintf("n%04d", i), p})
		size[p]++
	}
	w := Waves(nodes, []float64{0.01, 0.1, 0.5, 1})
	total := 0
	for _, x := range w {
		total += len(x)
	}
	if len(w) != 4 || len(w[0]) != 10 || total != 1000 {
		t.Fatalf("waves %d %d %d", len(w), len(w[0]), total)
	}
	w2 := Waves(nodes, []float64{0.01, 0.1, 0.5, 1})
	if w2[0][0] != w[0][0] {
		t.Fatal("not stable")
	}
	for _, b := range Batches(w[3], size, 0.05) {
		c := map[string]int{}
		for _, n := range b {
			c[n.Pool]++
			if c[n.Pool] > 10 {
				t.Fatal("pool cap exceeded")
			}
		}
	}
	if ok, _ := Gate(Stats{1000, 10}, Stats{5, 0}, 50, 1.5); ok {
		t.Fatal("too few jobs should not pass")
	}
	if ok, _ := Gate(Stats{1000, 10}, Stats{200, 2}, 50, 1.5); !ok {
		t.Fatal("healthy canary should pass")
	}
	if ok, _ := Gate(Stats{1000, 10}, Stats{200, 10}, 50, 1.5); ok {
		t.Fatal("bad canary should halt")
	}
}
