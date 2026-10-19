// Validate BST - recursion passing down the allowed (lo, hi) range.  O(n) time, O(h) stack.
class Solution {
    public boolean isValidBST(TreeNode root) {
        return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE);   // long bounds avoid int edge cases
    }
    private boolean dfs(TreeNode node, long lo, long hi) {
        if (node == null) return true;                      // empty subtree is valid
        if (node.val <= lo || node.val >= hi) return false; // violates an ancestor's limit
        return dfs(node.left, lo, node.val)                 // left: tighten upper bound
            && dfs(node.right, node.val, hi);               // right: raise lower bound
    }
}
