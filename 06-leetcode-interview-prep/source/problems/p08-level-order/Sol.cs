using System.Collections.Generic;
// Level order traversal - BFS with a queue, one level at a time.  O(n).
public class Solution {
    public IList<IList<int>> LevelOrder(TreeNode root) {
        var res = new List<IList<int>>();
        if (root == null) return res;
        var q = new Queue<TreeNode>();
        q.Enqueue(root);
        while (q.Count > 0) {
            int size = q.Count;                  // snapshot: this level's node count
            var level = new List<int>();
            for (int k = 0; k < size; k++) {
                var n = q.Dequeue();
                level.Add(n.val);
                if (n.left != null) q.Enqueue(n.left);
                if (n.right != null) q.Enqueue(n.right);
            }
            res.Add(level);
        }
        return res;
    }
}
