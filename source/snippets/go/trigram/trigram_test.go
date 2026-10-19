package trigram

import (
	"strings"
	"testing"
)

func TestSearch(t *testing.T) {
	x := New()
	docs := []string{"mutex_lock(&m);", "lock the mutex", "tex mut ute", "nothing here", "pthread_mutex_lock"}
	for _, d := range docs {
		x.Add(d)
	}
	hits, cand := x.Search("mutex_lock")
	if len(hits) != 2 || hits[0] != 0 || hits[1] != 4 {
		t.Fatalf("%v", hits)
	}
	if cand > 3 {
		t.Fatalf("index should prune: %d candidates", cand)
	}
	hits, _ = x.Search("mutex")
	for _, h := range hits {
		if !strings.Contains(docs[h], "mutex") {
			t.Fatal("false positive")
		}
	}
	if len(hits) != 3 {
		t.Fatalf("mutex hits %v", hits)
	}
	if h, c := x.Search("he"); len(h) != 2 || c != len(docs) {
		t.Fatalf("short query %v %d", h, c)
	}
	if h, _ := x.Search("zzzz"); len(h) != 0 {
		t.Fatal("unknown trigram")
	}
}
