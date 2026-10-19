import java.util.*;
// Bus Routes - BFS where nodes are buses; stop -> buses index.  O(total stops).
class Solution {
    public int numBusesToDestination(int[][] routes, int source, int target) {
        if (source == target) return 0;
        Map<Integer, List<Integer>> busesAt = new HashMap<>();
        for (int b = 0; b < routes.length; b++) for (int s : routes[b]) busesAt.computeIfAbsent(s, k -> new ArrayList<>()).add(b);
        boolean[] usedBus = new boolean[routes.length]; Set<Integer> seenStop = new HashSet<>(List.of(source));
        List<Integer> frontier = new ArrayList<>();
        for (int b : busesAt.getOrDefault(source, List.of())) { usedBus[b] = true; frontier.add(b); }
        for (int level = 1; !frontier.isEmpty(); level++) {
            T.r("frontier", frontier, "level", level);
            List<Integer> next = new ArrayList<>();
            for (int b : frontier)
                for (int s : routes[b]) {
                    if (s == target) return level;
                    if (!seenStop.add(s)) continue;
                    for (int nb : busesAt.get(s)) if (!usedBus[nb]) { usedBus[nb] = true; next.add(nb); }
                }
            frontier = next;
        }
        return -1;
    }
}
