// LCA of a binary tree - post-order: each subtree reports whether it saw p or q.  O(n) time, O(h) stack.
class Solution {
    TreeNode root0;
    TreeNode dfs(TreeNode node, int p, int q) {
        if (node == null) return null;
        int val = node.val;
        T.r("root", root0, "val", val);
        if (val == p || val == q) return node;          // found one: report it upward
        TreeNode L = dfs(node.left, p, q), R = dfs(node.right, p, q);
        T.r("root", root0, "val", val, "left", L == null ? -1 : L.val, "right", R == null ? -1 : R.val);
        if (L != null && R != null) return node;        // split point = LCA
        return L != null ? L : R;
    }
    public int lowestCommonAncestor(TreeNode root, int p, int q) { root0 = root; return dfs(root, p, q).val; }
}
