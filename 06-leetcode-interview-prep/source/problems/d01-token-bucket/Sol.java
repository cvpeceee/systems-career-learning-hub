// Token bucket - lazy refill using integer milli-tokens.  O(1) per request.
class TokenBucket {
    private final long capm, rate; private long tokens, last = 0;
    TokenBucket(int cap, int r) { capm = cap * 1000L; rate = r; tokens = capm; }
    boolean allow(long t) {
        tokens = Math.min(capm, tokens + (t - last) * rate);   // lazy refill
        last = t;
        T.r("tokens", tokens, "capm", capm, "t", t);
        if (tokens >= 1000) { tokens -= 1000; return true; }   // spend one token
        return false;
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; TokenBucket b = null;
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("TokenBucket")) { String[] p = args[i].split(","); b = new TokenBucket(Integer.parseInt(p[0]), Integer.parseInt(p[1])); out[i] = "null"; }
            else out[i] = String.valueOf(b.allow(Long.parseLong(args[i])));
        }
        return out;
    }
}
