using System;
// Token bucket - lazy refill using integer milli-tokens.  O(1) per request.
public class TokenBucket {
    private readonly long capm, rate; private long tokens, last = 0;
    public TokenBucket(int cap, int r) { capm = cap * 1000L; rate = r; tokens = capm; }
    public bool Allow(long t) {
        tokens = Math.Min(capm, tokens + (t - last) * rate);   // lazy refill
        last = t;
        T.R("tokens", tokens, "capm", capm, "t", t);
        if (tokens >= 1000) { tokens -= 1000; return true; }   // spend one token
        return false;
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; TokenBucket b = null;
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "TokenBucket") { var p = args[i].Split(','); b = new TokenBucket(int.Parse(p[0]), int.Parse(p[1])); output[i] = "null"; }
            else output[i] = b.Allow(long.Parse(args[i])) ? "true" : "false";
        }
        return output;
    }
}
