using System; using System.Collections.Generic;
// Vertical order - BFS carrying a column index; map col -> values.  O(n).
public class Solution {
    public IList<IList<int>> VerticalOrder(TreeNode root) {
        var res = new List<IList<int>>();
        if (root == null) return res;
        var cols = new SortedDictionary<int, List<int>>();
        var q = new Queue<(TreeNode, int)>(); q.Enqueue((root, 0));
        while (q.Count > 0) {
            var (n, c) = q.Dequeue();
            if (!cols.ContainsKey(c)) cols[c] = new List<int>();
            cols[c].Add(n.val);
            T.R("root", root, "val", n.val, "col", c, "cols", cols);
            if (n.left != null) q.Enqueue((n.left, c - 1));
            if (n.right != null) q.Enqueue((n.right, c + 1));
        }
        foreach (var kv in cols) res.Add(kv.Value);
        return res;
    }
}
