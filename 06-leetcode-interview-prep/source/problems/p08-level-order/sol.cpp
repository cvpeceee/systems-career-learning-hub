// Level order traversal - BFS with a queue, one "floor" at a time.  O(n).
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        FN("levelOrder");
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q;
        q.push(root);
        vector<int> waiting{root->val};                // values in the queue (for the visualizer)
        TR("root", root, "waiting", waiting, "res", res);
        while (!q.empty()) {
            int size = q.size();                       // nodes on THIS level
            vector<int> level;
            for (int k = 0; k < size; ++k) {
                TreeNode* n = q.front(); q.pop();
                waiting.erase(waiting.begin());
                level.push_back(n->val);
                if (n->left)  { q.push(n->left);  waiting.push_back(n->left->val); }
                if (n->right) { q.push(n->right); waiting.push_back(n->right->val); }
                TR("root", root, "val", n->val, "size", size, "level", level, "waiting", waiting, "res", res);
            }
            res.push_back(level);                      // floor finished
            TR("root", root, "waiting", waiting, "res", res);
        }
        return res;
    }
};
