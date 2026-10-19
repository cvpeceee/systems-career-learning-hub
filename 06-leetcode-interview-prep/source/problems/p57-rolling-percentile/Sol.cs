using System; using System.Collections.Generic;
// Rolling percentile - keep the window sorted (binary-search insert/erase), read rank ceil(p*m/100).
public class Solution {
    static int LowerBound(List<int> a, int x) { int lo = 0, hi = a.Count; while (lo < hi) { int m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; } return lo; }
    public int[] RollingPercentile(int[] lat, int w, int p) {
        var win = new List<int>(); var output = new int[lat.Length];
        for (int i = 0; i < lat.Length; i++) {
            if (i >= w) win.RemoveAt(LowerBound(win, lat[i - w]));
            win.Insert(LowerBound(win, lat[i]), lat[i]);
            int rank = Math.Max(1, (p * win.Count + 99) / 100);
            output[i] = win[rank - 1];
            T.R("lat", lat, "i", i, "win", win, "rank", rank, "out", output);
        }
        return output;
    }
}
