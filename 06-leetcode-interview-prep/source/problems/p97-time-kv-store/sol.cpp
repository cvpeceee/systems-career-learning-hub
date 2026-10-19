// Versioned KV store + length-prefixed persistence.  O(log v) set/get.
class TimeMap {
    map<string, map<long long, string>> store;            // key -> (t -> value), both sorted
public:
    void set(const string& k, const string& v, long long t) { store[k][t] = v; }
    string get(const string& k, long long t) {
        auto it = store.find(k);
        if (it == store.end()) return "";
        auto ub = it->second.upper_bound(t);              // first version AFTER t
        return ub == it->second.begin() ? "" : prev(ub)->second;
    }
    string serialize() const {
        string out;
        for (auto& [k, hist] : store)
            for (auto& [t, v] : hist) out += to_string(k.size()) + ":" + k + to_string(v.size()) + ":" + v + to_string(t) + ";";
        return out;
    }
    void load(const string& s) {
        store.clear();
        size_t i = 0;
        auto readLen = [&]() { size_t c = s.find(':', i); size_t n = stoul(s.substr(i, c - i)); i = c + 1; return n; };
        while (i < s.size()) {
            size_t kl = readLen(); string k = s.substr(i, kl); i += kl;
            size_t vl = readLen(); string v = s.substr(i, vl); i += vl;
            size_t semi = s.find(';', i); long long t = stoll(s.substr(i, semi - i)); i = semi + 1;
            store[k][t] = v;
        }
    }
    map<string, vector<long long>> view() const { map<string, vector<long long>> m; for (auto& [k, h] : store) for (auto& p : h) m[k].push_back(p.first); return m; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; TimeMap tm;
        for (size_t q = 0; q < ops.size(); q++) {
            string op = ops[q], arg = args[q];
            if (op == "set") {
                size_t a = arg.find(','), b = arg.rfind(',');          // value = between first and last comma
                tm.set(arg.substr(0, a), arg.substr(a + 1, b - a - 1), stoll(arg.substr(b + 1))); out.push_back("null");
            } else if (op == "get") {
                size_t b = arg.rfind(','); out.push_back(tm.get(arg.substr(0, b), stoll(arg.substr(b + 1))));
            } else if (op == "serialize") out.push_back(tm.serialize());
            else if (op == "load") { tm.load(arg); out.push_back("null"); }
            else out.push_back("null");
            map<string, vector<long long>> store = tm.view();
            TR("op", op, "arg", arg, "store", store, "out", out);
        }
        return out;
    }
};
