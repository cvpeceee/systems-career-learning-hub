using System;
// Cheapest Flights within K stops - k+1 rounds of Bellman-Ford relaxing from a snapshot.  O(k*E).
public class Solution {
    public int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        const int INF = int.MaxValue / 2;
        var dist = new int[n]; Array.Fill(dist, INF); dist[src] = 0;
        for (int round = 1; round <= k + 1; round++) {
            var prev = (int[])dist.Clone();                  // snapshot
            foreach (var f in flights)
                if (prev[f[0]] != INF && prev[f[0]] + f[2] < dist[f[1]]) dist[f[1]] = prev[f[0]] + f[2];
            T.R("flights", flights, "n", n, "round", round, "dist", dist);
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
}
