using System; using System.Collections.Generic;
// Longest Consecutive Sequence - hash set, only walk from run starts.  O(n).
public class Solution {
    public int LongestConsecutive(int[] nums) {
        var have = new HashSet<int>(nums);
        int best = 0;
        for (int i = 0; i < nums.Length; i++) {
            int x = nums[i];
            if (have.Contains(x - 1)) continue;
            int len = 1;
            while (have.Contains(x + len)) len++;
            best = Math.Max(best, len);
            T.R("nums", nums, "i", i, "x", x, "len", len, "best", best);
        }
        return best;
    }
}
