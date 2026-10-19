using System;
// Debounce - (stable, count) state machine; flip after k disagreeing samples in a row.  O(n).
public class Solution {
    public int[] Debounce(int[] samples, int k) {
        int stable = 0, count = 0; var output = new int[samples.Length];
        for (int t = 0; t < samples.Length; t++) {
            if (samples[t] != stable) { if (++count >= k) { stable = samples[t]; count = 0; } }
            else count = 0;
            output[t] = stable;
            T.R("out", output, "t", t, "count", count, "stable", stable);
        }
        return output;
    }
}
