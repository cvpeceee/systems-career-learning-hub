// Word Break - prefix DP: ok[i] = s[0..i) can be segmented.  O(n * maxLen).
class Solution {
public:
    bool wordBreak(string s, vector<string> wordDict) {
        FN("wordBreak");
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        size_t maxLen = 0; for (auto& w : wordDict) maxLen = max(maxLen, w.size());
        int n = s.size();
        vector<int> ok(n + 1, 0); ok[0] = 1;                   // empty prefix: the shore
        for (int i = 1; i <= n; i++) {
            for (int j = i - 1; j >= 0 && i - j <= (int)maxLen; j--) {
                if (ok[j] && dict.count(s.substr(j, i - j))) { ok[i] = 1; break; }   // stand at j, jump a word
            }
            TR("ok", ok, "i", i);
        }
        return ok[n];
    }
};
