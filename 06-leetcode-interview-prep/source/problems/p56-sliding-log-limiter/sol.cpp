// Sliding-log rate limiter - per-client deque of allowed timestamps.  Amortized O(1) per request.
class Limiter {
    int limit; long long w;
    unordered_map<string, deque<long long>> log_;            // client -> times of ALLOWED requests
public:
    Limiter(int l, long long win) : limit(l), w(win) {}
    bool allow(const string& client, long long t) {
        auto& q = log_[client];
        while (!q.empty() && q.front() <= t - w) q.pop_front();   // expire outside (t-w, t]
        if ((int)q.size() >= limit) return false;           // over the limit: reject, do not log
        q.push_back(t);
        return true;
    }
    map<string, deque<long long>> view() const { return map<string, deque<long long>>(log_.begin(), log_.end()); }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; Limiter* L = nullptr;
        for (size_t i = 0; i < ops.size(); i++) {
            string op = ops[i], arg = args[i];
            size_t c = arg.find(',');
            if (op == "Limiter") { L = new Limiter(stoi(arg.substr(0, c)), stoll(arg.substr(c + 1))); out.push_back("null"); continue; }
            out.push_back(L->allow(arg.substr(0, c), stoll(arg.substr(c + 1))) ? "true" : "false");
            map<string, deque<long long>> log = L->view();
            TR("op", op, "arg", arg, "log", log, "out", out);
        }
        delete L;
        return out;
    }
};
