// Hashed timer wheel - bucket = fireTime % S; each tick inspects one bucket.  O(1) add/cancel.
class TimerWheel {
    int S; long long now = 0;
    vector<set<string>> slot;                              // ids per bucket
    unordered_map<string, long long> fireAt;               // id -> absolute fire tick (tells laps apart)
public:
    explicit TimerWheel(int s) : S(s), slot(s) {}
    void add(const string& id, long long delay) {
        long long t = now + delay;
        fireAt[id] = t; slot[t % S].insert(id);
    }
    bool cancel(const string& id) {
        auto it = fireAt.find(id);
        if (it == fireAt.end()) return false;              // unknown or already fired
        slot[it->second % S].erase(id); fireAt.erase(it);
        return true;
    }
    string tick() {
        now++;
        auto& b = slot[now % S];
        string fired;
        for (auto it = b.begin(); it != b.end();) {
            if (fireAt[*it] == now) {                      // due this lap
                fired += (fired.empty() ? "" : ",") + *it;
                fireAt.erase(*it); it = b.erase(it);
            } else ++it;                                   // later lap: leave it
        }
        return fired;                                      // set => already sorted
    }
    long long time() const { return now; }
    vector<vector<string>> view() const { vector<vector<string>> v; for (auto& s : slot) v.push_back(vector<string>(s.begin(), s.end())); return v; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; unique_ptr<TimerWheel> w;
        for (size_t i = 0; i < ops.size(); i++) {
            string op = ops[i], arg = args[i];
            if (op == "Wheel") { w = make_unique<TimerWheel>(stoi(arg)); out.push_back("null"); }
            else if (op == "add") { size_t c = arg.find(','); w->add(arg.substr(0, c), stoll(arg.substr(c + 1))); out.push_back("null"); }
            else if (op == "cancel") out.push_back(w->cancel(arg) ? "true" : "false");
            else out.push_back(w->tick());
            vector<vector<string>> wheel = w->view(); long long now = w->time();
            TR("op", op, "arg", arg, "now", now, "wheel", wheel, "out", out);
        }
        return out;
    }
};
