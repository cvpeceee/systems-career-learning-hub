import java.util.*;
// Buddy allocator - per-order free sets; split down on alloc, XOR-buddy coalesce on free.
class Buddy {
    int K; List<TreeSet<Integer>> freeAt = new ArrayList<>(); Map<Integer, Integer> orderOf = new HashMap<>();
    Buddy(int units) { while ((1 << K) < units) K++; for (int k = 0; k <= K; k++) freeAt.add(new TreeSet<>()); freeAt.get(K).add(0); }
    int alloc(int n) {
        int k = 0; while ((1 << k) < n) k++;
        int j = k; while (j <= K && freeAt.get(j).isEmpty()) j++;
        if (j > K) return -1;
        int off = freeAt.get(j).pollFirst();
        while (j > k) { j--; freeAt.get(j).add(off + (1 << j)); }   // split
        orderOf.put(off, k); return off;
    }
    Map<Integer, List<Integer>> view() { Map<Integer, List<Integer>> m = new TreeMap<>(); for (int k = 0; k <= K; k++) if (!freeAt.get(k).isEmpty()) m.put(1 << k, new ArrayList<>(freeAt.get(k))); return m; }   // size -> free offsets
    void release(int off) {
        int k = orderOf.remove(off);
        while (k < K && freeAt.get(k).remove(off ^ (1 << k))) { off = Math.min(off, off ^ (1 << k)); k++; }   // coalesce
        freeAt.get(k).add(off);
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; Buddy b = null;
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("Buddy")) { b = new Buddy(Integer.parseInt(args[i])); out[i] = "null"; }
            else if (ops[i].equals("alloc")) out[i] = String.valueOf(b.alloc(Integer.parseInt(args[i])));
            else { b.release(Integer.parseInt(args[i])); out[i] = "null"; }
            T.r("op", ops[i], "arg", args[i], "freeLists", b.view(), "out", out[i]);
        }
        return out;
    }
}
