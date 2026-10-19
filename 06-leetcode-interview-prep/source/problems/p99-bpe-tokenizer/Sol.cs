using System; using System.Collections.Generic;
// BPE - repeatedly merge the most frequent adjacent pair (deterministic ties).  O(merges * N).
public class Solution {
    public string[] Bpe(string text, int merges) {
        var words = new List<List<string>>();
        foreach (var w in text.Split(' ', StringSplitOptions.RemoveEmptyEntries)) { var t = new List<string>(); foreach (char c in w) t.Add(c.ToString()); words.Add(t); }
        var cmp = Comparer<(string, string)>.Create((a, b) => { int c = string.CompareOrdinal(a.Item1, b.Item1); return c != 0 ? c : string.CompareOrdinal(a.Item2, b.Item2); });
        for (int round = 0; round < merges; round++) {
            var cnt = new SortedDictionary<(string, string), int>(cmp);
            foreach (var t in words) for (int i = 0; i + 1 < t.Count; i++) { var k = (t[i], t[i + 1]); cnt[k] = cnt.GetValueOrDefault(k) + 1; }
            (string, string) best = ("", ""); int bestC = 0;
            foreach (var e in cnt) if (e.Value > bestC) { bestC = e.Value; best = e.Key; }
            if (bestC < 2) break;
            for (int w = 0; w < words.Count; w++) {
                var t = words[w]; var nt = new List<string>();
                for (int i = 0; i < t.Count; i++) {
                    if (i + 1 < t.Count && t[i] == best.Item1 && t[i + 1] == best.Item2) { nt.Add(t[i] + t[i + 1]); i++; } else nt.Add(t[i]);
                }
                words[w] = nt;
            }
            var tokens = new List<string>(); foreach (var t in words) tokens.AddRange(t);
            T.R("tokens", tokens, "round", round, "best", best.Item1 + best.Item2, "count", bestC);
        }
        var output = new List<string>(); foreach (var t in words) output.AddRange(t);
        return output.ToArray();
    }
}
