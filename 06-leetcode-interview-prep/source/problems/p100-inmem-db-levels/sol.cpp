// In-memory DB levels 1-3 - key -> ordered(field -> {value, expiresAt}); lazy expiry.
class Solution {
    struct Cell { string value; long long expiresAt; };          // LLONG_MAX = never expires
    map<string, map<string, Cell>> db;
    static vector<string> split(const string& s) { vector<string> v; stringstream ss(s); string t; while (getline(ss, t, ',')) v.push_back(t); return v; }
    static bool alive(const Cell& c, long long now) { return now < c.expiresAt; }
    string scan(const string& key, const string& prefix, long long now) {
        auto it = db.find(key);
        if (it == db.end()) return "";
        string out;
        for (auto f = it->second.lower_bound(prefix); f != it->second.end() && f->first.compare(0, prefix.size(), prefix) == 0; ++f)
            if (alive(f->second, now)) out += (out.empty() ? "" : ", ") + f->first + "(" + f->second.value + ")";
        return out;
    }
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        const long long NOW_ANY = LLONG_MIN;                      // un-timed ops: everything alive
        vector<string> out;
        for (size_t q = 0; q < ops.size(); q++) {
            string op = ops[q]; vector<string> a = split(args[q]); string res;
            if (op == "SET") db[a[0]][a[1]] = {a[2], LLONG_MAX};
            else if (op == "SET_AT") db[a[0]][a[1]] = {a[2], LLONG_MAX};
            else if (op == "SET_AT_WITH_TTL") db[a[0]][a[1]] = {a[2], stoll(a[3]) + stoll(a[4])};
            else if (op == "GET" || op == "GET_AT") {
                long long now = op == "GET" ? NOW_ANY : stoll(a[2]);
                auto k = db.find(a[0]);
                if (k != db.end()) { auto f = k->second.find(a[1]); if (f != k->second.end() && alive(f->second, now)) res = f->second.value; }
            } else if (op == "DELETE" || op == "DELETE_AT") {
                long long now = op == "DELETE" ? NOW_ANY : stoll(a[2]);
                bool ok = false; auto k = db.find(a[0]);
                if (k != db.end()) { auto f = k->second.find(a[1]); if (f != k->second.end() && alive(f->second, now)) { k->second.erase(f); ok = true; } }
                res = ok ? "true" : "false";
            } else if (op == "SCAN") res = scan(a[0], "", NOW_ANY);
            else if (op == "SCAN_AT") res = scan(a[0], "", stoll(a[1]));
            else if (op == "SCAN_PREFIX") res = scan(a[0], a[1], NOW_ANY);
            else if (op == "SCAN_PREFIX_AT") res = scan(a[0], a[1], stoll(a[2]));
            out.push_back(res);
            map<string, vector<string>> view; for (auto& [k, fs] : db) for (auto& [f, c] : fs) view[k].push_back(f + "=" + c.value);
            TR("op", op, "arg", args[q], "db", view, "out", out);
        }
        return out;
    }
};
