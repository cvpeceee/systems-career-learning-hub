// Subarray Sum Equals K - prefix sums + count of earlier prefixes.  O(n).
class Solution {
public:
    int subarraySum(vector<int> nums, int k) {
        FN("subarraySum");
        unordered_map<int, int> seen{{0, 1}};   // empty prefix
        int s = 0, count = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            s += nums[i];
            if (seen.count(s - k)) count += seen[s - k];   // earlier stops at reading s-k
            seen[s]++;
            map<int, int> view(seen.begin(), seen.end());
            TR("nums", nums, "i", i, "s", s, "count", count, "seen", view);
        }
        return count;
    }
};
