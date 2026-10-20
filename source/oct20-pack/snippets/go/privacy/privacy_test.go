package privacy

import (
	"testing"
	"time"
)

func TestLedger(t *testing.T) {
	t0 := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	var l Ledger
	l.Record(ConsentEvent{"u", "ads", true, t0, "v1"})
	l.Record(ConsentEvent{"u", "ads", false, t0.Add(48 * time.Hour), "v2"})
	if l.Allowed("u", "ads", t0.Add(-time.Hour)) || !l.Allowed("u", "ads", t0.Add(time.Hour)) || l.Allowed("u", "ads", t0.Add(72*time.Hour)) || l.Allowed("u", "email", t0.Add(time.Hour)) {
		t.Fatal("ledger")
	}
}

func TestRetentionResidency(t *testing.T) {
	now := time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC)
	rs := []Record{{"a", "logs", "eu", now.Add(-40 * 24 * time.Hour)}, {"b", "logs", "eu", now.Add(-time.Hour)}, {"c", "mystery", "eu", now}}
	del, unk := Expired(rs, map[string]time.Duration{"logs": 30 * 24 * time.Hour}, now)
	if len(del) != 1 || del[0].Subject != "a" || len(unk) != 1 {
		t.Fatal(del, unk)
	}
	if GuardWrite(rs[0], map[string]bool{"us": true}) != ErrResidency || GuardWrite(rs[0], map[string]bool{"eu": true}) != nil {
		t.Fatal("residency")
	}
}
