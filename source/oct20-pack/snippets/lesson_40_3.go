package agent

import "fmt"

type Risk int

const (
	Read Risk = iota
	Write
	Send
)

type Tool struct {
	Name     string
	Required []string
	Risk     Risk
}

type Call struct {
	Tool     string
	Args     map[string]string
	Key      string // idempotency key, required for side effects
	Approved bool   // set by a human reviewer
}

type Gate struct {
	Tools map[string]Tool
	done  map[string]bool
	Audit []string
}

func NewGate(ts ...Tool) *Gate {
	g := &Gate{Tools: map[string]Tool{}, done: map[string]bool{}}
	for _, t := range ts {
		g.Tools[t.Name] = t
	}
	return g
}

// Check decides whether a call may run now: "run", "skip-duplicate", "needs-approval" or an error.
func (g *Gate) Check(c Call) (string, error) {
	t, ok := g.Tools[c.Tool]
	if !ok {
		return "", fmt.Errorf("unknown tool %q", c.Tool)
	}
	allowed := map[string]bool{}
	for _, r := range t.Required {
		allowed[r] = true
		if c.Args[r] == "" {
			return "", fmt.Errorf("%s: missing %s", c.Tool, r)
		}
	}
	for a := range c.Args {
		if !allowed[a] {
			return "", fmt.Errorf("%s: unexpected argument %s", c.Tool, a)
		}
	}
	decision := "run"
	if t.Risk > Read {
		if c.Key == "" {
			return "", fmt.Errorf("%s: side-effecting call needs an idempotency key", c.Tool)
		}
		switch {
		case g.done[c.Key]:
			decision = "skip-duplicate"
		case !c.Approved:
			decision = "needs-approval"
		default:
			g.done[c.Key] = true
		}
	}
	g.Audit = append(g.Audit, c.Tool+" "+decision)
	return decision, nil
}

type Result struct {
	Category string
	Pass     bool
}

// Rates returns the pass rate per category and overall.
func Rates(rs []Result) (map[string]float64, float64) {
	pass, total := map[string]int{}, map[string]int{}
	p := 0
	for _, r := range rs {
		total[r.Category]++
		if r.Pass {
			pass[r.Category]++
			p++
		}
	}
	out := map[string]float64{}
	for c, n := range total {
		out[c] = float64(pass[c]) / float64(n)
	}
	if len(rs) == 0 {
		return out, 0
	}
	return out, float64(p) / float64(len(rs))
}

// Ship gates a candidate: overall at least min, and no drop in any safety category.
func Ship(base, cand []Result, min float64, safety []string) (bool, string) {
	bc, _ := Rates(base)
	cc, overall := Rates(cand)
	if overall < min {
		return false, fmt.Sprintf("overall %.2f below %.2f", overall, min)
	}
	for _, s := range safety {
		if cc[s] < bc[s] {
			return false, "regression in " + s
		}
	}
	return true, "ok"
}
