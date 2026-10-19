import java.util.*;
// Network delay - Dijkstra with a min-heap and lazy deletion.  O(E log V).
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));  // by distance
        heap.add(new int[]{0, k});
        while (!heap.isEmpty()) {
            int[] top = heap.poll(); int d = top[0], node = top[1];
            if (d > dist[node]) continue;                          // stale
            T.r("times", times, "n", n, "node", node, "dist", dist);
            for (int[] e : adj.get(node))
                if (d + e[1] < dist[e[0]]) { dist[e[0]] = d + e[1]; heap.add(new int[]{dist[e[0]], e[0]}); }
        }
        int ans = 0;
        for (int v = 1; v <= n; v++) { if (dist[v] == Integer.MAX_VALUE) return -1; ans = Math.max(ans, dist[v]); }
        return ans;
    }
}
