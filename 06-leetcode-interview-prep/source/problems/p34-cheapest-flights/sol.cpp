// Cheapest Flights within K stops - k+1 rounds of Bellman-Ford relaxing from a snapshot.  O(k*E).
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>> flights, int src, int dst, int k) {
        FN("findCheapestPrice");
        const int INF = INT_MAX / 2;
        vector<int> dist(n, INF); dist[src] = 0;
        for (int round = 1; round <= k + 1; round++) {      // round = max number of edges used
            vector<int> prev = dist;                        // snapshot: extend only last round's paths
            for (auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (prev[u] != INF && prev[u] + w < dist[v]) dist[v] = prev[u] + w;   // relax
            }
            TR("flights", flights, "n", n, "round", round, "dist", dist);
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
};
