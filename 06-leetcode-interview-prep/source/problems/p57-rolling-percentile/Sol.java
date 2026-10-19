import java.util.*;
// Rolling percentile - keep the window sorted (binary-search insert/erase), read rank ceil(p*m/100).
class Solution {
    static int lowerBound(List<Integer> a, int x) { int lo = 0, hi = a.size(); while (lo < hi) { int m = (lo + hi) >>> 1; if (a.get(m) < x) lo = m + 1; else hi = m; } return lo; }
    public int[] rollingPercentile(int[] lat, int w, int p) {
        List<Integer> win = new ArrayList<>(); int[] out = new int[lat.length];
        for (int i = 0; i < lat.length; i++) {
            if (i >= w) win.remove(lowerBound(win, lat[i - w]));          // remove(int index)
            win.add(lowerBound(win, lat[i]), lat[i]);
            int rank = Math.max(1, (p * win.size() + 99) / 100);
            out[i] = win.get(rank - 1);
            T.r("lat", lat, "i", i, "win", win, "rank", rank, "out", out);
        }
        return out;
    }
}
