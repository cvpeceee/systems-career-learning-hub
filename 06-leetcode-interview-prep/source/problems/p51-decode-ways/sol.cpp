// Decode Ways - climbing-stairs DP with validity checks.  O(n), O(1).
class Solution {
public:
    int numDecodings(string s) {
        FN("numDecodings");
        int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0;   // dp[0] (empty) and dp[1]
        vector<int> dp = {prev2, prev1};
        for (int i = 2; i <= (int)s.size(); i++) {
            int cur = 0;
            if (s[i - 1] != '0') cur += prev1;                     // single digit 1..9
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (two >= 10 && two <= 26) cur += prev2;              // pair 10..26
            prev2 = prev1; prev1 = cur;
            dp.push_back(cur);
            TR("s", s, "i", i, "dp", dp);
        }
        return prev1;
    }
};
