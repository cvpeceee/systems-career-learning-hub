using System.Collections.Generic;
// Clone Graph - BFS with a map original->clone.  O(V+E).
public class GNode { public int val; public List<GNode> nb = new List<GNode>(); public GNode(int v) { val = v; } }
public class Solution {
    public int[][] CloneGraph(int[][] adj) {
        int n = adj.Length; var orig = new GNode[n];
        for (int i = 0; i < n; i++) orig[i] = new GNode(i + 1);
        for (int i = 0; i < n; i++) foreach (var j in adj[i]) orig[i].nb.Add(orig[j - 1]);
        var copy = new Dictionary<GNode, GNode>(ReferenceEqualityComparer.Instance);
        var q = new Queue<GNode>(); q.Enqueue(orig[0]); copy[orig[0]] = new GNode(1);
        while (q.Count > 0) {
            var cur = q.Dequeue();
            foreach (var nb in cur.nb) {
                if (!copy.ContainsKey(nb)) { copy[nb] = new GNode(nb.val); q.Enqueue(nb); }
                copy[cur].nb.Add(copy[nb]);
            }
        }
        var originals = new HashSet<GNode>(orig, ReferenceEqualityComparer.Instance);
        var output = new int[n][];
        for (int i = 0; i < n; i++) output[i] = new int[0];
        foreach (var c in copy.Values) {
            if (originals.Contains(c)) return new int[0][];
            var row = new int[c.nb.Count];
            for (int k = 0; k < row.Length; k++) { if (originals.Contains(c.nb[k])) return new int[0][]; row[k] = c.nb[k].val; }
            output[c.val - 1] = row;
        }
        return output;
    }
}
