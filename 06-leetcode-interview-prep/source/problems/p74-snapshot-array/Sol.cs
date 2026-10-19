using System; using System.Collections.Generic;
// Snapshot Array - per-index list of (snapId, value); binary search on get.
public class SnapshotArray {
    public List<List<(int id, int val)>> hist = new(); public int snapId = 0;
    public SnapshotArray(int n) { for (int i = 0; i < n; i++) hist.Add(new List<(int, int)> { (0, 0) }); }
    public void Set(int i, int v) {
        var h = hist[i];
        if (h[^1].id == snapId) h[^1] = (snapId, v); else h.Add((snapId, v));
    }
    public int Snap() => snapId++;
    public int Get(int i, int id) {
        var h = hist[i]; int lo = 0, hi = h.Count - 1;                 // last entry with id <= query
        while (lo < hi) { int mid = (lo + hi + 1) / 2; if (h[mid].id <= id) lo = mid; else hi = mid - 1; }
        return h[lo].val;
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; SnapshotArray a = null;
        for (int k = 0; k < ops.Length; k++) {
            if (ops[k] == "SnapshotArray") { a = new SnapshotArray(int.Parse(args[k])); output[k] = "null"; }
            else if (ops[k] == "snap") output[k] = a.Snap().ToString();
            else {
                var p = args[k].Split(','); int x = int.Parse(p[0]), y = int.Parse(p[1]);
                if (ops[k] == "set") { a.Set(x, y); output[k] = "null"; } else output[k] = a.Get(x, y).ToString();
            }
            T.R("op", ops[k], "arg", args[k], "snapId", a.snapId);
        }
        return output;
    }
}
