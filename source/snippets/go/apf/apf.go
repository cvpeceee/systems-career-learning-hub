package apf

import (
	"math/rand"
	"time"
)

// Backoff returns a full-jitter delay: random in [0, min(cap, base*2^attempt)].
func Backoff(attempt int, base, max time.Duration, r *rand.Rand) time.Duration {
	d := base
	for i := 0; i < attempt && d < max; i++ {
		d *= 2
	}
	if d > max {
		d = max
	}
	return time.Duration(r.Int63n(int64(d) + 1))
}

// NeedRelist: a watch can resume only if its version wasn't compacted away.
func NeedRelist(lastRV, compactedRV int64) bool {
	return lastRV < compactedRV
}

// Level is one priority level: a concurrency share plus fair queues per flow.
type Level struct {
	Limit    int
	MaxQueue int
	inflight int
	queues   map[string][]string
	order    []string
}

func NewLevel(limit, maxQueue int) *Level {
	return &Level{Limit: limit, MaxQueue: maxQueue, queues: map[string][]string{}}
}

// Admit returns "run", "queued" or "rejected".
func (l *Level) Admit(flow, req string) string {
	if l.inflight < l.Limit && len(l.order) == 0 {
		l.inflight++
		return "run"
	}
	q := l.queues[flow]
	if len(q) >= l.MaxQueue {
		return "rejected"
	}
	if len(q) == 0 {
		l.order = append(l.order, flow)
	}
	l.queues[flow] = append(q, req)
	return "queued"
}

// Done frees a seat and returns the next request to run (round robin across flows), or "".
func (l *Level) Done() string {
	if l.inflight > 0 {
		l.inflight--
	}
	if len(l.order) == 0 || l.inflight >= l.Limit {
		return ""
	}
	flow := l.order[0]
	l.order = l.order[1:]
	q := l.queues[flow]
	next := q[0]
	if len(q) > 1 {
		l.queues[flow] = q[1:]
		l.order = append(l.order, flow)
	} else {
		delete(l.queues, flow)
	}
	l.inflight++
	return next
}
