// Single Number - XOR fold: pairs cancel (a^a = 0), the single remains.  O(n), O(1).
class Solution {
    public int singleNumber(int[] nums) {
        int x = 0;
        for (int i = 0; i < nums.length; i++) {
            x ^= nums[i];
            T.r("nums", nums, "i", i, "x", x);
        }
        return x;
    }
}
