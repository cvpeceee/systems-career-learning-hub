import java.util.*;
// Currency conversion - DFS over a two-way rate graph, multiplying along the path.  O(V+E).
class Solution {
    public double convert(String[] rates, String from, String to) {
        Map<String, Map<String, Double>> g = new HashMap<>();
        for (String r : rates) {
            String[] p = r.split(","); double v = Double.parseDouble(p[2]);
            g.computeIfAbsent(p[0], k -> new LinkedHashMap<>()).put(p[1], v);
            g.computeIfAbsent(p[1], k -> new LinkedHashMap<>()).put(p[0], 1.0 / v);
        }
        if (!g.containsKey(from) || !g.containsKey(to)) return -1.0;
        Deque<Object[]> stack = new ArrayDeque<>(); stack.push(new Object[]{from, 1.0});
        Set<String> seen = new HashSet<>(List.of(from));
        while (!stack.isEmpty()) {
            Object[] top = stack.pop(); String cur = (String) top[0]; double amount = (Double) top[1];
            T.r("cur", cur, "amount", amount);
            if (cur.equals(to)) return amount;
            for (var e : g.get(cur).entrySet()) if (seen.add(e.getKey())) stack.push(new Object[]{e.getKey(), amount * e.getValue()});
        }
        return -1.0;
    }
}
