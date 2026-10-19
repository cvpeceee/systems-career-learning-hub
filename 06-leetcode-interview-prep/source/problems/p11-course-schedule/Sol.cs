using System.Collections.Generic;
// Course schedule - Kahn's algorithm (BFS topological sort).  O(V + E).
public class Solution {
    public bool CanFinish(int n, int[][] prereq) {
        var adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();
        var indeg = new int[n];
        foreach (var p in prereq) { adj[p[1]].Add(p[0]); indeg[p[0]]++; }    // edge b -> a
        var q = new Queue<int>();
        for (int v = 0; v < n; v++) if (indeg[v] == 0) q.Enqueue(v);          // ready now
        int done = 0;
        while (q.Count > 0) {
            int node = q.Dequeue(); done++;
            foreach (int nxt in adj[node]) if (--indeg[nxt] == 0) q.Enqueue(nxt);
            T.R("prereq", prereq, "n", n, "node", node, "indeg", indeg, "queue", q);
        }
        return done == n;                                                      // cycle if not all done
    }
}
