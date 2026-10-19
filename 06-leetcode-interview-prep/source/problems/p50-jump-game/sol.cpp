// Jump Game - greedy furthest reach.  O(n), O(1).
class Solution {
public:
    bool canJump(vector<int> nums) {
        FN("canJump");
        int reach = 0;                               // furthest index reachable so far
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > reach) return false;             // this spot is unreachable -> stuck
            reach = max(reach, i + nums[i]);
            TR("nums", nums, "i", i, "reach", reach);
            if (reach >= (int)nums.size() - 1) return true;
        }
        return true;
    }
};
