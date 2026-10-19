// Permutations - backtracking with a used[] mask.  O(n * n!).
class Solution {
public:
    vector<vector<int>> res;
    void dfs(vector<int>& nums, vector<int>& path, vector<bool>& used) {
        FN("dfs");
        int depth = path.size();
        if (depth == (int)nums.size()) { res.push_back(path); TR("nums", nums, "depth", depth, "path", path, "res", res); return; }   // full row -> record a copy
        for (int i = 0; i < (int)nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true; path.push_back(nums[i]);          // choose
            TR("nums", nums, "i", i, "depth", depth, "path", path, "res", res);
            dfs(nums, path, used);                            // explore
            path.pop_back(); used[i] = false;                 // un-choose (backtrack)
        }
    }
    vector<vector<int>> permute(vector<int> nums) {
        FN("permute");
        vector<int> path; vector<bool> used(nums.size(), false);
        dfs(nums, path, used);
        return res;
    }
};
