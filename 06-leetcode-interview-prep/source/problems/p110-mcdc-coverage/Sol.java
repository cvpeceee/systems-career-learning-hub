import java.util.*;
// MC/DC coverage - bitmask each row; the independence partner for condition c is mask ^ (1<<c).  O(R*n).
class Solution {
    public int[] mcdc(int n, int[][] rows) {
        Map<Integer, Integer> outcome = new HashMap<>();
        for (int[] r : rows) {
            int m = 0;
            for (int k = 0; k < n; k++) if (r[k] != 0) m |= 1 << k;
            outcome.put(m, r[n]);
        }
        int[] shown = new int[n];
        for (int c = 0; c < n; c++) {
            for (Map.Entry<Integer, Integer> e : outcome.entrySet()) {
                Integer p = outcome.get(e.getKey() ^ (1 << c));
                if (p != null && !p.equals(e.getValue())) { shown[c] = 1; break; }
            }
            T.r("c", c, "shown", shown);
        }
        return shown;
    }
}
