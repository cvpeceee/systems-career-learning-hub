package triage

import (
	"encoding/csv"
	"fmt"
	"io"
	"sort"
	"strconv"
)

// Input columns: node,gpu,xid,dbe,nvlink_crc_per_min,temp_c
type Flag struct {
	Node   string
	GPU    int
	Action int // 1 watch, 2 drain, 3 repair
	Why    string
}

func rule(xid, dbe int, crc float64, temp int) (int, string) {
	switch {
	case xid == 79:
		return 3, "fell off bus"
	case dbe > 0 || xid == 48:
		return 2, "uncorrectable ECC"
	case crc > 100:
		return 2, "NVLink errors high"
	case temp >= 90:
		return 2, "overheating"
	case crc > 5 || xid != 0:
		return 1, "watch"
	}
	return 0, ""
}

func Triage(r io.Reader) ([]Flag, error) {
	cr := csv.NewReader(r)
	cr.FieldsPerRecord = 6
	rows, err := cr.ReadAll()
	if err != nil {
		return nil, err
	}
	var out []Flag
	for i, row := range rows {
		if i == 0 && row[0] == "node" {
			continue
		}
		gpu, e1 := strconv.Atoi(row[1])
		xid, e2 := strconv.Atoi(row[2])
		dbe, e3 := strconv.Atoi(row[3])
		crc, e4 := strconv.ParseFloat(row[4], 64)
		temp, e5 := strconv.Atoi(row[5])
		for _, e := range []error{e1, e2, e3, e4, e5} {
			if e != nil {
				return nil, fmt.Errorf("line %d: %w", i+1, e)
			}
		}
		if a, why := rule(xid, dbe, crc, temp); a > 0 {
			out = append(out, Flag{row[0], gpu, a, why})
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Action != out[j].Action {
			return out[i].Action > out[j].Action
		}
		if out[i].Node != out[j].Node {
			return out[i].Node < out[j].Node
		}
		return out[i].GPU < out[j].GPU
	})
	return out, nil
}
