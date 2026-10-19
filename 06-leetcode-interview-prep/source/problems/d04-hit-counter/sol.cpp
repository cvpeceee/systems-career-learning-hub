// Windowed hit counter - ring of W per-second buckets.  O(W) memory regardless of traffic.
class HitCounter {
    int W;
    vector<long long> times;   // which second each bucket currently represents
    vector<int> counts;        // hits in that second
public:
    explicit HitCounter(int w) : W(w), times(w, -1), counts(w, 0) {}
    void hit(long long t) {
        FN("hit");
        int i = t % W;                         // mailbox for this second
        if (times[i] != t) { times[i] = t; counts[i] = 0; }   // stale sticker: recycle the box
        counts[i]++;
        TR("t", t, "i", i, "counts", counts, "times", times);
    }
    int getHits(long long t) {
        FN("getHits");
        int total = 0;
        for (int i = 0; i < W; ++i)
            if (times[i] >= 0 && t - times[i] < W) total += counts[i];   // still inside (t-W, t]
        TR("t", t, "counts", counts, "times", times, "total", total);
        return total;
    }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        vector<string> out; unique_ptr<HitCounter> h;
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "HitCounter") { h = make_unique<HitCounter>(stoi(args[i])); out.push_back("null"); }
            else if (ops[i] == "hit") { h->hit(stoll(args[i])); out.push_back("null"); }
            else out.push_back(to_string(h->getHits(stoll(args[i]))));
        }
        return out;
    }
};
