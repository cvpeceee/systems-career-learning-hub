// Alien Dictionary - edges from first differing chars, then Kahn's topological sort (min-heap for ties).
class Solution {
public:
    string alienOrder(vector<string> words) {
        FN("alienOrder");
        map<char, set<char>> g; map<char, int> indeg;
        for (auto& w : words) for (char c : w) indeg[c] += 0;        // every letter is a node
        for (size_t i = 0; i + 1 < words.size(); i++) {
            const string &a = words[i], &b = words[i + 1];
            size_t k = 0;
            while (k < a.size() && k < b.size() && a[k] == b[k]) k++;
            if (k == b.size() && a.size() > b.size()) return "";       // "abc" before "ab": invalid
            if (k < a.size() && k < b.size() && !g[a[k]].count(b[k])) { g[a[k]].insert(b[k]); indeg[b[k]]++; }
        }
        priority_queue<char, vector<char>, greater<char>> ready;       // smallest available letter first
        for (auto& kv : indeg) if (kv.second == 0) ready.push(kv.first);
        string order;
        while (!ready.empty()) {
            char c = ready.top(); ready.pop(); order += c;
            for (char nx : g[c]) if (--indeg[nx] == 0) ready.push(nx);
            TR("ready", ready, "order", order, "indeg", indeg);
        }
        return order.size() == indeg.size() ? order : "";              // leftover = cycle
    }
};
