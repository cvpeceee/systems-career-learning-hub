// Search in rotated sorted array - binary search on the sorted half.  O(log n).
class Solution {
public:
    int search(vector<int>& nums, int target) {
        FN("search");
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;                 // overflow-safe midpoint
            TR("nums", nums, "target", target, "lo", lo, "mid", mid, "hi", hi);
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {                  // left half [lo..mid] is in order
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;   // target inside it
                else lo = mid + 1;
            } else {                                      // right half [mid..hi] is in order
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
};
