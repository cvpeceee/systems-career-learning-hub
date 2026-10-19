// Redundant connection - union-find (disjoint set union).  ~O(n).
class Solution {
    private int[] parent, rank;
    private int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        parent = new int[n + 1]; rank = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        for (int[] e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return e;                         // closes a cycle
            if (rank[ru] < rank[rv]) { int t = ru; ru = rv; rv = t; }
            parent[rv] = ru;                                // union by rank
            if (rank[ru] == rank[rv]) rank[ru]++;
        }
        return new int[0];
    }
}
