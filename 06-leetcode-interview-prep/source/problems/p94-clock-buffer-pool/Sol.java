import java.util.*;
// Buffer pool with CLOCK (second-chance) replacement.  O(1) amortized per request.
class Solution {
    public int[] clockPool(int n, int[] reqs) {
        int[] frames = new int[n], ref = new int[n]; Arrays.fill(frames, -1);
        Map<Integer, Integer> where = new HashMap<>(); int hand = 0;
        for (int page : reqs) {
            if (where.containsKey(page)) ref[where.get(page)] = 1;
            else {
                while (frames[hand] != -1 && ref[hand] == 1) { ref[hand] = 0; hand = (hand + 1) % n; }
                if (frames[hand] != -1) where.remove(frames[hand]);
                frames[hand] = page; ref[hand] = 1; where.put(page, hand);
                hand = (hand + 1) % n;
            }
            T.r("frames", frames, "ref", ref, "hand", hand, "page", page);
        }
        return frames;
    }
}
