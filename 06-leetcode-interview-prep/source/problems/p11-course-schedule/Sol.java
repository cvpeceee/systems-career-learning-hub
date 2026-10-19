import java.util.*;
// Course schedule - Kahn's algorithm (BFS topological sort).  O(V + E).
class Solution {
    public boolean canFinish(int n, int[][] prereq) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] p : prereq) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }   // edge b -> a
        Deque<Integer> q = new ArrayDeque<>();
        for (int v = 0; v < n; v++) if (indeg[v] == 0) q.add(v);              // ready now
        int done = 0;
        while (!q.isEmpty()) {
            int node = q.poll(); done++;
            for (int nxt : adj.get(node)) if (--indeg[nxt] == 0) q.add(nxt);
        }
        return done == n;                                                      // cycle if not all done
    }
}
