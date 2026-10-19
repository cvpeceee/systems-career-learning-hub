using System; using System.Collections.Generic;
// Streaming log parser - one pass, per-service counters + error-message tallies.  O(total chars).
public class Solution {
    class Stats { public int Err, Warn, Info; public SortedDictionary<string, int> ErrMsg = new(StringComparer.Ordinal); }
    public string[] Summarize(string[] lines) {
        var stats = new SortedDictionary<string, Stats>(StringComparer.Ordinal); int malformed = 0;
        for (int i = 0; i < lines.Length; i++) {
            var p = lines[i].Split(' ', 4);
            if (p.Length < 4 || p[3].Length == 0) { malformed++; continue; }
            string level = p[1], svc = p[2], msg = p[3];
            if (level != "ERROR" && level != "WARN" && level != "INFO") { malformed++; continue; }
            if (!stats.TryGetValue(svc, out var s)) stats[svc] = s = new Stats();
            if (level == "ERROR") { s.Err++; s.ErrMsg[msg] = s.ErrMsg.GetValueOrDefault(msg) + 1; } else if (level == "WARN") s.Warn++; else s.Info++;
            T.R("i", i, "svc", svc, "malformed", malformed);
        }
        var output = new List<string>();
        foreach (var e in stats) {
            var s = e.Value; string top = "-"; int best = 0;
            foreach (var m in s.ErrMsg) if (m.Value > best) { best = m.Value; top = m.Key; }
            output.Add($"{e.Key}: ERROR={s.Err} WARN={s.Warn} INFO={s.Info} top={top}");
        }
        output.Add("malformed=" + malformed);
        return output.ToArray();
    }
}
