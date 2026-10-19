using System; using System.Collections.Generic;
// Bus Routes - BFS where nodes are buses; stop -> buses index.  O(total stops).
public class Solution {
    public int NumBusesToDestination(int[][] routes, int source, int target) {
        if (source == target) return 0;
        var busesAt = new Dictionary<int, List<int>>();
        for (int b = 0; b < routes.Length; b++) foreach (int s in routes[b]) { if (!busesAt.ContainsKey(s)) busesAt[s] = new List<int>(); busesAt[s].Add(b); }
        var usedBus = new bool[routes.Length]; var seenStop = new HashSet<int> { source };
        var frontier = new List<int>();
        if (busesAt.ContainsKey(source)) foreach (int b in busesAt[source]) { usedBus[b] = true; frontier.Add(b); }
        for (int level = 1; frontier.Count > 0; level++) {
            T.R("frontier", frontier, "level", level);
            var next = new List<int>();
            foreach (int b in frontier)
                foreach (int s in routes[b]) {
                    if (s == target) return level;
                    if (!seenStop.Add(s)) continue;
                    foreach (int nb in busesAt[s]) if (!usedBus[nb]) { usedBus[nb] = true; next.Add(nb); }
                }
            frontier = next;
        }
        return -1;
    }
}
