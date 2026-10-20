import java.util.*;
// Nearest POI - uniform grid + ring search with a proven stopping rule.
class Solution {
    static long key(long x, long y) { return x * 4000003L + y; }
    public int[] nearest(int[][] pois, int[][] queries, int cell) {
        Map<Long, List<Integer>> grid = new HashMap<>();
        long minx = Long.MAX_VALUE, maxx = Long.MIN_VALUE, miny = Long.MAX_VALUE, maxy = Long.MIN_VALUE;
        for (int i = 0; i < pois.length; i++) {
            long cx = Math.floorDiv(pois[i][0], cell), cy = Math.floorDiv(pois[i][1], cell);
            grid.computeIfAbsent(key(cx, cy), k -> new ArrayList<>()).add(i);
            minx = Math.min(minx, cx); maxx = Math.max(maxx, cx); miny = Math.min(miny, cy); maxy = Math.max(maxy, cy);
        }
        int[] out = new int[queries.length];
        for (int k = 0; k < queries.length; k++) {
            int[] q = queries[k];
            long qx = Math.floorDiv(q[0], cell), qy = Math.floorDiv(q[1], cell);
            long maxr = Math.max(Math.max(Math.abs(qx - minx), Math.abs(qx - maxx)), Math.max(Math.abs(qy - miny), Math.abs(qy - maxy)));
            long best = Long.MAX_VALUE; int bi = -1;
            for (long r = 0; r <= maxr; r++) {
                for (long dx = -r; dx <= r; dx++)
                    for (long dy = -r; dy <= r; dy++) {
                        if (Math.max(Math.abs(dx), Math.abs(dy)) != r) continue;
                        List<Integer> c = grid.get(key(qx + dx, qy + dy));
                        if (c == null) continue;
                        for (int i : c) {
                            long ddx = pois[i][0] - q[0], ddy = pois[i][1] - q[1], d = ddx * ddx + ddy * ddy;
                            if (d < best || (d == best && i < bi)) { best = d; bi = i; }
                        }
                    }
                long reach = r * cell;
                T.r("r", r, "best", best, "bi", bi);
                if (bi >= 0 && best < reach * reach) break;
            }
            out[k] = bi;
        }
        return out;
    }
}
