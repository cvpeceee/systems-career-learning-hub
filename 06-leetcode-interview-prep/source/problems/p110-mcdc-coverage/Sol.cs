using System; using System.Collections.Generic;
// MC/DC coverage - bitmask each row; the independence partner for condition c is mask ^ (1<<c).  O(R*n).
public class Solution {
    public int[] Mcdc(int n, int[][] rows) {
        var outcome = new Dictionary<int, int>();
        foreach (var r in rows) {
            int m = 0;
            for (int k = 0; k < n; k++) if (r[k] != 0) m |= 1 << k;
            outcome[m] = r[n];
        }
        var shown = new int[n];
        for (int c = 0; c < n; c++) {
            foreach (var kv in outcome) {
                if (outcome.TryGetValue(kv.Key ^ (1 << c), out int p) && p != kv.Value) { shown[c] = 1; break; }
            }
            T.R("c", c, "shown", shown);
        }
        return shown;
    }
}
