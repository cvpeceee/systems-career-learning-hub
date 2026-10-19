using System; using System.Collections.Generic;
// KV DB with nested transactions - undo-log stack + value counts.  O(1) per command.
public class Solution {
    SortedDictionary<string, string> data = new(StringComparer.Ordinal);
    Dictionary<string, int> counts = new();
    Stack<Dictionary<string, string>> undo = new();                 // null value = key was absent
    void Apply(string k, string v) {
        if (data.TryGetValue(k, out var old)) counts[old]--;
        if (v != null) { data[k] = v; counts[v] = counts.GetValueOrDefault(v) + 1; } else data.Remove(k);
    }
    void Write(string k, string v) {
        if (undo.Count > 0 && !undo.Peek().ContainsKey(k)) undo.Peek()[k] = data.TryGetValue(k, out var o) ? o : null;
        Apply(k, v);
    }
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length];
        for (int q = 0; q < ops.Length; q++) {
            string op = ops[q], arg = args[q], res = "";
            switch (op) {
                case "SET": { int c = arg.IndexOf(','); Write(arg[..c], arg[(c + 1)..]); break; }
                case "UNSET": Write(arg, null); break;
                case "GET": res = data.TryGetValue(arg, out var v) ? v : "NULL"; break;
                case "COUNT": res = counts.GetValueOrDefault(arg).ToString(); break;
                case "BEGIN": undo.Push(new Dictionary<string, string>()); break;
                case "ROLLBACK":
                    if (undo.Count == 0) res = "NO TRANSACTION";
                    else foreach (var e in undo.Pop()) Apply(e.Key, e.Value);
                    break;
                case "COMMIT": if (undo.Count == 0) res = "NO TRANSACTION"; else undo.Clear(); break;
            }
            output[q] = res;
            T.R("op", op, "arg", arg, "depth", undo.Count, "data", data);
        }
        return output;
    }
}
