import java.util.*;
// Cheapest Flights within K stops - k+1 rounds of Bellman-Ford relaxing from a snapshot.  O(k*E).
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        final int INF = Integer.MAX_VALUE / 2;
        int[] dist = new int[n]; Arrays.fill(dist, INF); dist[src] = 0;
        for (int round = 1; round <= k + 1; round++) {
            int[] prev = dist.clone();                       // snapshot
            for (int[] f : flights)
                if (prev[f[0]] != INF && prev[f[0]] + f[2] < dist[f[1]]) dist[f[1]] = prev[f[0]] + f[2];
            T.r("flights", flights, "n", n, "round", round, "dist", dist);
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }
}
