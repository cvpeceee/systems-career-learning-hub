import java.util.*;
// Accounts Merge - union-find over emails, then group by root.
class Solution {
    Map<String, String> parent = new HashMap<>();
    String find(String x) {
        String p = parent.get(x);
        if (!p.equals(x)) { p = find(p); parent.put(x, p); }   // path compression
        return p;
    }
    public String[] accountsMerge(String[] accounts) {
        Map<String, String> owner = new HashMap<>();
        for (String line : accounts) {
            String[] f = line.split(",");
            for (int i = 1; i < f.length; i++) {
                parent.putIfAbsent(f[i], f[i]); owner.put(f[i], f[0]);
                String a = find(f[1]), b = find(f[i]);
                if (!a.equals(b)) parent.put(b, a);
                T.r("email", f[i], "parent", parent);
            }
        }
        Map<String, TreeSet<String>> groups = new HashMap<>();
        for (String e : parent.keySet()) groups.computeIfAbsent(find(e), k -> new TreeSet<>()).add(e);
        List<String> out = new ArrayList<>();
        for (Map.Entry<String, TreeSet<String>> g : groups.entrySet())
            out.add(owner.get(g.getKey()) + "," + String.join(",", g.getValue()));
        Collections.sort(out);
        return out.toArray(new String[0]);
    }
}
