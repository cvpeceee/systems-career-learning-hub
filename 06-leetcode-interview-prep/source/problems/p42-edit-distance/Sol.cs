using System;
// Edit Distance - 2-D DP over prefixes.  O(m*n).
public class Solution {
    public int MinDistance(string word1, string word2) {
        int m = word1.Length, n = word2.Length;
        var dp = new int[m + 1][];
        for (int i = 0; i <= m; i++) { dp[i] = new int[n + 1]; dp[i][0] = i; }
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++)
                dp[i][j] = word1[i - 1] == word2[j - 1] ? dp[i - 1][j - 1]
                         : 1 + Math.Min(dp[i - 1][j - 1], Math.Min(dp[i - 1][j], dp[i][j - 1]));
            T.R("dp", dp, "i", i);
        }
        return dp[m][n];
    }
}
