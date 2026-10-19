// Validate BST - recursion passing down the allowed (lo, hi) range.  O(n) time, O(h) stack.
public class Solution {
    public bool IsValidBST(TreeNode root) => Dfs(root, long.MinValue, long.MaxValue);
    private bool Dfs(TreeNode node, long lo, long hi) {
        if (node == null) return true;                      // empty subtree is valid
        if (node.val <= lo || node.val >= hi) return false; // violates an ancestor's limit
        return Dfs(node.left, lo, node.val)                 // left: tighten upper bound
            && Dfs(node.right, node.val, hi);               // right: raise lower bound
    }
}
