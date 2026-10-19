// Counting bits - reuse the answer for i >> 1.  O(n).
class Solution {
public:
    vector<int> countBits(int n) {
        FN("countBits");
        vector<int> ans(n + 1, 0);
        for (int i = 1; i <= n; ++i) {
            ans[i] = ans[i >> 1] + (i & 1);   // bits of i without its last bit, plus that last bit
            TR("ans", ans, "i", i, "half", i >> 1, "lowbit", i & 1);
        }
        return ans;
    }
};
