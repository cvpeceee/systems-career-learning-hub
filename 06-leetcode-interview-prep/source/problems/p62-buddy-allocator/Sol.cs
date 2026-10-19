using System; using System.Collections.Generic;
// Buddy allocator - per-order free sets; split down on alloc, XOR-buddy coalesce on free.
public class Buddy {
    readonly int K; readonly SortedSet<int>[] freeAt; readonly Dictionary<int, int> orderOf = new();
    public Buddy(int units) { while ((1 << K) < units) K++; freeAt = new SortedSet<int>[K + 1]; for (int k = 0; k <= K; k++) freeAt[k] = new SortedSet<int>(); freeAt[K].Add(0); }
    public int Alloc(int n) {
        int k = 0; while ((1 << k) < n) k++;
        int j = k; while (j <= K && freeAt[j].Count == 0) j++;
        if (j > K) return -1;
        int off = freeAt[j].Min; freeAt[j].Remove(off);
        while (j > k) { j--; freeAt[j].Add(off + (1 << j)); }       // split
        orderOf[off] = k; return off;
    }
    public SortedDictionary<int, List<int>> View() { var m = new SortedDictionary<int, List<int>>(); for (int k = 0; k <= K; k++) if (freeAt[k].Count > 0) m[1 << k] = new List<int>(freeAt[k]); return m; }   // size -> free offsets
    public void Release(int off) {
        orderOf.Remove(off, out int k);
        while (k < K && freeAt[k].Remove(off ^ (1 << k))) { off = Math.Min(off, off ^ (1 << k)); k++; }   // coalesce
        freeAt[k].Add(off);
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; Buddy b = null;
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "Buddy") { b = new Buddy(int.Parse(args[i])); output[i] = "null"; }
            else if (ops[i] == "alloc") output[i] = b.Alloc(int.Parse(args[i])).ToString();
            else { b.Release(int.Parse(args[i])); output[i] = "null"; }
            T.R("op", ops[i], "arg", args[i], "freeLists", b.View(), "out", output[i]);
        }
        return output;
    }
}
