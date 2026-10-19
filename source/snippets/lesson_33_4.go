package trigram

import (
	"sort"
	"strings"
)

type Index struct {
	docs []string
	post map[string][]int // trigram -> sorted doc IDs
}

func New() *Index { return &Index{post: map[string][]int{}} }

func grams(s string) map[string]bool {
	g := map[string]bool{}
	for i := 0; i+3 <= len(s); i++ {
		g[s[i:i+3]] = true
	}
	return g
}

func (x *Index) Add(text string) int {
	id := len(x.docs)
	x.docs = append(x.docs, text)
	for t := range grams(text) {
		x.post[t] = append(x.post[t], id)
	}
	return id
}

func intersect(a, b []int) []int {
	var out []int
	for i, j := 0, 0; i < len(a) && j < len(b); {
		switch {
		case a[i] == b[j]:
			out = append(out, a[i])
			i++
			j++
		case a[i] < b[j]:
			i++
		default:
			j++
		}
	}
	return out
}

// Search returns IDs of docs containing q, and how many candidates were checked.
func (x *Index) Search(q string) ([]int, int) {
	var cand []int
	if len(q) < 3 {
		for i := range x.docs {
			cand = append(cand, i)
		}
	} else {
		var lists [][]int
		for t := range grams(q) {
			lists = append(lists, x.post[t])
		}
		sort.Slice(lists, func(i, j int) bool { return len(lists[i]) < len(lists[j]) })
		cand = lists[0]
		for _, l := range lists[1:] {
			cand = intersect(cand, l)
		}
	}
	var hits []int
	for _, id := range cand {
		if strings.Contains(x.docs[id], q) {
			hits = append(hits, id)
		}
	}
	return hits, len(cand)
}
