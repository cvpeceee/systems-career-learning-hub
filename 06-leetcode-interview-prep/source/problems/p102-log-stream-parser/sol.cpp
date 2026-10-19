// Streaming log parser - one pass, per-service counters + error-message tallies.  O(total chars).
class Solution {
    struct Stats { int err = 0, warn = 0, info = 0; map<string, int> errMsg; };
public:
    vector<string> summarize(vector<string> lines) {
        FN("summarize");
        map<string, Stats> stats; int malformed = 0;
        for (int i = 0; i < (int)lines.size(); i++) {
            const string& ln = lines[i];
            size_t a = ln.find(' '), b = a == string::npos ? a : ln.find(' ', a + 1), c = b == string::npos ? b : ln.find(' ', b + 1);
            if (c == string::npos || c + 1 >= ln.size()) { malformed++; continue; }   // fewer than 4 fields
            string level = ln.substr(a + 1, b - a - 1), svc = ln.substr(b + 1, c - b - 1), msg = ln.substr(c + 1);
            if (level != "ERROR" && level != "WARN" && level != "INFO") { malformed++; continue; }
            Stats& s = stats[svc];
            if (level == "ERROR") { s.err++; s.errMsg[msg]++; } else if (level == "WARN") s.warn++; else s.info++;
            TR("i", i, "svc", svc, "malformed", malformed);
        }
        vector<string> out;
        for (auto& [svc, s] : stats) {
            string top = "-"; int best = 0;
            for (auto& [m, n] : s.errMsg) if (n > best) { best = n; top = m; }       // first max = smallest string
            out.push_back(svc + ": ERROR=" + to_string(s.err) + " WARN=" + to_string(s.warn) + " INFO=" + to_string(s.info) + " top=" + top);
        }
        out.push_back("malformed=" + to_string(malformed));
        return out;
    }
};
