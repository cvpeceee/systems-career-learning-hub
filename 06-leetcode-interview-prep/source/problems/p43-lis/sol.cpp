// LIS - patience sorting: tails[k] = smallest tail of an increasing run of length k+1.  O(n log n).
class Solution {
public:
    int lengthOfLIS(vector<int> nums) {
        FN("lengthOfLIS");
        vector<int> tails;                                             // always sorted
        for (int i = 0; i < (int)nums.size(); i++) {
            int pos = lower_bound(tails.begin(), tails.end(), nums[i]) - tails.begin();   // leftmost pile >= x
            if (pos == (int)tails.size()) tails.push_back(nums[i]);   // new pile: LIS grows
            else tails[pos] = nums[i];                                 // smaller tail = more room later
            TR("nums", nums, "i", i, "pos", pos, "tails", tails);
        }
        return tails.size();
    }
};
