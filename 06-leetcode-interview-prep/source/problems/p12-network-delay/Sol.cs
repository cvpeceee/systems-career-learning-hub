using System; using System.Collections.Generic;
// Network delay - Dijkstra with a min-heap and lazy deletion.  O(E log V).
public class Solution {
    public int NetworkDelayTime(int[][] times, int n, int k) {
        var adj = new List<(int v, int w)>[n + 1];
        for (int i = 0; i <= n; i++) adj[i] = new List<(int, int)>();
        foreach (var t in times) adj[t[0]].Add((t[1], t[2]));
        var dist = new int[n + 1];
        Array.Fill(dist, int.MaxValue);
        dist[k] = 0;
        var heap = new PriorityQueue<int, int>();     // element = node, priority = distance
        heap.Enqueue(k, 0);
        while (heap.TryDequeue(out int node, out int d)) {
            if (d > dist[node]) continue;                 // stale
            foreach (var (v, w) in adj[node])
                if (d + w < dist[v]) { dist[v] = d + w; heap.Enqueue(v, dist[v]); }
        }
        int ans = 0;
        for (int v = 1; v <= n; v++) { if (dist[v] == int.MaxValue) return -1; ans = Math.Max(ans, dist[v]); }
        return ans;
    }
}
