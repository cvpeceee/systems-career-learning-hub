// Validate BST - recursion passing down the allowed (lo, hi) range.  O(n) time, O(h) stack.
public class Solution {
    TreeNode root0;
    public bool IsValidBST(TreeNode root) { root0 = root; return Dfs(root, long.MinValue, long.MaxValue); }
    private bool Dfs(TreeNode node, long lo, long hi) {
        if (node == null) return true;                      // empty subtree is valid
        T.R("root", root0, "val", node.val, "lo", lo == long.MinValue ? "-inf" : (object)lo, "hi", hi == long.MaxValue ? "+inf" : (object)hi);
        if (node.val <= lo || node.val >= hi) return false; // violates an ancestor's limit
        return Dfs(node.left, lo, node.val)                 // left: tighten upper bound
            && Dfs(node.right, node.val, hi);               // right: raise lower bound
    }
}
