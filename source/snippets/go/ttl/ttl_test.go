package ttl

import (
	"testing"
	"time"
)

func TestTTL(t *testing.T) {
	t0 := time.Unix(0, 0)
	var ev []Event
	for i := 1; i <= 4; i++ {
		ev = append(ev, Event{i, "a", "approved", t0}, Event{i, "a", "merged", t0.Add(time.Duration(i*10) * time.Minute)})
	}
	ev = append(ev, Event{9, "a", "approved", t0}) // not merged
	ev = append(ev, Event{10, "b", "approved", t0}, Event{10, "b", "approved", t0.Add(30 * time.Minute)}, Event{10, "b", "merged", t0.Add(40 * time.Minute)})
	ev = append(ev, Event{11, "b", "merged", t0}, Event{11, "b", "approved", t0.Add(time.Minute)}) // bad order
	r := TimeToLand(ev)
	if r["a"].N != 4 || r["a"].P50 != 20*time.Minute || r["a"].P75 != 30*time.Minute {
		t.Fatalf("%+v", r["a"])
	}
	if r["b"].N != 1 || r["b"].P75 != 10*time.Minute {
		t.Fatalf("last approval: %+v", r["b"])
	}
	if percentile(nil, 0.5) != 0 {
		t.Fatal()
	}
}
