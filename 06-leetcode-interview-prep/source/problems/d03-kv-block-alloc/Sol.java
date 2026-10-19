import java.util.*;
// Paged KV-cache allocator - free-list stack + per-sequence block tables.
class KVAlloc {
    private final int blockSize;
    private final Deque<Integer> free = new ArrayDeque<>();          // stack: push/pop at the head
    private final Map<Integer, List<Integer>> table = new HashMap<>();
    private final Map<Integer, Integer> len = new HashMap<>();
    KVAlloc(int n, int bs) { blockSize = bs; for (int b = n - 1; b >= 0; b--) free.push(b); }   // 0 on top
    String append(int seq, int t) {
        int cur = len.getOrDefault(seq, 0);
        List<Integer> tab = table.computeIfAbsent(seq, k -> new ArrayList<>());
        int need = (cur + t + blockSize - 1) / blockSize - tab.size();   // ceil - owned
        if (need > free.size()) { if (tab.isEmpty() && cur == 0) table.remove(seq); return "oom"; }
        for (int k = 0; k < need; k++) tab.add(free.pop());
        len.put(seq, cur + t);
        return "ok:" + tab.size();
    }
    int release(int seq) {
        List<Integer> tab = table.remove(seq); len.remove(seq);
        if (tab == null) return 0;
        for (int k = tab.size() - 1; k >= 0; k--) free.push(tab.get(k));   // first block on top
        return tab.size();
    }
    String blocks(int seq) {
        List<Integer> tab = table.get(seq); if (tab == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < tab.size(); k++) { if (k > 0) sb.append('|'); sb.append(tab.get(k)); }
        return sb.toString();
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; KVAlloc a = null;
        for (int i = 0; i < ops.length; i++) {
            String[] p = args[i].split(",");
            switch (ops[i]) {
                case "KVAlloc": a = new KVAlloc(Integer.parseInt(p[0]), Integer.parseInt(p[1])); out[i] = "null"; break;
                case "append": out[i] = a.append(Integer.parseInt(p[0]), Integer.parseInt(p[1])); break;
                case "free": out[i] = String.valueOf(a.release(Integer.parseInt(p[0]))); break;
                default: out[i] = a.blocks(Integer.parseInt(p[0]));
            }
        }
        return out;
    }
}
