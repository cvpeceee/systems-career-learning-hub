package otel

import (
	"hash/fnv"
	"time"
)

type Span struct {
	TraceID  string
	Root     bool
	Error    bool
	Duration time.Duration
}

type Policy struct {
	SlowThreshold time.Duration
	KeepPercent   uint32 // of normal traces, 0..100
}

// Decide is called once a trace is complete (root ended or timeout). Errors and slow traces are always kept.
func Decide(spans []Span, p Policy) (keep bool, reason string) {
	if len(spans) == 0 {
		return false, "empty"
	}
	var root time.Duration
	for _, s := range spans {
		if s.Error {
			return true, "error"
		}
		if s.Root {
			root = s.Duration
		}
	}
	if root >= p.SlowThreshold {
		return true, "slow"
	}
	h := fnv.New32a()
	h.Write([]byte(spans[0].TraceID))
	if h.Sum32()%100 < p.KeepPercent {
		return true, "sampled"
	}
	return false, "dropped"
}

// Limiter caps unique label sets per metric; extra combinations are folded into "other".
type Limiter struct {
	Budget int
	seen   map[string]map[string]bool
	Folded map[string]int
}

func NewLimiter(budget int) *Limiter {
	return &Limiter{Budget: budget, seen: map[string]map[string]bool{}, Folded: map[string]int{}}
}

// Labels returns the label key to record under: the original, or "other" once the budget is spent.
func (l *Limiter) Labels(metric, labels string) string {
	m := l.seen[metric]
	if m == nil {
		m = map[string]bool{}
		l.seen[metric] = m
	}
	if m[labels] {
		return labels
	}
	if len(m) >= l.Budget {
		l.Folded[metric]++
		return "other"
	}
	m[labels] = true
	return labels
}
