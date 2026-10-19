import java.util.*;
// Versioned KV store + length-prefixed persistence.  O(log v) set/get.
class TimeMap {
    TreeMap<String, TreeMap<Long, String>> store = new TreeMap<>();
    void set(String k, String v, long t) { store.computeIfAbsent(k, x -> new TreeMap<>()).put(t, v); }
    String get(String k, long t) {
        TreeMap<Long, String> h = store.get(k);
        if (h == null) return "";
        Map.Entry<Long, String> e = h.floorEntry(t);
        return e == null ? "" : e.getValue();
    }
    String serialize() {
        StringBuilder sb = new StringBuilder();
        for (var ke : store.entrySet())
            for (var ve : ke.getValue().entrySet())
                sb.append(ke.getKey().length()).append(':').append(ke.getKey()).append(ve.getValue().length()).append(':').append(ve.getValue()).append(ve.getKey()).append(';');
        return sb.toString();
    }
    void load(String s) {
        store.clear(); int i = 0;
        while (i < s.length()) {
            int c = s.indexOf(':', i); int kl = Integer.parseInt(s.substring(i, c)); i = c + 1;
            String k = s.substring(i, i + kl); i += kl;
            c = s.indexOf(':', i); int vl = Integer.parseInt(s.substring(i, c)); i = c + 1;
            String v = s.substring(i, i + vl); i += vl;
            int semi = s.indexOf(';', i); long t = Long.parseLong(s.substring(i, semi)); i = semi + 1;
            set(k, v, t);
        }
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; TimeMap tm = new TimeMap();
        for (int q = 0; q < ops.length; q++) {
            String op = ops[q], arg = args[q];
            if (op.equals("set")) { int a = arg.indexOf(','), b = arg.lastIndexOf(','); tm.set(arg.substring(0, a), arg.substring(a + 1, b), Long.parseLong(arg.substring(b + 1))); out[q] = "null"; }
            else if (op.equals("get")) { int b = arg.lastIndexOf(','); out[q] = tm.get(arg.substring(0, b), Long.parseLong(arg.substring(b + 1))); }
            else if (op.equals("serialize")) out[q] = tm.serialize();
            else if (op.equals("load")) { tm.load(arg); out[q] = "null"; }
            else out[q] = "null";
            T.r("op", op, "arg", arg, "keys", new ArrayList<>(tm.store.keySet()));
        }
        return out;
    }
}
