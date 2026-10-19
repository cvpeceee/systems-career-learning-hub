using System; using System.Collections.Generic;
// Set-associative cache simulator - per-set LRU list of tags.  O(n * W).
public class Solution {
    public int Simulate(int S, int W, int B, int[] addrs) {
        var sets = new List<LinkedList<int>>();
        for (int s = 0; s < S; s++) sets.Add(new LinkedList<int>());
        int hits = 0;
        for (int i = 0; i < addrs.Length; i++) {
            int line = addrs[i] / B, set = line % S, tag = line / S;
            var d = sets[set];
            if (d.Remove(tag)) hits++;
            else if (d.Count == W) d.RemoveLast();
            d.AddFirst(tag);
            T.R("sets", sets, "i", i, "set", set, "tag", tag, "hits", hits);
        }
        return hits;
    }
}
