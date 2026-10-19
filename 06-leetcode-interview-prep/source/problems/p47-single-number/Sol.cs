// Single Number - XOR fold: pairs cancel (a^a = 0), the single remains.  O(n), O(1).
public class Solution {
    public int SingleNumber(int[] nums) {
        int x = 0;
        for (int i = 0; i < nums.Length; i++) {
            x ^= nums[i];
            T.R("nums", nums, "i", i, "x", x);
        }
        return x;
    }
}
