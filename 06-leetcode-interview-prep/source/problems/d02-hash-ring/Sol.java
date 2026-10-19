import java.util.*;
import java.nio.charset.StandardCharsets;
// Consistent hash ring with virtual nodes.  get: O(log P).
class HashRing {
    static long fnv1a(String s) {                         // 32-bit FNV-1a kept in a long, masked to unsigned
        long h = 2166136261L;
        for (byte b : s.getBytes(StandardCharsets.UTF_8)) { h ^= (b & 0xff); h = (h * 16777619L) & 0xffffffffL; }
        return h;
    }
    private final int vnodes; private final TreeMap<Long, Integer> ring = new TreeMap<>();   // sorted = clockwise
    HashRing(int v) { vnodes = v; }
    void add(int id) { for (int i = 0; i < vnodes; i++) ring.put(fnv1a("n" + id + "#" + i), id); }
    void remove(int id) { ring.values().removeIf(x -> x == id); }
    int get(String key) {
        if (ring.isEmpty()) return -1;
        Map.Entry<Long, Integer> e = ring.ceilingEntry(fnv1a("k" + key));   // first point >= hash
        if (e == null) e = ring.firstEntry();                               // wrap
        return e.getValue();
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; HashRing r = null;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "HashRing": r = new HashRing(Integer.parseInt(args[i])); out[i] = "null"; break;
                case "add": r.add(Integer.parseInt(args[i])); out[i] = "null"; break;
                case "remove": r.remove(Integer.parseInt(args[i])); out[i] = "null"; break;
                default: out[i] = String.valueOf(r.get(args[i]));
            }
        }
        return out;
    }
}
