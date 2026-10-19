// House Robber - rolling DP: best = max(skip, rob this + best two back).  O(n), O(1).
class Solution {
public:
    int rob(vector<int> nums) {
        FN("rob");
        int prev2 = 0, prev1 = 0;                      // best up to i-2, best up to i-1
        vector<int> best;
        for (int i = 0; i < (int)nums.size(); i++) {
            int cur = max(prev1, prev2 + nums[i]);     // skip house i  vs  rob house i
            prev2 = prev1; prev1 = cur;
            best.push_back(cur);
            TR("nums", nums, "i", i, "prev2", prev2, "prev1", prev1, "best", best);
        }
        return prev1;
    }
};
