// KV DB with nested transactions - undo-log stack + value counts.  O(1) per command.
class Solution {
    map<string, string> data;
    unordered_map<string, int> counts;                              // value -> how many keys hold it
    vector<map<string, optional<string>>> undo;                     // one notepad per open transaction
    void write(const string& k, optional<string> v) {               // single place that changes data
        if (!undo.empty() && !undo.back().count(k))                 // first change of k in this txn
            undo.back()[k] = data.count(k) ? optional<string>(data[k]) : nullopt;
        if (data.count(k)) counts[data[k]]--;
        if (v) { data[k] = *v; counts[*v]++; } else data.erase(k);
    }
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out;
        for (size_t q = 0; q < ops.size(); q++) {
            string op = ops[q], arg = args[q], res;
            if (op == "SET") { size_t c = arg.find(','); write(arg.substr(0, c), arg.substr(c + 1)); }
            else if (op == "UNSET") write(arg, nullopt);
            else if (op == "GET") res = data.count(arg) ? data[arg] : "NULL";
            else if (op == "COUNT") res = to_string(counts.count(arg) ? counts[arg] : 0);
            else if (op == "BEGIN") undo.push_back({});
            else if (op == "ROLLBACK") {
                if (undo.empty()) res = "NO TRANSACTION";
                else {
                    auto notes = undo.back(); undo.pop_back();
                    for (auto& [k, old] : notes) {                  // restore without logging
                        if (data.count(k)) counts[data[k]]--;
                        if (old) { data[k] = *old; counts[*old]++; } else data.erase(k);
                    }
                }
            } else if (op == "COMMIT") { if (undo.empty()) res = "NO TRANSACTION"; else undo.clear(); }
            out.push_back(res);
            int depth = undo.size();
            TR("op", op, "arg", arg, "depth", depth, "data", data, "out", out);
        }
        return out;
    }
};
