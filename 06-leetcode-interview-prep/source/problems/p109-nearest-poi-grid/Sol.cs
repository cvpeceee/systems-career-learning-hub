using System; using System.Collections.Generic;
// Nearest POI - uniform grid + ring search with a proven stopping rule.
public class Solution {
    static long FloorDiv(long a, long b) { return a >= 0 ? a / b : -((-a + b - 1) / b); }
    public int[] Nearest(int[][] pois, int[][] queries, int cell) {
        var grid = new Dictionary<(long, long), List<int>>();
        long minx = long.MaxValue, maxx = long.MinValue, miny = long.MaxValue, maxy = long.MinValue;
        for (int i = 0; i < pois.Length; i++) {
            long cx = FloorDiv(pois[i][0], cell), cy = FloorDiv(pois[i][1], cell);
            if (!grid.TryGetValue((cx, cy), out var l)) grid[(cx, cy)] = l = new List<int>();
            l.Add(i);
            minx = Math.Min(minx, cx); maxx = Math.Max(maxx, cx); miny = Math.Min(miny, cy); maxy = Math.Max(maxy, cy);
        }
        var output = new int[queries.Length];
        for (int k = 0; k < queries.Length; k++) {
            var q = queries[k];
            long qx = FloorDiv(q[0], cell), qy = FloorDiv(q[1], cell);
            long maxr = Math.Max(Math.Max(Math.Abs(qx - minx), Math.Abs(qx - maxx)), Math.Max(Math.Abs(qy - miny), Math.Abs(qy - maxy)));
            long best = long.MaxValue; int bi = -1;
            for (long r = 0; r <= maxr; r++) {
                for (long dx = -r; dx <= r; dx++)
                    for (long dy = -r; dy <= r; dy++) {
                        if (Math.Max(Math.Abs(dx), Math.Abs(dy)) != r) continue;
                        if (!grid.TryGetValue((qx + dx, qy + dy), out var c)) continue;
                        foreach (int i in c) {
                            long ddx = pois[i][0] - q[0], ddy = pois[i][1] - q[1], d = ddx * ddx + ddy * ddy;
                            if (d < best || (d == best && i < bi)) { best = d; bi = i; }
                        }
                    }
                long reach = r * cell;
                T.R("r", r, "best", best, "bi", bi);
                if (bi >= 0 && best < reach * reach) break;
            }
            output[k] = bi;
        }
        return output;
    }
}
