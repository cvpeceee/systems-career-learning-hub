// Token bucket - lazy refill using integer milli-tokens.  O(1) per request.
class TokenBucket {
    long long capm;       // capacity in milli-tokens (C * 1000)
    long long rate;       // tokens/sec == milli-tokens per millisecond
    long long tokens;     // current milli-tokens in the jar
    long long last = 0;   // time of last refill (ms)
public:
    TokenBucket(int cap, int r) : capm(cap * 1000LL), rate(r), tokens(cap * 1000LL) {}
    bool allow(long long t) {
        FN("allow");
        tokens = min(capm, tokens + (t - last) * rate);   // drip in what accumulated since last call
        last = t;
        bool ok = tokens >= 1000;                          // one whole token available?
        if (ok) tokens -= 1000;                            // spend it
        TR("t", t, "tokens", tokens, "capm", capm, "ok", ok);
        return ok;
    }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        vector<string> out; unique_ptr<TokenBucket> b;
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "TokenBucket") {
                size_t k = args[i].find(',');
                b = make_unique<TokenBucket>(stoi(args[i].substr(0, k)), stoi(args[i].substr(k + 1)));
                out.push_back("null");
            } else out.push_back(b->allow(stoll(args[i])) ? "true" : "false");
        }
        return out;
    }
};
