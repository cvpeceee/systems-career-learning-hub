package apf

import (
	"math/rand"
	"testing"
	"time"
)

func TestBackoff(t *testing.T) {
	r := rand.New(rand.NewSource(1))
	for a := 0; a < 70; a++ {
		d := Backoff(a, 100*time.Millisecond, 30*time.Second, r)
		if d < 0 || d > 30*time.Second {
			t.Fatalf("attempt %d: %v", a, d)
		}
	}
	var lo, hi int
	for i := 0; i < 2000; i++ {
		if Backoff(10, 100*time.Millisecond, 30*time.Second, r) < 15*time.Second {
			lo++
		} else {
			hi++
		}
	}
	if lo < 800 || hi < 800 {
		t.Fatalf("not spread: %d %d", lo, hi)
	}
	if !NeedRelist(5, 10) || NeedRelist(10, 5) {
		t.Fatal("relist")
	}
}

func TestLevelFairness(t *testing.T) {
	l := NewLevel(1, 2)
	if l.Admit("a", "a1") != "run" {
		t.Fatal()
	}
	l.Admit("a", "a2")
	l.Admit("a", "a3")
	if l.Admit("a", "a4") != "rejected" {
		t.Fatal("queue cap")
	}
	l.Admit("b", "b1")
	var got []string
	for x := l.Done(); x != ""; x = l.Done() {
		got = append(got, x)
	}
	want := []string{"a2", "b1", "a3"}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("round robin: %v", got)
		}
	}
}
