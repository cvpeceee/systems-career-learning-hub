// LCS - 2-D DP over prefixes.  O(m*n).
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        FN("longestCommonSubsequence");
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1[i - 1] == text2[j - 1] ? dp[i - 1][j - 1] + 1      // both tick
                                                        : max(dp[i - 1][j], dp[i][j - 1]);   // skip one
            TR("dp", dp, "i", i, "text1", text1, "text2", text2);
        }
        return dp[m][n];
    }
};
