// LIS - patience sorting with binary search.  O(n log n).
public class Solution {
    public int LengthOfLIS(int[] nums) {
        var tails = new int[nums.Length]; int size = 0;
        foreach (var x in nums) {
            int lo = 0, hi = size;                       // lower_bound in tails[0..size)
            while (lo < hi) { int mid = (lo + hi) >> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}
