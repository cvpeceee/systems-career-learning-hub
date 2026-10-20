package k8supgrade

import (
	"reflect"
	"testing"
)

func TestPath(t *testing.T) {
	if !reflect.DeepEqual(UpgradePath(28, 31), []int{29, 30, 31}) || UpgradePath(30, 30) != nil {
		t.Fatal("path")
	}
}

func TestSkew(t *testing.T) {
	if b := SkewViolations(31, map[string]int{"ok": 28, "old": 27, "new": 32}); len(b) != 2 {
		t.Fatal(b)
	}
}

func TestWave(t *testing.T) {
	nodes := []Node{{Name: "n1", Apps: []string{"db"}}, {Name: "n2", Apps: []string{"db"}}, {Name: "n3", LongJob: true}, {Name: "n4", Apps: []string{"web"}}, {Name: "n5", Upgraded: true}}
	if w := NextWave(nodes, map[string]int{"db": 1, "web": 1}, 5); !reflect.DeepEqual(w, []string{"n1", "n4"}) {
		t.Fatal(w)
	}
	if w := NextWave(nodes, map[string]int{"db": 1, "web": 1}, 1); len(w) != 1 {
		t.Fatal(w)
	}
}
