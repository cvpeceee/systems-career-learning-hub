import java.util.*;
// Subarray Sum Equals K - prefix sums + count of earlier prefixes.  O(n).
class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> seen = new TreeMap<>(); seen.put(0, 1);
        int s = 0, count = 0;
        for (int i = 0; i < nums.length; i++) {
            s += nums[i];
            count += seen.getOrDefault(s - k, 0);
            seen.merge(s, 1, Integer::sum);
            T.r("nums", nums, "i", i, "s", s, "count", count, "seen", seen);
        }
        return count;
    }
}
