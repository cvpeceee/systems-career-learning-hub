using System; using System.Collections.Generic; using System.Globalization;
// Currency conversion - DFS over a two-way rate graph, multiplying along the path.  O(V+E).
public class Solution {
    public double Convert(string[] rates, string from, string to) {
        var g = new Dictionary<string, List<(string, double)>>();
        void Add(string a, string b, double v) { if (!g.ContainsKey(a)) g[a] = new List<(string, double)>(); g[a].Add((b, v)); }
        foreach (var r in rates) { var p = r.Split(','); double v = double.Parse(p[2], CultureInfo.InvariantCulture); Add(p[0], p[1], v); Add(p[1], p[0], 1.0 / v); }
        if (!g.ContainsKey(from) || !g.ContainsKey(to)) return -1.0;
        var stack = new Stack<(string, double)>(); stack.Push((from, 1.0)); var seen = new HashSet<string> { from };
        while (stack.Count > 0) {
            var (cur, amount) = stack.Pop();
            T.R("cur", cur, "amount", amount);
            if (cur == to) return amount;
            foreach (var (nx, rate) in g[cur]) if (seen.Add(nx)) stack.Push((nx, amount * rate));
        }
        return -1.0;
    }
}
