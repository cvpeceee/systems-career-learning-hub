package otel

import (
	"fmt"
	"testing"
	"time"
)

func TestDecide(t *testing.T) {
	p := Policy{SlowThreshold: time.Second, KeepPercent: 10}
	if k, r := Decide([]Span{{TraceID: "a", Root: true}, {TraceID: "a", Error: true}}, p); !k || r != "error" {
		t.Fatal(r)
	}
	if k, r := Decide([]Span{{TraceID: "b", Root: true, Duration: 2 * time.Second}}, p); !k || r != "slow" {
		t.Fatal(r)
	}
	if k, _ := Decide(nil, p); k {
		t.Fatal("empty")
	}
	kept := 0
	for i := 0; i < 10000; i++ {
		s := []Span{{TraceID: fmt.Sprintf("t%d", i), Root: true}}
		k1, _ := Decide(s, p)
		k2, _ := Decide(s, p)
		if k1 != k2 {
			t.Fatal("not deterministic")
		}
		if k1 {
			kept++
		}
	}
	if kept < 800 || kept > 1200 {
		t.Fatalf("kept %d", kept)
	}
}

func TestLimiter(t *testing.T) {
	l := NewLimiter(2)
	if l.Labels("m", "a") != "a" || l.Labels("m", "b") != "b" || l.Labels("m", "c") != "other" || l.Labels("m", "a") != "a" || l.Labels("n", "c") != "c" {
		t.Fatal("limiter")
	}
	if l.Folded["m"] != 1 {
		t.Fatal(l.Folded)
	}
}
