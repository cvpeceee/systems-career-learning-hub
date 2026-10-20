package autoscale

import (
	"math"
	"sort"
)

type Config struct {
	TargetPerReplica float64 // in-flight requests one replica handles within SLO
	Min, Max         int
	WindowSamples    int // scale-down stabilization window, in samples
}

type Scaler struct {
	cfg     Config
	history []int // recent raw recommendations
}

func New(cfg Config) *Scaler { return &Scaler{cfg: cfg} }

func (s *Scaler) clamp(n int) int {
	if n < s.cfg.Min {
		return s.cfg.Min
	}
	if n > s.cfg.Max {
		return s.cfg.Max
	}
	return n
}

// Desired returns the replica count for this sample. Scale up immediately; scale down to the window's max.
func (s *Scaler) Desired(current int, inFlight float64) int {
	raw := s.clamp(int(math.Ceil(inFlight / s.cfg.TargetPerReplica)))
	s.history = append(s.history, raw)
	if len(s.history) > s.cfg.WindowSamples {
		s.history = s.history[1:]
	}
	if raw >= current {
		return raw
	}
	best := raw
	for _, h := range s.history {
		if h > best {
			best = h
		}
	}
	if best > current {
		best = current
	}
	return best
}

type Pool struct {
	Name     string
	CostHour float64
	Free     int // replicas this pool can still host
	MeetsSLO bool
}

// Place assigns n new replicas to the cheapest pools that meet the SLO. Returns placements and any shortfall.
func Place(pools []Pool, n int) (map[string]int, int) {
	ps := append([]Pool(nil), pools...)
	sort.Slice(ps, func(i, j int) bool { return ps[i].CostHour < ps[j].CostHour })
	out := map[string]int{}
	for _, p := range ps {
		if n == 0 {
			break
		}
		if !p.MeetsSLO || p.Free == 0 {
			continue
		}
		k := p.Free
		if k > n {
			k = n
		}
		out[p.Name] += k
		n -= k
	}
	return out, n
}
