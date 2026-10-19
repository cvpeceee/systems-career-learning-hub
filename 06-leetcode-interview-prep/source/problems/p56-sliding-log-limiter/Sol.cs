using System.Collections.Generic;
// Sliding-log rate limiter - per-client queue of allowed timestamps.  Amortized O(1) per request.
public class Limiter {
    readonly int limit; readonly long w;
    public readonly Dictionary<string, Queue<long>> Log = new();
    public Limiter(int limit, long w) { this.limit = limit; this.w = w; }
    public bool Allow(string client, long t) {
        if (!Log.TryGetValue(client, out var q)) Log[client] = q = new Queue<long>();
        while (q.Count > 0 && q.Peek() <= t - w) q.Dequeue();   // expire
        if (q.Count >= limit) return false;
        q.Enqueue(t);
        return true;
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; Limiter L = null;
        for (int i = 0; i < ops.Length; i++) {
            var a = args[i].Split(',');
            if (ops[i] == "Limiter") { L = new Limiter(int.Parse(a[0]), long.Parse(a[1])); output[i] = "null"; }
            else output[i] = L.Allow(a[0], long.Parse(a[1])) ? "true" : "false";
            if (i > 0) T.R("op", ops[i], "arg", args[i], "log", L.Log, "out", output[i]);
        }
        return output;
    }
}
