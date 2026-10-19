package flaky

import (
	"fmt"
	"testing"
)

func TestFlaky(t *testing.T) {
	var runs []Run
	for c := 0; c < 30; c++ {
		cm := fmt.Sprint("c", c)
		runs = append(runs, Run{"stable", cm, true}, Run{"broken", cm, false})
		runs = append(runs, Run{"flaky", cm, true})
		if c%3 == 0 {
			runs = append(runs, Run{"flaky", cm, false})
		}
	}
	runs = append(runs, Run{"new", "c0", true}, Run{"new", "c0", false})
	st := Analyze(runs)
	if st["flaky"].Flaky != 10 || st["stable"].Flaky != 0 || st["broken"].Flaky != 0 {
		t.Fatalf("%+v", st)
	}
	q := Quarantine(st, 20, 0.05)
	if len(q) != 1 || q[0] != "flaky" {
		t.Fatalf("quarantine %v (new has too few commits)", q)
	}
}
