// Debounce - (stable, count) state machine; flip after k disagreeing samples in a row.  O(n).
class Solution {
    public int[] debounce(int[] samples, int k) {
        int stable = 0, count = 0; int[] out = new int[samples.length];
        for (int t = 0; t < samples.length; t++) {
            if (samples[t] != stable) { if (++count >= k) { stable = samples[t]; count = 0; } }
            else count = 0;
            out[t] = stable;
            T.r("out", out, "t", t, "count", count, "stable", stable);
        }
        return out;
    }
}
