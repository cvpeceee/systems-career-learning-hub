using System; using System.Collections.Generic;
// Buffer pool with CLOCK (second-chance) replacement.  O(1) amortized per request.
public class Solution {
    public int[] ClockPool(int n, int[] reqs) {
        var frames = new int[n]; var refBit = new int[n]; Array.Fill(frames, -1);
        var where = new Dictionary<int, int>(); int hand = 0;
        foreach (int page in reqs) {
            if (where.TryGetValue(page, out int f)) refBit[f] = 1;
            else {
                while (frames[hand] != -1 && refBit[hand] == 1) { refBit[hand] = 0; hand = (hand + 1) % n; }
                if (frames[hand] != -1) where.Remove(frames[hand]);
                frames[hand] = page; refBit[hand] = 1; where[page] = hand;
                hand = (hand + 1) % n;
            }
            T.R("frames", frames, "ref", refBit, "hand", hand, "page", page);
        }
        return frames;
    }
}
