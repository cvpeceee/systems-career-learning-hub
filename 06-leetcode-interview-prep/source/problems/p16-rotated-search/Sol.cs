// Search in rotated sorted array - binary search on the sorted half.  O(log n).
public class Solution {
    public int Search(int[] nums, int target) {
        int lo = 0, hi = nums.Length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;                       // overflow-safe
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                        // left half sorted
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1;
            } else {                                            // right half sorted
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }
}
