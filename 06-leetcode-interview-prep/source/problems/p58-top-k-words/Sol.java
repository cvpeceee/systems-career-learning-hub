import java.util.*;
// Top K frequent words - count, then a size-k min-heap with the tie-break reversed.  O(n log k).
class Solution {
    public String[] topKFrequent(String[] words, int k) {
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.merge(w, 1, Integer::sum);
        PriorityQueue<String> heap = new PriorityQueue<>((a, b) -> !count.get(a).equals(count.get(b))
                ? Integer.compare(count.get(a), count.get(b)) : b.compareTo(a));   // top = worst
        for (String w : count.keySet()) { heap.add(w); if (heap.size() > k) heap.poll(); }
        String[] out = new String[heap.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = heap.poll();
        return out;
    }
}
