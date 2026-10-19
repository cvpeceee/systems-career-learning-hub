// Product Except Self - exclusive prefix product, then running suffix.  O(n) time, O(1) extra.
class Solution {
public:
    vector<int> productExceptSelf(vector<int> nums) {
        FN("productExceptSelf");
        int n = nums.size();
        vector<int> ans(n, 1);
        int pre = 1;                               // product of everything LEFT of i
        for (int i = 0; i < n; i++) {
            ans[i] = pre;                          // exclusive: write before multiplying nums[i] in
            pre *= nums[i];
            TR("nums", nums, "i", i, "pre", pre, "ans", ans);
        }
        int suf = 1;                               // product of everything RIGHT of i
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= suf;                         // left part * right part
            suf *= nums[i];
            TR("nums", nums, "i", i, "suf", suf, "ans", ans);
        }
        return ans;
    }
};
