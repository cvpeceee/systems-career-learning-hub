package triage

import (
	"strings"
	"testing"
)

func TestTriage(t *testing.T) {
	in := "node,gpu,xid,dbe,nvlink_crc_per_min,temp_c\nn2,0,0,0,0,60\nn1,3,31,0,0,60\nn1,1,79,0,0,60\nn3,2,0,1,0,60\nn0,5,0,0,150,60\n"
	f, err := Triage(strings.NewReader(in))
	if err != nil {
		t.Fatal(err)
	}
	if len(f) != 4 || f[0].Action != 3 || f[0].Node != "n1" || f[1].Node != "n0" || f[3].Action != 1 {
		t.Fatalf("%+v", f)
	}
	if _, err := Triage(strings.NewReader("n1,x,0,0,0,60\n")); err == nil || !strings.Contains(err.Error(), "line 1") {
		t.Fatalf("bad field: %v", err)
	}
	if _, err := Triage(strings.NewReader("n1,0,0\n")); err == nil {
		t.Fatal("short row accepted")
	}
}
