// LCA of a binary tree - post-order: each subtree reports whether it saw p or q.  O(n) time, O(h) stack.
class Solution {
public:
    TreeNode* dfs(TreeNode* node, int p, int q) {
        FN("dfs");
        if (!node) return nullptr;
        int val = node->val;
        TR("root", root0, "val", val);
        if (val == p || val == q) return node;       // found one: report it upward
        TreeNode* L = dfs(node->left, p, q);
        TreeNode* R = dfs(node->right, p, q);
        int left = L ? L->val : -1, right = R ? R->val : -1;
        TR("root", root0, "val", val, "left", left, "right", right);
        if (L && R) return node;                     // p and q on different sides -> I am the LCA
        return L ? L : R;                            // pass up whatever was found (or null)
    }
    TreeNode* root0 = nullptr;
    int lowestCommonAncestor(TreeNode* root, int p, int q) {
        FN("lowestCommonAncestor");
        root0 = root;
        return dfs(root, p, q)->val;
    }
};
