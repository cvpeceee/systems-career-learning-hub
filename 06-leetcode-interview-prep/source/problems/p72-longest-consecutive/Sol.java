import java.util.*;
// Longest Consecutive Sequence - hash set, only walk from run starts.  O(n).
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> have = new HashSet<>();
        for (int x : nums) have.add(x);
        int best = 0;
        for (int i = 0; i < nums.length; i++) {
            int x = nums[i];
            if (have.contains(x - 1)) continue;
            int len = 1;
            while (have.contains(x + len)) len++;
            best = Math.max(best, len);
            T.r("nums", nums, "i", i, "x", x, "len", len, "best", best);
        }
        return best;
    }
}
