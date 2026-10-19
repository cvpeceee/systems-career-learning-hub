using System;
// Windowed hit counter - ring of W per-second buckets.  O(W) memory regardless of traffic.
public class HitCounter {
    private readonly int W; private readonly long[] times; private readonly int[] counts;
    public HitCounter(int w) { W = w; times = new long[w]; counts = new int[w]; Array.Fill(times, -1L); }
    public void Hit(long t) {
        int i = (int)(t % W);
        if (times[i] != t) { times[i] = t; counts[i] = 0; }   // recycle stale bucket
        counts[i]++;
    }
    public int GetHits(long t) {
        int total = 0;
        for (int i = 0; i < W; i++) if (times[i] >= 0 && t - times[i] < W) total += counts[i];
        return total;
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; HitCounter h = null;
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "HitCounter") { h = new HitCounter(int.Parse(args[i])); output[i] = "null"; }
            else if (ops[i] == "hit") { h.Hit(long.Parse(args[i])); output[i] = "null"; }
            else output[i] = h.GetHits(long.Parse(args[i])).ToString();
        }
        return output;
    }
}
