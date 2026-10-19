import java.util.*;
// Set-associative cache simulator - per-set LRU list of tags.  O(n * W).
class Solution {
    public int simulate(int S, int W, int B, int[] addrs) {
        List<LinkedList<Integer>> sets = new ArrayList<>();
        for (int s = 0; s < S; s++) sets.add(new LinkedList<>());
        int hits = 0;
        for (int i = 0; i < addrs.length; i++) {
            int line = addrs[i] / B, set = line % S, tag = line / S;
            LinkedList<Integer> d = sets.get(set);
            if (d.remove((Integer) tag)) hits++;
            else if (d.size() == W) d.removeLast();
            d.addFirst(tag);
            T.r("sets", sets, "i", i, "set", set, "tag", tag, "hits", hits);
        }
        return hits;
    }
}
