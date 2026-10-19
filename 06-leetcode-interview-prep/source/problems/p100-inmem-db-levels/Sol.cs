using System; using System.Collections.Generic; using System.Text;
// In-memory DB levels 1-3 - key -> ordered(field -> {value, expiresAt}); lazy expiry.
public class Solution {
    record Cell(string Value, long ExpiresAt);
    SortedDictionary<string, SortedDictionary<string, Cell>> db = new(StringComparer.Ordinal);
    static bool Alive(Cell c, long now) => now < c.ExpiresAt;
    SortedDictionary<string, Cell> Rec(string k) { if (!db.TryGetValue(k, out var r)) db[k] = r = new SortedDictionary<string, Cell>(StringComparer.Ordinal); return r; }
    string Scan(string key, string prefix, long now) {
        if (!db.TryGetValue(key, out var fs)) return "";
        var sb = new StringBuilder();
        foreach (var e in fs)
            if (e.Key.StartsWith(prefix, StringComparison.Ordinal) && Alive(e.Value, now)) { if (sb.Length > 0) sb.Append(", "); sb.Append(e.Key).Append('(').Append(e.Value.Value).Append(')'); }
        return sb.ToString();
    }
    Cell Find(string k, string f) => db.TryGetValue(k, out var r) && r.TryGetValue(f, out var c) ? c : null;
    public string[] Run(string[] ops, string[] args) {
        const long ANY = long.MinValue;
        var output = new string[ops.Length];
        for (int q = 0; q < ops.Length; q++) {
            string op = ops[q]; var a = args[q].Split(','); string res = "";
            switch (op) {
                case "SET": case "SET_AT": Rec(a[0])[a[1]] = new Cell(a[2], long.MaxValue); break;
                case "SET_AT_WITH_TTL": Rec(a[0])[a[1]] = new Cell(a[2], long.Parse(a[3]) + long.Parse(a[4])); break;
                case "GET": case "GET_AT": { long now = op == "GET" ? ANY : long.Parse(a[2]); var c = Find(a[0], a[1]); if (c != null && Alive(c, now)) res = c.Value; break; }
                case "DELETE": case "DELETE_AT": {
                    long now = op == "DELETE" ? ANY : long.Parse(a[2]); var c = Find(a[0], a[1]);
                    bool ok = c != null && Alive(c, now); if (ok) db[a[0]].Remove(a[1]); res = ok ? "true" : "false"; break; }
                case "SCAN": res = Scan(a[0], "", ANY); break;
                case "SCAN_AT": res = Scan(a[0], "", long.Parse(a[1])); break;
                case "SCAN_PREFIX": res = Scan(a[0], a[1], ANY); break;
                case "SCAN_PREFIX_AT": res = Scan(a[0], a[1], long.Parse(a[2])); break;
            }
            output[q] = res;
            T.R("op", op, "arg", args[q], "keys", new List<string>(db.Keys));
        }
        return output;
    }
}
