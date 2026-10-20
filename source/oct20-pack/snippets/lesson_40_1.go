package orders

import "errors"

type Event struct {
	ID      string
	Payload string
	Sent    bool
}

// DB stands in for a relational database; Tx applies all changes or none.
type DB struct {
	Orders map[string]string
	Outbox []*Event
}

func (db *DB) CreateOrder(id, status string, fail bool) error {
	// BEGIN
	if fail {
		return errors.New("rollback")
	}
	db.Orders[id] = status
	db.Outbox = append(db.Outbox, &Event{ID: "order-created-" + id, Payload: id})
	// COMMIT: order and outbox row together
	return nil
}

// Relay publishes unsent outbox rows. publish may fail; rows stay unsent and are retried next run.
func (db *DB) Relay(publish func(Event) error) int {
	n := 0
	for _, e := range db.Outbox {
		if e.Sent {
			continue
		}
		if err := publish(*e); err != nil {
			return n
		}
		e.Sent = true
		n++
	}
	return n
}

// Consumer applies each event once, even if delivered many times.
type Consumer struct {
	Seen    map[string]bool
	Applied int
}

func (c *Consumer) Handle(e Event) {
	if c.Seen[e.ID] {
		return
	}
	c.Seen[e.ID] = true
	c.Applied++
}

type Step struct {
	Name       string
	Do         func() error
	Compensate func()
}

// RunSaga runs steps in order; on failure, compensates completed steps in reverse.
func RunSaga(steps []Step) (done []string, undone []string, err error) {
	for i, s := range steps {
		if err = s.Do(); err != nil {
			for j := i - 1; j >= 0; j-- {
				steps[j].Compensate()
				undone = append(undone, steps[j].Name)
			}
			return done, undone, err
		}
		done = append(done, s.Name)
	}
	return done, nil, nil
}
