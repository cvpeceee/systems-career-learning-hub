package flaky

import "sort"

type Run struct {
	Test, Commit string
	Pass         bool
}

type Stats struct {
	Commits, Flaky int
}

// Analyze finds commits where a test both passed and failed.
func Analyze(runs []Run) map[string]Stats {
	type seen struct{ pass, fail bool }
	by := map[string]map[string]*seen{}
	for _, r := range runs {
		if by[r.Test] == nil {
			by[r.Test] = map[string]*seen{}
		}
		s := by[r.Test][r.Commit]
		if s == nil {
			s = &seen{}
			by[r.Test][r.Commit] = s
		}
		if r.Pass {
			s.pass = true
		} else {
			s.fail = true
		}
	}
	out := map[string]Stats{}
	for t, commits := range by {
		st := Stats{Commits: len(commits)}
		for _, s := range commits {
			if s.pass && s.fail {
				st.Flaky++
			}
		}
		out[t] = st
	}
	return out
}

// Quarantine lists tests whose flake rate exceeds limit, given enough data.
func Quarantine(st map[string]Stats, minCommits int, limit float64) []string {
	var q []string
	for t, s := range st {
		if s.Commits >= minCommits && float64(s.Flaky)/float64(s.Commits) > limit {
			q = append(q, t)
		}
	}
	sort.Strings(q)
	return q
}
