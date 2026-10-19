import java.util.*;
// Kth smallest in BST - iterative in-order with an explicit stack.  O(h + k).
class Solution {
    public int kthSmallest(TreeNode root, int k) {
        ArrayDeque<TreeNode> s = new ArrayDeque<>(); TreeNode cur = root;
        while (cur != null || !s.isEmpty()) {
            while (cur != null) { s.push(cur); cur = cur.left; }
            cur = s.pop();
            if (--k == 0) return cur.val;
            cur = cur.right;
        }
        return -1;
    }
}
