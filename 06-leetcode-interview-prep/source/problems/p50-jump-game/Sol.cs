using System;
// Jump Game - greedy furthest reach.  O(n), O(1).
public class Solution {
    public bool CanJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (i > reach) return false;
            reach = Math.Max(reach, i + nums[i]);
            T.R("nums", nums, "i", i, "reach", reach);
        }
        return true;
    }
}
