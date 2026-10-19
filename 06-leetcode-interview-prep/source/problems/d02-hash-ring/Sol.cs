using System.Collections.Generic; using System.Text;
// Consistent hash ring with virtual nodes.  get: O(log P) via binary search on sorted keys.
public class HashRing {
    public static uint Fnv1a(string s) {
        uint h = 2166136261u;
        foreach (byte b in Encoding.UTF8.GetBytes(s)) { h ^= b; h = unchecked(h * 16777619u); }   // wraps mod 2^32
        return h;
    }
    private readonly int vnodes; private readonly SortedList<uint, int> ring = new SortedList<uint, int>();
    public HashRing(int v) { vnodes = v; }
    public void Add(int id) { for (int i = 0; i < vnodes; i++) ring[Fnv1a("n" + id + "#" + i)] = id; }
    public void Remove(int id) { for (int i = ring.Count - 1; i >= 0; i--) if (ring.Values[i] == id) ring.RemoveAt(i); }
    public int Get(string key) {
        if (ring.Count == 0) return -1;
        uint h = Fnv1a("k" + key);
        IList<uint> keys = ring.Keys; int lo = 0, hi = keys.Count;   // lower_bound
        while (lo < hi) { int mid = (lo + hi) / 2; if (keys[mid] < h) lo = mid + 1; else hi = mid; }
        return ring.Values[lo == keys.Count ? 0 : lo];               // wrap around
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; HashRing r = null;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "HashRing": r = new HashRing(int.Parse(args[i])); output[i] = "null"; break;
                case "add": r.Add(int.Parse(args[i])); output[i] = "null"; break;
                case "remove": r.Remove(int.Parse(args[i])); output[i] = "null"; break;
                default: output[i] = r.Get(args[i]).ToString(); break;
            }
        }
        return output;
    }
}
