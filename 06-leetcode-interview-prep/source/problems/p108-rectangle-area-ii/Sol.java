import java.util.*;
// Rectangle Area II - strip sweep over distinct x edges, merge y intervals per strip.  O(n^2 log n).
class Solution {
    public int rectangleArea(int[][] rects) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int[] r : rects) { set.add(r[0]); set.add(r[2]); }
        int[] xs = set.stream().mapToInt(Integer::intValue).toArray();
        long area = 0;
        for (int i = 0; i + 1 < xs.length; i++) {
            List<int[]> ys = new ArrayList<>();
            for (int[] r : rects) if (r[0] <= xs[i] && r[2] >= xs[i + 1]) ys.add(new int[]{r[1], r[3]});
            ys.sort((a, b) -> Integer.compare(a[0], b[0]));
            long cov = 0, s = -1, e = -1;
            for (int[] y : ys) {
                if (y[0] > e) { cov += e - s; s = y[0]; e = y[1]; }
                else e = Math.max(e, y[1]);
            }
            cov += e - s;
            area += cov * (long) (xs[i + 1] - xs[i]);
            T.r("xs", xs, "i", i, "cov", cov, "area", area);
        }
        return (int) (area % 1000000007L);
    }
}
