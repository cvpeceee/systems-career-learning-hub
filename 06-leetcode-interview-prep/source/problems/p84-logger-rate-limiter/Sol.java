import java.util.*;
// Logger Rate Limiter - map message -> next time it may print.  O(1) per call.
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; Map<String, Integer> next = new TreeMap<>();
        for (int k = 0; k < ops.length; k++) {
            if (ops[k].equals("Logger")) { out[k] = "null"; continue; }
            int comma = args[k].indexOf(','); int t = Integer.parseInt(args[k].substring(0, comma)); String msg = args[k].substring(comma + 1);
            boolean ok = t >= next.getOrDefault(msg, Integer.MIN_VALUE);
            if (ok) next.put(msg, t + 10);
            out[k] = String.valueOf(ok);
            T.r("op", ops[k], "arg", args[k], "next", next);
        }
        return out;
    }
}
