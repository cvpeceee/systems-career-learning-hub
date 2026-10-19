using System; using System.Collections.Generic;
// Subarray Sum Equals K - prefix sums + count of earlier prefixes.  O(n).
public class Solution {
    public int SubarraySum(int[] nums, int k) {
        var seen = new SortedDictionary<int, int> { [0] = 1 };
        int s = 0, count = 0;
        for (int i = 0; i < nums.Length; i++) {
            s += nums[i];
            if (seen.TryGetValue(s - k, out int c)) count += c;
            seen[s] = seen.GetValueOrDefault(s) + 1;
            T.R("nums", nums, "i", i, "s", s, "count", count, "seen", seen);
        }
        return count;
    }
}
