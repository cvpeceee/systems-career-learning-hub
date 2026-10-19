import java.util.*;
// Sliding-log rate limiter - per-client deque of allowed timestamps.  Amortized O(1) per request.
class Limiter {
    final int limit; final long w;
    final Map<String, ArrayDeque<Long>> log = new HashMap<>();
    Limiter(int limit, long w) { this.limit = limit; this.w = w; }
    boolean allow(String client, long t) {
        ArrayDeque<Long> q = log.computeIfAbsent(client, k -> new ArrayDeque<>());
        while (!q.isEmpty() && q.peekFirst() <= t - w) q.pollFirst();   // expire
        if (q.size() >= limit) return false;
        q.addLast(t);
        return true;
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; Limiter L = null;
        for (int i = 0; i < ops.length; i++) {
            String[] a = args[i].split(",");
            if (ops[i].equals("Limiter")) { L = new Limiter(Integer.parseInt(a[0]), Long.parseLong(a[1])); out[i] = "null"; }
            else out[i] = String.valueOf(L.allow(a[0], Long.parseLong(a[1])));
            if (i > 0) T.r("op", ops[i], "arg", args[i], "log", L.log, "out", out[i]);
        }
        return out;
    }
}
