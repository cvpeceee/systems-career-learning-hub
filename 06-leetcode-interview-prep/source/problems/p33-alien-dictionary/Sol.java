import java.util.*;
// Alien Dictionary - edges from first differing chars, then Kahn's topological sort.
class Solution {
    public String alienOrder(String[] words) {
        Map<Character, Set<Character>> g = new HashMap<>(); Map<Character, Integer> indeg = new TreeMap<>();
        for (String w : words) for (char c : w.toCharArray()) indeg.putIfAbsent(c, 0);
        for (int i = 0; i + 1 < words.length; i++) {
            String a = words[i], b = words[i + 1]; int k = 0;
            while (k < a.length() && k < b.length() && a.charAt(k) == b.charAt(k)) k++;
            if (k == b.length() && a.length() > b.length()) return "";
            if (k < a.length() && k < b.length() && g.computeIfAbsent(a.charAt(k), x -> new HashSet<>()).add(b.charAt(k)))
                indeg.merge(b.charAt(k), 1, Integer::sum);
        }
        PriorityQueue<Character> ready = new PriorityQueue<>();
        for (Map.Entry<Character, Integer> e : indeg.entrySet()) if (e.getValue() == 0) ready.add(e.getKey());
        StringBuilder order = new StringBuilder();
        while (!ready.isEmpty()) {
            char c = ready.poll(); order.append(c);
            for (char nx : g.getOrDefault(c, Set.of())) if (indeg.merge(nx, -1, Integer::sum) == 0) ready.add(nx);
            T.r("ready", ready, "order", order.toString(), "indeg", indeg);
        }
        return order.length() == indeg.size() ? order.toString() : "";
    }
}
