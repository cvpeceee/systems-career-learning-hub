// Subsets - classic backtracking (choose / explore / un-choose).  O(n * 2^n).
class Solution {
    vector<vector<int>> res;
    vector<int> path;                                  // the "suitcase"
    void bt(const vector<int>& nums, int start) {
        FN("bt");
        res.push_back(path);                           // every node of the recursion tree is a subset (copy!)
        TR("nums", nums, "start", start, "path", path, "res", res);
        for (int i = start; i < (int)nums.size(); ++i) {
            path.push_back(nums[i]);                   // choose
            TR("nums", nums, "start", start, "i", i, "path", path, "res", res);
            bt(nums, i + 1);                           // explore (only later items -> no duplicates)
            path.pop_back();                           // un-choose (backtrack)
            TR("nums", nums, "start", start, "i", i, "path", path, "res", res);
        }
    }
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        FN("subsets");
        bt(nums, 0);
        return res;
    }
};
