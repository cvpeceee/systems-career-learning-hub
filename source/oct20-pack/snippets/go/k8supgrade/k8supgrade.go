package k8supgrade

import "fmt"

// Minor versions only, e.g. 30 for 1.30.

// UpgradePath returns each control-plane minor to step through. Kubernetes never skips minors.
func UpgradePath(from, to int) []int {
	var p []int
	for v := from + 1; v <= to; v++ {
		p = append(p, v)
	}
	return p
}

// SkewViolations checks kubelets against the API server: at most 3 minors older, never newer.
func SkewViolations(apiserver int, kubelets map[string]int) []string {
	var bad []string
	for node, v := range kubelets {
		switch {
		case v > apiserver:
			bad = append(bad, fmt.Sprintf("%s: kubelet 1.%d newer than apiserver 1.%d", node, v, apiserver))
		case apiserver-v > 3:
			bad = append(bad, fmt.Sprintf("%s: kubelet 1.%d more than 3 minors behind", node, v))
		}
	}
	return bad
}

type Node struct {
	Name     string
	Apps     []string // apps with a replica on this node
	LongJob  bool     // running a job that must not be interrupted
	Upgraded bool
}

// NextWave picks nodes to drain now: skip long jobs and never exceed any app's disruption budget.
func NextWave(nodes []Node, budget map[string]int, maxWave int) []string {
	used := map[string]int{}
	var wave []string
	for _, n := range nodes {
		if len(wave) == maxWave {
			break
		}
		if n.Upgraded || n.LongJob {
			continue
		}
		ok := true
		for _, a := range n.Apps {
			if used[a]+1 > budget[a] {
				ok = false
				break
			}
		}
		if !ok {
			continue
		}
		for _, a := range n.Apps {
			used[a]++
		}
		wave = append(wave, n.Name)
	}
	return wave
}
