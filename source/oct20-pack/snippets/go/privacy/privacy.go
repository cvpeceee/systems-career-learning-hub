package privacy

import (
	"errors"
	"time"
)

type ConsentEvent struct {
	Subject, Purpose string
	Granted          bool
	At               time.Time
	PolicyVersion    string
}

// Ledger is append-only: history is the audit trail; the latest event per (subject, purpose) wins.
type Ledger struct{ events []ConsentEvent }

func (l *Ledger) Record(e ConsentEvent) { l.events = append(l.events, e) }

func (l *Ledger) Allowed(subject, purpose string, at time.Time) bool {
	allowed := false
	var latest time.Time
	for _, e := range l.events {
		if e.Subject == subject && e.Purpose == purpose && !e.At.After(at) && !e.At.Before(latest) {
			allowed, latest = e.Granted, e.At
		}
	}
	return allowed
}

type Record struct {
	Subject, Category, Region string
	Created                   time.Time
}

// Expired returns records past their category's retention; unknown categories are flagged, not kept forever.
func Expired(rs []Record, retention map[string]time.Duration, now time.Time) (del []Record, unknown []string) {
	for _, r := range rs {
		d, ok := retention[r.Category]
		if !ok {
			unknown = append(unknown, r.Category)
			continue
		}
		if now.Sub(r.Created) > d {
			del = append(del, r)
		}
	}
	return del, unknown
}

var ErrResidency = errors.New("write violates data residency")

// GuardWrite enforces residency at write time: the record's region must be allowed for this tenant.
func GuardWrite(r Record, tenantRegions map[string]bool) error {
	if !tenantRegions[r.Region] {
		return ErrResidency
	}
	return nil
}
