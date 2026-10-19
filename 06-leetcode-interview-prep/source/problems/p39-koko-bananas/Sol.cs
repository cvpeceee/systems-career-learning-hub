using System.Linq;
// Koko Eating Bananas - binary search the smallest feasible speed.  O(n log max).
public class Solution {
    public int MinEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = piles.Max();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long hours = 0;
            foreach (var p in piles) hours += (p + (long)mid - 1) / mid;   // ceil
            T.R("piles", piles, "lo", lo, "mid", mid, "hi", hi, "hours", hours);
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}
