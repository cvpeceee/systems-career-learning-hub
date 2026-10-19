import java.util.*;
// Resumable multi-file iterator - cursor (file, pos) normalized past exhausted files.  O(1) amortized.
class FileIter {
    List<int[]> files = new ArrayList<>(); int f = 0, p = 0;
    FileIter(String spec) {
        for (String part : spec.split("\\|", -1))
            files.add(part.isEmpty() ? new int[0] : Arrays.stream(part.split(",")).mapToInt(Integer::parseInt).toArray());
        normalize();
    }
    void normalize() { while (f < files.size() && p >= files.get(f).length) { f++; p = 0; } }
    boolean hasNext() { return f < files.size(); }
    String next() { if (!hasNext()) return "END"; int v = files.get(f)[p++]; normalize(); return String.valueOf(v); }
    String getState() { return f + "," + p; }
    void setState(String s) { String[] a = s.split(","); f = Integer.parseInt(a[0]); p = Integer.parseInt(a[1]); normalize(); }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; FileIter it = null;
        for (int q = 0; q < ops.length; q++) {
            switch (ops[q]) {
                case "Iter": it = new FileIter(args[q]); out[q] = "null"; break;
                case "next": out[q] = it.next(); break;
                case "hasNext": out[q] = String.valueOf(it.hasNext()); break;
                case "getState": out[q] = it.getState(); break;
                default: it.setState(args[q]); out[q] = "null";
            }
            T.r("op", ops[q], "arg", args[q], "f", it.f, "p", it.p);
        }
        return out;
    }
}
