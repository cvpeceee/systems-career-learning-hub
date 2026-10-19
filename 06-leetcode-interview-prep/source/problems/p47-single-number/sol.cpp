// Single Number - XOR fold: pairs cancel (a^a = 0), the single remains.  O(n), O(1).
class Solution {
public:
    int singleNumber(vector<int> nums) {
        FN("singleNumber");
        int x = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            x ^= nums[i];                  // flip the bits of nums[i]
            TR("nums", nums, "i", i, "x", x);
        }
        return x;
    }
};
