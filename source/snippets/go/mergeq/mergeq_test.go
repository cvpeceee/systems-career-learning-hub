package mergeq

import "testing"

func TestQueue(t *testing.T) {
	var q []PR
	for i := 0; i < 16; i++ {
		q = append(q, PR{ID: i, Bad: i == 5 || i == 11})
	}
	test := func(b []PR) bool {
		for _, p := range b {
			if p.Bad {
				return false
			}
		}
		return true
	}
	o := Process(q, test, 8)
	if len(o.Merged) != 14 || len(o.Rejected) != 2 || o.Rejected[0].ID != 5 {
		t.Fatalf("%+v", o)
	}
	for i := 1; i < len(o.Merged); i++ {
		if o.Merged[i].ID < o.Merged[i-1].ID {
			t.Fatal("order not preserved")
		}
	}
	serial := Process(q, test, 1)
	if serial.Runs != 16 || o.Runs >= serial.Runs {
		t.Fatalf("batching should save runs: %d vs %d", o.Runs, serial.Runs)
	}
	if Process(q, test, 0).Runs != 16 {
		t.Fatal("maxBatch<1 treated as 1")
	}
}
