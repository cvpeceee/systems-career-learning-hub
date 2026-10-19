// BPE - repeatedly merge the most frequent adjacent pair (deterministic ties).  O(merges * N).
class Solution {
public:
    vector<string> bpe(string text, int merges) {
        FN("bpe");
        vector<vector<string>> words;                        // each word = list of tokens
        stringstream ss(text); string w;
        while (ss >> w) { vector<string> t; for (char c : w) t.push_back(string(1, c)); words.push_back(t); }
        for (int round = 0; round < merges; round++) {
            map<pair<string, string>, int> cnt;              // ordered map -> ties break by (left, right)
            for (auto& t : words) for (size_t i = 0; i + 1 < t.size(); i++) cnt[{t[i], t[i + 1]}]++;
            pair<string, string> best; int bestC = 0;
            for (auto& [p, c] : cnt) if (c > bestC) { bestC = c; best = p; }   // first max = smallest pair
            if (bestC < 2) break;
            for (auto& t : words) {                          // merge left-to-right, non-overlapping
                vector<string> nt;
                for (size_t i = 0; i < t.size(); i++) {
                    if (i + 1 < t.size() && t[i] == best.first && t[i + 1] == best.second) { nt.push_back(t[i] + t[i + 1]); i++; }
                    else nt.push_back(t[i]);
                }
                t = nt;
            }
            vector<string> tokens; for (auto& t : words) for (auto& x : t) tokens.push_back(x);
            string merged = best.first + best.second;
            TR("tokens", tokens, "round", round, "best", merged, "count", bestC);
        }
        vector<string> out;
        for (auto& t : words) for (auto& x : t) out.push_back(x);
        return out;
    }
};
