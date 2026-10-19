// Vertical order - BFS carrying a column index; map col -> values.  O(n).
class Solution {
public:
    vector<vector<int>> verticalOrder(TreeNode* root) {
        FN("verticalOrder");
        vector<vector<int>> res;
        if (!root) return res;
        map<int, vector<int>> cols;                       // ordered by column
        queue<pair<TreeNode*, int>> q; q.push({root, 0});
        while (!q.empty()) {
            auto [n, c] = q.front(); q.pop();
            cols[c].push_back(n->val);                     // BFS order = top to bottom, left to right
            TR("root", root, "val", n->val, "col", c, "cols", cols);
            if (n->left) q.push({n->left, c - 1});
            if (n->right) q.push({n->right, c + 1});
        }
        for (auto& kv : cols) res.push_back(kv.second);
        return res;
    }
};
