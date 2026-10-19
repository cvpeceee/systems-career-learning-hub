package ttl

import (
	"math"
	"sort"
	"time"
)

type Event struct {
	PR   int
	Team string
	Kind string // "approved" or "merged"
	At   time.Time
}

// percentile uses nearest rank on a sorted copy.
func percentile(xs []time.Duration, p float64) time.Duration {
	if len(xs) == 0 {
		return 0
	}
	s := append([]time.Duration(nil), xs...)
	sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })
	k := int(math.Ceil(p*float64(len(s)))) - 1
	if k < 0 {
		k = 0
	}
	return s[k]
}

type Report struct {
	N        int
	P50, P75 time.Duration
}

func TimeToLand(evs []Event) map[string]Report {
	type pair struct {
		team             string
		approved, merged time.Time
	}
	prs := map[int]*pair{}
	for _, e := range evs {
		p := prs[e.PR]
		if p == nil {
			p = &pair{team: e.Team}
			prs[e.PR] = p
		}
		switch e.Kind {
		case "approved":
			if p.approved.IsZero() || e.At.After(p.approved) {
				p.approved = e.At
			}
		case "merged":
			p.merged = e.At
		}
	}
	by := map[string][]time.Duration{}
	for _, p := range prs {
		if p.approved.IsZero() || p.merged.IsZero() || p.merged.Before(p.approved) {
			continue
		}
		by[p.team] = append(by[p.team], p.merged.Sub(p.approved))
	}
	out := map[string]Report{}
	for t, ds := range by {
		out[t] = Report{N: len(ds), P50: percentile(ds, 0.5), P75: percentile(ds, 0.75)}
	}
	return out
}
