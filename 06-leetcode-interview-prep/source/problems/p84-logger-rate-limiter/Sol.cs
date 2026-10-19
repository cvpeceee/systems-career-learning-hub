using System; using System.Collections.Generic;
// Logger Rate Limiter - map message -> next time it may print.  O(1) per call.
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; var next = new SortedDictionary<string, int>(StringComparer.Ordinal);
        for (int k = 0; k < ops.Length; k++) {
            if (ops[k] == "Logger") { output[k] = "null"; continue; }
            int comma = args[k].IndexOf(','); int t = int.Parse(args[k][..comma]); string msg = args[k][(comma + 1)..];
            bool ok = !next.TryGetValue(msg, out int allowed) || t >= allowed;
            if (ok) next[msg] = t + 10;
            output[k] = ok ? "true" : "false";
            T.R("op", ops[k], "arg", args[k], "next", next);
        }
        return output;
    }
}
