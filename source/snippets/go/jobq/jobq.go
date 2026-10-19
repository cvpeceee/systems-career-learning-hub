package jobq

import (
	"errors"
	"sync"
	"time"
)

type Job struct {
	ID       string
	Attempts int
}

type lease struct {
	job   *Job
	token uint64
	until time.Time
}

type Queue struct {
	mu       sync.Mutex
	ready    []*Job
	leased   map[string]*lease
	Dead     []*Job
	max      int
	dur      time.Duration
	now      func() time.Time
	tokenSeq uint64
}

var ErrStale = errors.New("stale or unknown lease")

func New(max int, dur time.Duration, now func() time.Time) *Queue {
	return &Queue{leased: map[string]*lease{}, max: max, dur: dur, now: now}
}

func (q *Queue) Enqueue(j *Job) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.ready = append(q.ready, j)
}

// Lease hands out the next job with a fresh token.
func (q *Queue) Lease() (*Job, uint64, bool) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.reapLocked()
	if len(q.ready) == 0 {
		return nil, 0, false
	}
	j := q.ready[0]
	q.ready = q.ready[1:]
	j.Attempts++
	q.tokenSeq++
	q.leased[j.ID] = &lease{job: j, token: q.tokenSeq, until: q.now().Add(q.dur)}
	return j, q.tokenSeq, true
}

// Ack completes a job, but only for the current lease holder.
func (q *Queue) Ack(id string, token uint64) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	l, ok := q.leased[id]
	if !ok || l.token != token {
		return ErrStale
	}
	delete(q.leased, id)
	return nil
}

// Nack returns a job early (worker gave up).
func (q *Queue) Nack(id string, token uint64) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	l, ok := q.leased[id]
	if !ok || l.token != token {
		return ErrStale
	}
	delete(q.leased, id)
	q.retryLocked(l.job)
	return nil
}

func (q *Queue) retryLocked(j *Job) {
	if j.Attempts >= q.max {
		q.Dead = append(q.Dead, j)
		return
	}
	q.ready = append(q.ready, j)
}

func (q *Queue) reapLocked() {
	t := q.now()
	for id, l := range q.leased {
		if !t.Before(l.until) {
			delete(q.leased, id)
			q.retryLocked(l.job)
		}
	}
}
