// Two Sum - one pass with a hash map.  Time O(n), Space O(n).
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        FN("twoSum");
        unordered_map<int, int> seen;            // value -> index where we saw it (the "coat rack")
        TR("nums", nums, "target", target, "seen", seen);
        for (int i = 0; i < (int)nums.size(); ++i) {
            long long need = (long long)target - nums[i];   // the partner we still need (64-bit: no overflow)
            TR("nums", nums, "target", target, "i", i, "need", need, "seen", seen);
            auto it = seen.find((int)need);      // O(1) average lookup
            if (need >= INT_MIN && need <= INT_MAX && it != seen.end()) {
                TR("nums", nums, "i", i, "need", need, "seen", seen, "_note", "found partner!");
                return {it->second, i};          // partner came first, so its index is smaller
            }
            seen[nums[i]] = i;                   // check BEFORE insert so x never pairs with itself
            TR("nums", nums, "target", target, "i", i, "need", need, "seen", seen);
        }
        return {};                               // unreachable when an answer is guaranteed
    }
};
