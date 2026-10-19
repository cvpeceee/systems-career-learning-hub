package gang

import "testing"

func TestGangQuotaReclaimStarvation(t *testing.T) {
	s := New(64, map[string]int{"a": 32, "b": 32}, 2)
	s.Submit(Job{ID: "b1", Team: "b", Nodes: 48, Prio: 0})
	st, _ := s.Step()
	if len(st) != 1 || s.Free != 16 {
		t.Fatalf("b1 should start by borrowing: %v free=%d", st, s.Free)
	}
	s.Submit(Job{ID: "a1", Team: "a", Nodes: 32, Prio: 0})
	st, pre := s.Step()
	if len(pre) != 1 || pre[0] != "b1" || len(st) != 1 || st[0] != "a1" {
		t.Fatalf("reclaim: started %v preempted %v", st, pre)
	}
	if len(s.Queue) != 1 || s.Queue[0].ID != "b1" {
		t.Fatalf("preempted job must be requeued, queue=%v", s.Queue)
	}
	// b1 (48) can't fit in 32 free; small jobs backfill until skips exceed MaxSkips
	s.Submit(Job{ID: "b2", Team: "b", Nodes: 4})
	st, _ = s.Step()
	if len(st) != 1 || st[0] != "b2" {
		t.Fatalf("backfill %v", st)
	}
	s.Step()
	s.Submit(Job{ID: "b3", Team: "b", Nodes: 4})
	st, _ = s.Step()
	if len(st) != 0 {
		t.Fatalf("after %d skips big job must block backfill, started %v", s.MaxSkips, st)
	}
	// never preempt below guarantee
	s2 := New(32, map[string]int{"a": 16, "b": 16}, 5)
	s2.Submit(Job{ID: "x", Team: "b", Nodes: 16})
	s2.Submit(Job{ID: "y", Team: "a", Nodes: 16})
	s2.Step()
	s2.Submit(Job{ID: "z", Team: "a", Nodes: 8})
	_, pre = s2.Step()
	if len(pre) != 0 {
		t.Fatalf("must not preempt within guarantee: %v", pre)
	}
	// two victims from one team must not push it below guarantee
	s3 := New(40, map[string]int{"a": 24, "b": 16}, 5)
	s3.Submit(Job{ID: "b1", Team: "b", Nodes: 12})
	s3.Submit(Job{ID: "b2", Team: "b", Nodes: 12})
	s3.Submit(Job{ID: "b3", Team: "b", Nodes: 12})
	s3.Step()
	s3.Submit(Job{ID: "a1", Team: "a", Nodes: 24})
	_, pre = s3.Step()
	if len(pre) != 2 {
		t.Fatalf("should stop preempting once enough is free: %v", pre)
	}
}
