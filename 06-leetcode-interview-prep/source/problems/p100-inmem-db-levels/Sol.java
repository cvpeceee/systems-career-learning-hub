import java.util.*;
// In-memory DB levels 1-3 - key -> ordered(field -> {value, expiresAt}); lazy expiry.
class Solution {
    static class Cell { String value; long expiresAt; Cell(String v, long e) { value = v; expiresAt = e; } }
    TreeMap<String, TreeMap<String, Cell>> db = new TreeMap<>();
    static boolean alive(Cell c, long now) { return now < c.expiresAt; }
    String scan(String key, String prefix, long now) {
        TreeMap<String, Cell> fs = db.get(key);
        if (fs == null) return "";
        StringBuilder sb = new StringBuilder();
        for (var e : fs.tailMap(prefix, true).entrySet()) {
            if (!e.getKey().startsWith(prefix)) break;
            if (alive(e.getValue(), now)) { if (sb.length() > 0) sb.append(", "); sb.append(e.getKey()).append('(').append(e.getValue().value).append(')'); }
        }
        return sb.toString();
    }
    public String[] run(String[] ops, String[] args) {
        final long ANY = Long.MIN_VALUE;
        String[] out = new String[ops.length];
        for (int q = 0; q < ops.length; q++) {
            String op = ops[q]; String[] a = args[q].split(","); String res = "";
            switch (op) {
                case "SET": case "SET_AT": db.computeIfAbsent(a[0], k -> new TreeMap<>()).put(a[1], new Cell(a[2], Long.MAX_VALUE)); break;
                case "SET_AT_WITH_TTL": db.computeIfAbsent(a[0], k -> new TreeMap<>()).put(a[1], new Cell(a[2], Long.parseLong(a[3]) + Long.parseLong(a[4]))); break;
                case "GET": case "GET_AT": {
                    long now = op.equals("GET") ? ANY : Long.parseLong(a[2]);
                    Cell c = db.containsKey(a[0]) ? db.get(a[0]).get(a[1]) : null;
                    if (c != null && alive(c, now)) res = c.value; break; }
                case "DELETE": case "DELETE_AT": {
                    long now = op.equals("DELETE") ? ANY : Long.parseLong(a[2]);
                    Cell c = db.containsKey(a[0]) ? db.get(a[0]).get(a[1]) : null;
                    boolean ok = c != null && alive(c, now);
                    if (ok) db.get(a[0]).remove(a[1]);
                    res = String.valueOf(ok); break; }
                case "SCAN": res = scan(a[0], "", ANY); break;
                case "SCAN_AT": res = scan(a[0], "", Long.parseLong(a[1])); break;
                case "SCAN_PREFIX": res = scan(a[0], a[1], ANY); break;
                case "SCAN_PREFIX_AT": res = scan(a[0], a[1], Long.parseLong(a[2])); break;
            }
            out[q] = res;
            T.r("op", op, "arg", args[q], "keys", new ArrayList<>(db.keySet()));
        }
        return out;
    }
}
