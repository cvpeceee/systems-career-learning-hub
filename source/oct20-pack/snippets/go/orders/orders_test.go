package orders

import (
	"errors"
	"reflect"
	"testing"
)

func TestOutbox(t *testing.T) {
	db := &DB{Orders: map[string]string{}}
	if db.CreateOrder("1", "new", true) == nil || len(db.Orders) != 0 || len(db.Outbox) != 0 {
		t.Fatal("rollback must leave nothing")
	}
	_ = db.CreateOrder("1", "new", false)
	_ = db.CreateOrder("2", "new", false)
	c := &Consumer{Seen: map[string]bool{}}
	calls := 0
	flaky := func(e Event) error {
		calls++
		c.Handle(e)
		if calls == 2 {
			return errors.New("ack lost")
		}
		return nil
	}
	if n := db.Relay(flaky); n != 1 {
		t.Fatal(n)
	}
	if n := db.Relay(flaky); n != 1 {
		t.Fatal(n)
	}
	if c.Applied != 2 {
		t.Fatalf("applied %d", c.Applied)
	}
}

func TestSaga(t *testing.T) {
	var log []string
	st := func(n string, fail bool) Step {
		return Step{n, func() error {
			if fail {
				return errors.New(n)
			}
			return nil
		}, func() { log = append(log, "undo "+n) }}
	}
	done, undone, err := RunSaga([]Step{st("pay", false), st("reserve", false), st("dispatch", true)})
	if err == nil || !reflect.DeepEqual(done, []string{"pay", "reserve"}) || !reflect.DeepEqual(undone, []string{"reserve", "pay"}) || len(log) != 2 {
		t.Fatal(done, undone, err)
	}
	if _, u, e := RunSaga([]Step{st("a", false)}); e != nil || u != nil {
		t.Fatal("ok saga")
	}
}
