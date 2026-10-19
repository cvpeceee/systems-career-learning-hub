package rollout

import (
	"fmt"
	"hash/fnv"
	"math"
	"sort"
)

type Node struct {
	ID   string
	Pool string
}

// Waves splits nodes into cumulative fractions, e.g. 0.01, 0.1, 0.5, 1.0.
func Waves(nodes []Node, fracs []float64) [][]Node {
	sorted := append([]Node(nil), nodes...)
	key := func(n Node) uint64 {
		h := fnv.New64a()
		h.Write([]byte(n.ID))
		return h.Sum64()
	}
	sort.Slice(sorted, func(i, j int) bool { return key(sorted[i]) < key(sorted[j]) })
	var out [][]Node
	done := 0
	for _, f := range fracs {
		upto := int(math.Ceil(f * float64(len(sorted))))
		if upto > len(sorted) {
			upto = len(sorted)
		}
		if upto > done {
			out = append(out, sorted[done:upto])
			done = upto
		}
	}
	return out
}

// Batches splits a wave so no pool has more than maxFrac of its nodes down at once.
func Batches(wave []Node, poolSize map[string]int, maxFrac float64) [][]Node {
	limit := map[string]int{}
	for p, n := range poolSize {
		l := int(math.Floor(maxFrac * float64(n)))
		if l < 1 {
			l = 1
		}
		limit[p] = l
	}
	var out [][]Node
	left := append([]Node(nil), wave...)
	for len(left) > 0 {
		used := map[string]int{}
		var batch, rest []Node
		for _, n := range left {
			if used[n.Pool] < limit[n.Pool] {
				used[n.Pool]++
				batch = append(batch, n)
			} else {
				rest = append(rest, n)
			}
		}
		out = append(out, batch)
		left = rest
	}
	return out
}

type Stats struct {
	Jobs, Failures int
}

// Gate compares updated nodes with untouched control nodes.
func Gate(control, canary Stats, minJobs int, maxRatio float64) (bool, string) {
	if canary.Jobs < minJobs {
		return false, fmt.Sprintf("wait: %d/%d jobs observed", canary.Jobs, minJobs)
	}
	rate := func(s Stats) float64 { return (float64(s.Failures) + 1) / (float64(s.Jobs) + 2) }
	r := rate(canary) / rate(control)
	if r > maxRatio {
		return false, fmt.Sprintf("halt: failure rate %.1fx control", r)
	}
	return true, fmt.Sprintf("pass: %.2fx control", r)
}
