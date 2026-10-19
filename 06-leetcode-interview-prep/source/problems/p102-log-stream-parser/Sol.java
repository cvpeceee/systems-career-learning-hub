import java.util.*;
// Streaming log parser - one pass, per-service counters + error-message tallies.  O(total chars).
class Solution {
    static class Stats { int err, warn, info; TreeMap<String, Integer> errMsg = new TreeMap<>(); }
    public String[] summarize(String[] lines) {
        TreeMap<String, Stats> stats = new TreeMap<>(); int malformed = 0;
        for (int i = 0; i < lines.length; i++) {
            String[] p = lines[i].split(" ", 4);
            if (p.length < 4 || p[3].isEmpty()) { malformed++; continue; }
            String level = p[1], svc = p[2], msg = p[3];
            if (!level.equals("ERROR") && !level.equals("WARN") && !level.equals("INFO")) { malformed++; continue; }
            Stats s = stats.computeIfAbsent(svc, k -> new Stats());
            if (level.equals("ERROR")) { s.err++; s.errMsg.merge(msg, 1, Integer::sum); } else if (level.equals("WARN")) s.warn++; else s.info++;
            T.r("i", i, "svc", svc, "malformed", malformed);
        }
        List<String> out = new ArrayList<>();
        for (var e : stats.entrySet()) {
            Stats s = e.getValue(); String top = "-"; int best = 0;
            for (var m : s.errMsg.entrySet()) if (m.getValue() > best) { best = m.getValue(); top = m.getKey(); }
            out.add(e.getKey() + ": ERROR=" + s.err + " WARN=" + s.warn + " INFO=" + s.info + " top=" + top);
        }
        out.add("malformed=" + malformed);
        return out.toArray(new String[0]);
    }
}
