import java.util.*;
// Vertical order - BFS carrying a column index; map col -> values.  O(n).
class Solution {
    public List<List<Integer>> verticalOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        TreeMap<Integer, List<Integer>> cols = new TreeMap<>();
        Deque<TreeNode> q = new ArrayDeque<>(); Deque<Integer> qc = new ArrayDeque<>();
        q.add(root); qc.add(0);
        while (!q.isEmpty()) {
            TreeNode n = q.poll(); int c = qc.poll();
            cols.computeIfAbsent(c, k -> new ArrayList<>()).add(n.val);
            T.r("root", root, "val", n.val, "col", c, "cols", cols);
            if (n.left != null) { q.add(n.left); qc.add(c - 1); }
            if (n.right != null) { q.add(n.right); qc.add(c + 1); }
        }
        res.addAll(cols.values());
        return res;
    }
}
