package gang

import "sort"

type Job struct {
	ID, Team string
	Nodes    int
	Prio     int
	Seq      int
}

type Sched struct {
	Free      int
	Guarantee map[string]int
	MaxSkips  int
	Queue     []Job
	Running   map[string]Job
	used      map[string]int
	skips     map[string]int
	seq       int
}

func New(free int, guarantee map[string]int, maxSkips int) *Sched {
	return &Sched{Free: free, Guarantee: guarantee, MaxSkips: maxSkips,
		Running: map[string]Job{}, used: map[string]int{}, skips: map[string]int{}}
}

func (s *Sched) Submit(j Job) {
	s.seq++
	j.Seq = s.seq
	s.Queue = append(s.Queue, j)
}

// share is how much of its guarantee a team uses; lower goes first.
func (s *Sched) share(team string) float64 {
	g := s.Guarantee[team]
	if g < 1 {
		g = 1
	}
	return float64(s.used[team]) / float64(g)
}

func (s *Sched) start(j Job) {
	s.Free -= j.Nodes
	s.used[j.Team] += j.Nodes
	s.Running[j.ID] = j
}

// Finish releases a job's nodes.
func (s *Sched) Finish(id string) {
	if j, ok := s.Running[id]; ok {
		delete(s.Running, id)
		s.Free += j.Nodes
		s.used[j.Team] -= j.Nodes
	}
}

// reclaim preempts borrowers so team can get need nodes within its guarantee.
func (s *Sched) reclaim(need int) []string {
	var victims []Job
	for _, r := range s.Running {
		if s.used[r.Team] > s.Guarantee[r.Team] {
			victims = append(victims, r)
		}
	}
	sort.Slice(victims, func(a, b int) bool {
		if victims[a].Prio != victims[b].Prio {
			return victims[a].Prio < victims[b].Prio
		}
		return victims[a].Seq > victims[b].Seq
	})
	avail := s.Free
	var pick []Job
	taken := map[string]int{}
	for _, v := range victims {
		if avail >= need {
			break
		}
		if s.used[v.Team]-taken[v.Team] <= s.Guarantee[v.Team] {
			continue
		}
		pick = append(pick, v)
		taken[v.Team] += v.Nodes
		avail += v.Nodes
	}
	if avail < need {
		return nil
	}
	var ids []string
	for _, v := range pick {
		s.Finish(v.ID)
		s.Submit(Job{ID: v.ID, Team: v.Team, Nodes: v.Nodes, Prio: v.Prio})
		ids = append(ids, v.ID)
	}
	return ids
}

// Step starts what it can and returns started and preempted job IDs.
func (s *Sched) Step() (started, preempted []string) {
	sort.SliceStable(s.Queue, func(a, b int) bool {
		x, y := s.Queue[a], s.Queue[b]
		if x.Prio != y.Prio {
			return x.Prio > y.Prio
		}
		if sx, sy := s.share(x.Team), s.share(y.Team); sx != sy {
			return sx < sy
		}
		return x.Seq < y.Seq
	})
	n := len(s.Queue)
	var rest []Job
	blocked := false
	for _, j := range s.Queue[:n] {
		if blocked {
			rest = append(rest, j)
			continue
		}
		if j.Nodes > s.Free && s.used[j.Team]+j.Nodes <= s.Guarantee[j.Team] {
			preempted = append(preempted, s.reclaim(j.Nodes)...)
		}
		if j.Nodes <= s.Free {
			s.start(j)
			started = append(started, j.ID)
			delete(s.skips, j.ID)
			continue
		}
		s.skips[j.ID]++
		if s.skips[j.ID] > s.MaxSkips {
			blocked = true
		}
		rest = append(rest, j)
	}
	s.Queue = append(rest, s.Queue[n:]...)
	return started, preempted
}
