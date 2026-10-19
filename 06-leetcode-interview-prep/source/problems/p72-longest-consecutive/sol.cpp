// Longest Consecutive Sequence - hash set, only walk from run starts.  O(n).
class Solution {
public:
    int longestConsecutive(vector<int> nums) {
        FN("longestConsecutive");
        unordered_set<int> have(nums.begin(), nums.end());
        int best = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            int x = nums[i];
            if (have.count(x - 1)) continue;          // not the start of a run
            int len = 1;
            while (have.count(x + len)) len++;          // walk right
            best = max(best, len);
            TR("nums", nums, "i", i, "x", x, "len", len, "best", best);
        }
        return best;
    }
};
