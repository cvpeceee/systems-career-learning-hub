import java.util.*;
// Windowed hit counter - ring of W per-second buckets.  O(W) memory regardless of traffic.
class HitCounter {
    private final int W; private final long[] times; private final int[] counts;
    HitCounter(int w) { W = w; times = new long[w]; counts = new int[w]; Arrays.fill(times, -1); }
    void hit(long t) {
        int i = (int) (t % W);
        if (times[i] != t) { times[i] = t; counts[i] = 0; }   // recycle stale bucket
        counts[i]++;
    }
    int getHits(long t) {
        int total = 0;
        for (int i = 0; i < W; i++) if (times[i] >= 0 && t - times[i] < W) total += counts[i];
        return total;
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; HitCounter h = null;
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("HitCounter")) { h = new HitCounter(Integer.parseInt(args[i])); out[i] = "null"; }
            else if (ops[i].equals("hit")) { h.hit(Long.parseLong(args[i])); out[i] = "null"; }
            else out[i] = String.valueOf(h.getHits(Long.parseLong(args[i])));
        }
        return out;
    }
}
