// Redundant connection - union-find (disjoint set union).  ~O(n).
public class Solution {
    private int[] parent, rank;
    private int Find(int x) {
        if (parent[x] != x) parent[x] = Find(parent[x]);   // path compression
        return parent[x];
    }
    public int[] FindRedundantConnection(int[][] edges) {
        int n = edges.Length;
        parent = new int[n + 1]; rank = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        foreach (var e in edges) {
            int ru = Find(e[0]), rv = Find(e[1]);
            T.R("edges", edges, "n", n, "u", e[0], "v", e[1], "parent", parent);
            if (ru == rv) return e;                         // closes a cycle
            if (rank[ru] < rank[rv]) (ru, rv) = (rv, ru);
            parent[rv] = ru;                                // union by rank
            if (rank[ru] == rank[rv]) rank[ru]++;
        }
        return new int[0];
    }
}
