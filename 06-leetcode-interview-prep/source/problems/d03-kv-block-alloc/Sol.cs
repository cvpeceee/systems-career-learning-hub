using System.Collections.Generic;
// Paged KV-cache allocator - free-list stack + per-sequence block tables.
public class KVAlloc {
    private readonly int blockSize;
    private readonly Stack<int> free = new Stack<int>();
    private readonly Dictionary<int, List<int>> table = new Dictionary<int, List<int>>();
    private readonly Dictionary<int, int> len = new Dictionary<int, int>();
    public KVAlloc(int n, int bs) { blockSize = bs; for (int b = n - 1; b >= 0; b--) free.Push(b); }   // 0 on top
    public string Append(int seq, int t) {
        len.TryGetValue(seq, out int cur);
        if (!table.TryGetValue(seq, out var tab)) tab = new List<int>();
        int need = (cur + t + blockSize - 1) / blockSize - tab.Count;   // ceil - owned
        if (need > free.Count) return "oom";                            // all-or-nothing
        for (int k = 0; k < need; k++) tab.Add(free.Pop());
        table[seq] = tab; len[seq] = cur + t;
        return "ok:" + tab.Count;
    }
    public int Release(int seq) {
        if (!table.Remove(seq, out var tab)) return 0;
        len.Remove(seq);
        for (int k = tab.Count - 1; k >= 0; k--) free.Push(tab[k]);
        return tab.Count;
    }
    public string Blocks(int seq) => table.TryGetValue(seq, out var tab) ? string.Join("|", tab) : "";
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; KVAlloc a = null;
        for (int i = 0; i < ops.Length; i++) {
            var p = args[i].Split(',');
            switch (ops[i]) {
                case "KVAlloc": a = new KVAlloc(int.Parse(p[0]), int.Parse(p[1])); output[i] = "null"; break;
                case "append": output[i] = a.Append(int.Parse(p[0]), int.Parse(p[1])); break;
                case "free": output[i] = a.Release(int.Parse(p[0])).ToString(); break;
                default: output[i] = a.Blocks(int.Parse(p[0])); break;
            }
        }
        return output;
    }
}
