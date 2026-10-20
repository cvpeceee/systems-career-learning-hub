package autoscale

import "testing"

func TestDesired(t *testing.T) {
	s := New(Config{TargetPerReplica: 10, Min: 2, Max: 20, WindowSamples: 3})
	if got := s.Desired(2, 95); got != 10 {
		t.Fatalf("scale up: %d", got)
	}
	if got := s.Desired(10, 20); got != 10 {
		t.Fatalf("held by window: %d", got)
	}
	s.Desired(10, 20)
	if got := s.Desired(10, 20); got != 2 {
		t.Fatalf("after window: %d", got)
	}
	if got := s.Desired(2, 1000); got != 20 {
		t.Fatalf("max clamp: %d", got)
	}
}

func TestPlace(t *testing.T) {
	out, short := Place([]Pool{{"spot", 1, 3, false}, {"a", 2, 2, true}, {"b", 3, 10, true}}, 5)
	if short != 0 || out["a"] != 2 || out["b"] != 3 || out["spot"] != 0 {
		t.Fatalf("%v %d", out, short)
	}
	if _, s := Place([]Pool{{"a", 1, 1, true}}, 3); s != 2 {
		t.Fatal("shortfall")
	}
}
