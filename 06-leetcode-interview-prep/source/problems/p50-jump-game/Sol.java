// Jump Game - greedy furthest reach.  O(n), O(1).
class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) return false;
            reach = Math.max(reach, i + nums[i]);
            T.r("nums", nums, "i", i, "reach", reach);
        }
        return true;
    }
}
