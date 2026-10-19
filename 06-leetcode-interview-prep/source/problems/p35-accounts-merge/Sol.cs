using System; using System.Collections.Generic; using System.Linq;
// Accounts Merge - union-find over emails, then group by root.
public class Solution {
    Dictionary<string, string> parent = new Dictionary<string, string>();
    string Find(string x) {
        var p = parent[x];
        if (p != x) { p = Find(p); parent[x] = p; }          // path compression
        return p;
    }
    public string[] AccountsMerge(string[] accounts) {
        var owner = new Dictionary<string, string>();
        foreach (var line in accounts) {
            var f = line.Split(',');
            for (int i = 1; i < f.Length; i++) {
                parent.TryAdd(f[i], f[i]); owner[f[i]] = f[0];
                string a = Find(f[1]), b = Find(f[i]);
                if (a != b) parent[b] = a;
                T.R("email", f[i], "parent", parent);
            }
        }
        var groups = parent.Keys.ToList().GroupBy(Find);
        var output = groups.Select(g => owner[g.Key] + "," + string.Join(",", g.OrderBy(e => e, StringComparer.Ordinal))).ToList();
        output.Sort(StringComparer.Ordinal);
        return output.ToArray();
    }
}
