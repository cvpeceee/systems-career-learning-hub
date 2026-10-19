// Product Except Self - exclusive prefix product, then running suffix.  O(n) time, O(1) extra.
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length; int[] ans = new int[n];
        int pre = 1;
        for (int i = 0; i < n; i++) {
            ans[i] = pre;                       // product of everything left of i
            pre *= nums[i];
            T.r("nums", nums, "i", i, "pre", pre, "ans", ans);
        }
        int suf = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= suf;                      // times product of everything right of i
            suf *= nums[i];
            T.r("nums", nums, "i", i, "suf", suf, "ans", ans);
        }
        return ans;
    }
}
