package jobq

import (
	"fmt"
	"sync"
	"testing"
	"time"
)

func TestLeases(t *testing.T) {
	now := time.Unix(0, 0)
	clock := func() time.Time { return now }
	q := New(2, time.Minute, clock)
	q.Enqueue(&Job{ID: "a"})
	j, tok, ok := q.Lease()
	if !ok || j.ID != "a" {
		t.Fatal()
	}
	now = now.Add(2 * time.Minute)
	j2, tok2, ok := q.Lease()
	if !ok || j2.ID != "a" || tok2 == tok {
		t.Fatal("expired lease should requeue with new token")
	}
	if q.Ack("a", tok) != ErrStale {
		t.Fatal("stale ack accepted")
	}
	if q.Nack("a", tok2) != nil || len(q.Dead) != 1 {
		t.Fatal("max attempts should dead-letter")
	}
	if _, _, ok := q.Lease(); ok {
		t.Fatal("queue should be empty")
	}
}

func TestConcurrent(t *testing.T) {
	q := New(3, time.Hour, time.Now)
	for i := 0; i < 500; i++ {
		q.Enqueue(&Job{ID: fmt.Sprint(i)})
	}
	var wg sync.WaitGroup
	var mu sync.Mutex
	done := map[string]bool{}
	for w := 0; w < 8; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				j, tok, ok := q.Lease()
				if !ok {
					return
				}
				if q.Ack(j.ID, tok) == nil {
					mu.Lock()
					done[j.ID] = true
					mu.Unlock()
				}
			}
		}()
	}
	wg.Wait()
	if len(done) != 500 {
		t.Fatalf("done %d", len(done))
	}
}
