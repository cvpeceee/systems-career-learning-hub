using System; using System.Collections.Generic; using System.Text;
// Versioned KV store + length-prefixed persistence.  O(log v) set/get.
public class TimeMap {
    public SortedDictionary<string, SortedList<long, string>> store = new(StringComparer.Ordinal);
    public void Set(string k, string v, long t) { if (!store.TryGetValue(k, out var h)) store[k] = h = new SortedList<long, string>(); h[t] = v; }
    public string Get(string k, long t) {
        if (!store.TryGetValue(k, out var h)) return "";
        var keys = h.Keys; int lo = 0, hi = keys.Count - 1, ans = -1;      // last index with key <= t
        while (lo <= hi) { int mid = (lo + hi) / 2; if (keys[mid] <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
        return ans < 0 ? "" : h.Values[ans];
    }
    public string Serialize() {
        var sb = new StringBuilder();
        foreach (var ke in store) foreach (var ve in ke.Value)
            sb.Append(ke.Key.Length).Append(':').Append(ke.Key).Append(ve.Value.Length).Append(':').Append(ve.Value).Append(ve.Key).Append(';');
        return sb.ToString();
    }
    public void Load(string s) {
        store.Clear(); int i = 0;
        while (i < s.Length) {
            int c = s.IndexOf(':', i); int kl = int.Parse(s[i..c]); i = c + 1;
            string k = s.Substring(i, kl); i += kl;
            c = s.IndexOf(':', i); int vl = int.Parse(s[i..c]); i = c + 1;
            string v = s.Substring(i, vl); i += vl;
            int semi = s.IndexOf(';', i); long t = long.Parse(s[i..semi]); i = semi + 1;
            Set(k, v, t);
        }
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; var tm = new TimeMap();
        for (int q = 0; q < ops.Length; q++) {
            string op = ops[q], arg = args[q];
            if (op == "set") { int a = arg.IndexOf(','), b = arg.LastIndexOf(','); tm.Set(arg[..a], arg[(a + 1)..b], long.Parse(arg[(b + 1)..])); output[q] = "null"; }
            else if (op == "get") { int b = arg.LastIndexOf(','); output[q] = tm.Get(arg[..b], long.Parse(arg[(b + 1)..])); }
            else if (op == "serialize") output[q] = tm.Serialize();
            else if (op == "load") { tm.Load(arg); output[q] = "null"; }
            else output[q] = "null";
            T.R("op", op, "arg", arg, "keys", new List<string>(tm.store.Keys));
        }
        return output;
    }
}
