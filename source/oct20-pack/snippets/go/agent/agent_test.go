package agent

import "testing"

func TestGate(t *testing.T) {
	g := NewGate(Tool{"lookup", []string{"id"}, Read}, Tool{"refund", []string{"id", "amount"}, Write})
	if d, err := g.Check(Call{Tool: "lookup", Args: map[string]string{"id": "1"}}); err != nil || d != "run" {
		t.Fatal(d, err)
	}
	if _, err := g.Check(Call{Tool: "nope"}); err == nil {
		t.Fatal("unknown")
	}
	if _, err := g.Check(Call{Tool: "lookup", Args: map[string]string{"id": "1", "x": "y"}}); err == nil {
		t.Fatal("extra arg")
	}
	if _, err := g.Check(Call{Tool: "refund", Args: map[string]string{"id": "1", "amount": "5"}}); err == nil {
		t.Fatal("needs key")
	}
	c := Call{Tool: "refund", Args: map[string]string{"id": "1", "amount": "5"}, Key: "k1"}
	if d, _ := g.Check(c); d != "needs-approval" {
		t.Fatal(d)
	}
	c.Approved = true
	if d, _ := g.Check(c); d != "run" {
		t.Fatal(d)
	}
	if d, _ := g.Check(c); d != "skip-duplicate" {
		t.Fatal(d)
	}
	if len(g.Audit) != 4 {
		t.Fatal(g.Audit)
	}
}

func TestShip(t *testing.T) {
	base := []Result{{"safety", true}, {"safety", true}, {"task", false}}
	good := []Result{{"safety", true}, {"safety", true}, {"task", true}}
	bad := []Result{{"safety", true}, {"safety", false}, {"task", true}, {"task", true}, {"task", true}}
	if ok, _ := Ship(base, good, 0.8, []string{"safety"}); !ok {
		t.Fatal("good")
	}
	if ok, r := Ship(base, bad, 0.5, []string{"safety"}); ok || r != "regression in safety" {
		t.Fatal(r)
	}
	if ok, _ := Ship(base, base, 0.9, nil); ok {
		t.Fatal("min")
	}
}
