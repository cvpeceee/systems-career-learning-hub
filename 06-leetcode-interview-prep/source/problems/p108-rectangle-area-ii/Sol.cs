using System; using System.Collections.Generic; using System.Linq;
// Rectangle Area II - strip sweep over distinct x edges, merge y intervals per strip.  O(n^2 log n).
public class Solution {
    public int RectangleArea(int[][] rects) {
        int[] xs = rects.SelectMany(r => new[] { r[0], r[2] }).Distinct().OrderBy(v => v).ToArray();
        long area = 0;
        for (int i = 0; i + 1 < xs.Length; i++) {
            var ys = new List<(int s, int e)>();
            foreach (var r in rects) if (r[0] <= xs[i] && r[2] >= xs[i + 1]) ys.Add((r[1], r[3]));
            ys.Sort((a, b) => a.s.CompareTo(b.s));
            long cov = 0, s = -1, e = -1;
            foreach (var y in ys) {
                if (y.s > e) { cov += e - s; s = y.s; e = y.e; }
                else e = Math.Max(e, y.e);
            }
            cov += e - s;
            area += cov * (long)(xs[i + 1] - xs[i]);
            T.R("xs", xs, "i", i, "cov", cov, "area", area);
        }
        return (int)(area % 1000000007L);
    }
}
