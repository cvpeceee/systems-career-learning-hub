import java.util.*;
// BPE - repeatedly merge the most frequent adjacent pair (deterministic ties).  O(merges * N).
class Solution {
    public String[] bpe(String text, int merges) {
        List<List<String>> words = new ArrayList<>();
        for (String w : text.trim().split(" +")) { if (w.isEmpty()) continue; List<String> t = new ArrayList<>(); for (char c : w.toCharArray()) t.add(String.valueOf(c)); words.add(t); }
        for (int round = 0; round < merges; round++) {
            TreeMap<String, Integer> cnt = new TreeMap<>((a, b) -> {      // key "left\u0000right", ordered by (left, right)
                String[] x = a.split("\u0000", -1), y = b.split("\u0000", -1);
                int c = x[0].compareTo(y[0]); return c != 0 ? c : x[1].compareTo(y[1]);
            });
            for (List<String> t : words) for (int i = 0; i + 1 < t.size(); i++) cnt.merge(t.get(i) + "\u0000" + t.get(i + 1), 1, Integer::sum);
            String best = null; int bestC = 0;
            for (var e : cnt.entrySet()) if (e.getValue() > bestC) { bestC = e.getValue(); best = e.getKey(); }
            if (bestC < 2) break;
            String L = best.split("\u0000", -1)[0], R = best.split("\u0000", -1)[1];
            for (int w = 0; w < words.size(); w++) {
                List<String> t = words.get(w), nt = new ArrayList<>();
                for (int i = 0; i < t.size(); i++) {
                    if (i + 1 < t.size() && t.get(i).equals(L) && t.get(i + 1).equals(R)) { nt.add(L + R); i++; } else nt.add(t.get(i));
                }
                words.set(w, nt);
            }
            List<String> tokens = new ArrayList<>(); for (List<String> t : words) tokens.addAll(t);
            T.r("tokens", tokens, "round", round, "best", L + R, "count", bestC);
        }
        List<String> out = new ArrayList<>(); for (List<String> t : words) out.addAll(t);
        return out.toArray(new String[0]);
    }
}
