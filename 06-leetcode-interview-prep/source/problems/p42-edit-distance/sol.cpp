// Edit Distance - 2-D DP over prefixes.  O(m*n).
class Solution {
public:
    int minDistance(string word1, string word2) {
        FN("minDistance");
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1));
        for (int i = 0; i <= m; i++) dp[i][0] = i;                // delete everything
        for (int j = 0; j <= n; j++) dp[0][j] = j;                // insert everything
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1[i - 1] == word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];          // free match
                else dp[i][j] = 1 + min({dp[i - 1][j],                                 // delete
                                         dp[i][j - 1],                                 // insert
                                         dp[i - 1][j - 1]});                           // replace
            }
            TR("dp", dp, "i", i, "word1", word1, "word2", word2);
        }
        return dp[m][n];
    }
};
