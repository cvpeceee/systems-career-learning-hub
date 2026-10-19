using System.Collections.Generic; using System.Text;
// Alien Dictionary - edges from first differing chars, then Kahn's topological sort.
public class Solution {
    public string AlienOrder(string[] words) {
        var g = new Dictionary<char, HashSet<char>>(); var indeg = new SortedDictionary<char, int>();
        foreach (var w in words) foreach (var c in w) indeg.TryAdd(c, 0);
        for (int i = 0; i + 1 < words.Length; i++) {
            string a = words[i], b = words[i + 1]; int k = 0;
            while (k < a.Length && k < b.Length && a[k] == b[k]) k++;
            if (k == b.Length && a.Length > b.Length) return "";
            if (k < a.Length && k < b.Length) {
                if (!g.ContainsKey(a[k])) g[a[k]] = new HashSet<char>();
                if (g[a[k]].Add(b[k])) indeg[b[k]]++;
            }
        }
        var ready = new PriorityQueue<char, char>();
        foreach (var kv in indeg) if (kv.Value == 0) ready.Enqueue(kv.Key, kv.Key);
        var order = new StringBuilder();
        while (ready.Count > 0) {
            var c = ready.Dequeue(); order.Append(c);
            if (g.TryGetValue(c, out var outs)) foreach (var nx in outs) if (--indeg[nx] == 0) ready.Enqueue(nx, nx);
            T.R("ready", ready, "order", order.ToString(), "indeg", indeg);
        }
        return order.Length == indeg.Count ? order.ToString() : "";
    }
}
