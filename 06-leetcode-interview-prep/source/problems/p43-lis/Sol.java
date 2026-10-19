import java.util.*;
// LIS - patience sorting with binary search.  O(n log n).
class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length]; int size = 0;
        for (int x : nums) {
            int lo = 0, hi = size;                       // lower_bound in tails[0..size)
            while (lo < hi) { int mid = (lo + hi) >>> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}
