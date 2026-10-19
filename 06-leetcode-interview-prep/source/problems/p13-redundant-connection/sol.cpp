// Redundant connection - union-find (disjoint set union).  ~O(n).
class Solution {
    vector<int> parent, rnk;
    int find(int x) {
        FN("find");
        TR("x", x, "parent", parent);
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression: point at the root
        return parent[x];
    }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        FN("findRedundantConnection");
        int n = edges.size();
        parent.resize(n + 1); rnk.assign(n + 1, 0);
        for (int i = 0; i <= n; ++i) parent[i] = i;          // everyone is their own CEO
        for (auto& e : edges) {
            int u = e[0], v = e[1];
            TR("edges", edges, "n", n, "u", u, "v", v, "parent", parent);
            int ru = find(u), rv = find(v);
            if (ru == rv) {                                  // already connected -> this edge closes a loop
                TR("edges", edges, "n", n, "u", u, "v", v, "parent", parent, "_note", "same root: redundant");
                return e;
            }
            if (rnk[ru] < rnk[rv]) swap(ru, rv);             // union by rank: shorter tree goes under
            parent[rv] = ru;
            if (rnk[ru] == rnk[rv]) rnk[ru]++;
            TR("edges", edges, "n", n, "u", u, "v", v, "ru", ru, "rv", rv, "parent", parent);
        }
        return {};
    }
};
