// Koko Eating Bananas - binary search the smallest feasible speed.  O(n log max).
class Solution {
public:
    int minEatingSpeed(vector<int> piles, int h) {
        FN("minEatingSpeed");
        int lo = 1, hi = *max_element(piles.begin(), piles.end());   // answer lives in [lo, hi]
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + (long long)mid - 1) / mid; // ceil(p / mid)
            TR("piles", piles, "lo", lo, "mid", mid, "hi", hi, "hours", hours);
            if (hours <= h) hi = mid;      // fast enough: maybe slower also works
            else lo = mid + 1;             // too slow
        }
        return lo;
    }
};
