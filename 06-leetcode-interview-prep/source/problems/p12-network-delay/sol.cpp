// Network delay - Dijkstra with a min-heap and lazy deletion.  O(E log V).
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        FN("networkDelayTime");
        const int INF = INT_MAX;
        vector<vector<pair<int,int>>> adj(n + 1);          // adj[u] = {(v, w)}, nodes are 1..n
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INF);
        dist[k] = 0;
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> heap;   // (dist, node)
        heap.push({0, k});
        while (!heap.empty()) {
            auto [d, node] = heap.top(); heap.pop();       // closest unfinished node
            if (d > dist[node]) { TR("times", times, "n", n, "node", node, "d", d, "dist", dist, "heap", heap, "_note", "stale entry, skip"); continue; }   // stale entry: we already found better
            for (auto [v, w] : adj[node])
                if (d + w < dist[v]) {                     // relax: a faster route to v
                    dist[v] = d + w;
                    heap.push({dist[v], v});
                    TR("times", times, "n", n, "node", node, "d", d, "v", v, "dist", dist, "heap", heap, "_note", "relaxed edge");
                }
            TR("times", times, "n", n, "node", node, "d", d, "dist", dist, "heap", heap);
        }
        int ans = 0;
        for (int v = 1; v <= n; ++v) {
            if (dist[v] == INF) return -1;                 // someone never hears the signal
            ans = max(ans, dist[v]);
        }
        return ans;
    }
};
