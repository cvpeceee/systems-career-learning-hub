using System.Collections.Generic;
// Kth smallest in BST - iterative in-order with an explicit stack.  O(h + k).
public class Solution {
    public int KthSmallest(TreeNode root, int k) {
        var s = new Stack<TreeNode>(); var cur = root;
        while (cur != null || s.Count > 0) {
            while (cur != null) { s.Push(cur); cur = cur.left; }
            cur = s.Pop();
            if (--k == 0) return cur.val;
            cur = cur.right;
        }
        return -1;
    }
}
