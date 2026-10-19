using System;
// House Robber - rolling DP: best = max(skip, rob this + best two back).  O(n), O(1).
public class Solution {
    public int Rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int i = 0; i < nums.Length; i++) {
            int cur = Math.Max(prev1, prev2 + nums[i]);
            prev2 = prev1; prev1 = cur;
            T.R("nums", nums, "i", i, "prev2", prev2, "prev1", prev1);
        }
        return prev1;
    }
}
