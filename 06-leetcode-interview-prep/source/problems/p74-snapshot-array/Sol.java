import java.util.*;
// Snapshot Array - per-index TreeMap snapId -> value; floorEntry on get.
class SnapshotArray {
    List<TreeMap<Integer, Integer>> hist = new ArrayList<>(); int snapId = 0;
    SnapshotArray(int n) { for (int i = 0; i < n; i++) { TreeMap<Integer, Integer> m = new TreeMap<>(); m.put(0, 0); hist.add(m); } }
    void set(int i, int v) { hist.get(i).put(snapId, v); }          // same snapshot overwrites
    int snap() { return snapId++; }
    int get(int i, int id) { return hist.get(i).floorEntry(id).getValue(); }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; SnapshotArray a = null;
        for (int k = 0; k < ops.length; k++) {
            if (ops[k].equals("SnapshotArray")) { a = new SnapshotArray(Integer.parseInt(args[k])); out[k] = "null"; }
            else if (ops[k].equals("snap")) out[k] = String.valueOf(a.snap());
            else {
                String[] p = args[k].split(","); int x = Integer.parseInt(p[0]), y = Integer.parseInt(p[1]);
                if (ops[k].equals("set")) { a.set(x, y); out[k] = "null"; } else out[k] = String.valueOf(a.get(x, y));
            }
            T.r("op", ops[k], "arg", args[k], "snapId", a.snapId, "hist", a.hist);
        }
        return out;
    }
}
