// Logger Rate Limiter - map message -> next time it may print.  O(1) per call.
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; map<string, int> next;          // msg -> earliest allowed timestamp
        for (size_t k = 0; k < ops.size(); k++) {
            string op = ops[k], arg = args[k];
            if (op == "Logger") { out.push_back("null"); continue; }
            int t = stoi(arg.substr(0, arg.find(','))); string msg = arg.substr(arg.find(',') + 1);
            bool ok = !next.count(msg) || t >= next[msg];
            if (ok) next[msg] = t + 10;                      // only accepted prints reset the window
            out.push_back(ok ? "true" : "false");
            TR("op", op, "arg", arg, "next", next, "out", out);
        }
        return out;
    }
};
