import java.util.*;
// KV DB with nested transactions - undo-log stack + value counts.  O(1) per command.
class Solution {
    TreeMap<String, String> data = new TreeMap<>();
    Map<String, Integer> counts = new HashMap<>();
    Deque<Map<String, String>> undo = new ArrayDeque<>();           // null value = key was absent
    void apply(String k, String v) {
        String old = data.get(k);
        if (old != null) counts.merge(old, -1, Integer::sum);
        if (v != null) { data.put(k, v); counts.merge(v, 1, Integer::sum); } else data.remove(k);
    }
    void write(String k, String v) {
        if (!undo.isEmpty() && !undo.peek().containsKey(k)) undo.peek().put(k, data.get(k));
        apply(k, v);
    }
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length];
        for (int q = 0; q < ops.length; q++) {
            String op = ops[q], arg = args[q], res = "";
            switch (op) {
                case "SET": { int c = arg.indexOf(','); write(arg.substring(0, c), arg.substring(c + 1)); break; }
                case "UNSET": write(arg, null); break;
                case "GET": res = data.getOrDefault(arg, "NULL"); break;
                case "COUNT": res = String.valueOf(counts.getOrDefault(arg, 0)); break;
                case "BEGIN": undo.push(new HashMap<>()); break;
                case "ROLLBACK":
                    if (undo.isEmpty()) res = "NO TRANSACTION";
                    else for (var e : undo.pop().entrySet()) apply(e.getKey(), e.getValue());
                    break;
                case "COMMIT": if (undo.isEmpty()) res = "NO TRANSACTION"; else undo.clear(); break;
            }
            out[q] = res;
            T.r("op", op, "arg", arg, "depth", undo.size(), "data", data);
        }
        return out;
    }
}
