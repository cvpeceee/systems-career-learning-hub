package mergeq

type PR struct {
	ID  int
	Bad bool // for simulation only: the real signal is the test result
}

// Tester runs CI on main plus the given changes, in order.
type Tester func(batch []PR) bool

type Outcome struct {
	Merged, Rejected []PR
	Runs             int
}

// Process lands the queue in batches of up to maxBatch, bisecting failures.
func Process(queue []PR, test Tester, maxBatch int) Outcome {
	if maxBatch < 1 {
		maxBatch = 1
	}
	var out Outcome
	for len(queue) > 0 {
		n := maxBatch
		if n > len(queue) {
			n = len(queue)
		}
		batch := queue[:n]
		queue = queue[n:]
		out.resolve(batch, test)
	}
	return out
}

func (o *Outcome) resolve(batch []PR, test Tester) {
	o.Runs++
	if test(append(append([]PR(nil), o.Merged...), batch...)) {
		o.Merged = append(o.Merged, batch...)
		return
	}
	if len(batch) == 1 {
		o.Rejected = append(o.Rejected, batch[0])
		return
	}
	mid := len(batch) / 2
	o.resolve(batch[:mid], test)
	o.resolve(batch[mid:], test)
}
