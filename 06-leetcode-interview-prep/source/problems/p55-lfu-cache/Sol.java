import java.util.*;
// LFU cache - key -> value/freq; freq -> LinkedHashSet (insertion order = LRU order); minFreq.  O(1) ops.
class LFUCache {
    int cap, minFreq = 0;
    Map<Integer, Integer> val = new HashMap<>(), freq = new HashMap<>();
    Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();
    LFUCache(int capacity) { cap = capacity; }
    void touch(int key) {
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty()) { buckets.remove(f); if (minFreq == f) minFreq++; }
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(key);   // appended = most recent
    }
    int get(int key) { if (!val.containsKey(key)) return -1; touch(key); return val.get(key); }
    void put(int key, int value) {
        if (cap == 0) return;
        if (val.containsKey(key)) { val.put(key, value); touch(key); return; }
        if (val.size() == cap) {
            int victim = buckets.get(minFreq).iterator().next();             // oldest in lowest bucket
            buckets.get(minFreq).remove(victim);
            if (buckets.get(minFreq).isEmpty()) buckets.remove(minFreq);
            val.remove(victim); freq.remove(victim);
        }
        val.put(key, value); freq.put(key, 1); minFreq = 1;
        buckets.computeIfAbsent(1, x -> new LinkedHashSet<>()).add(key);
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; LFUCache c = null;
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("LFUCache")) { c = new LFUCache(Integer.parseInt(args[i])); out[i] = "null"; }
            else if (ops[i].equals("get")) out[i] = String.valueOf(c.get(Integer.parseInt(args[i])));
            else { String[] kv = args[i].split(","); c.put(Integer.parseInt(kv[0]), Integer.parseInt(kv[1])); out[i] = "null"; }
        }
        return out;
    }
}
