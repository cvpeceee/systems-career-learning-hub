using System;
// LCS - 2-D DP with one rolling row.  O(m*n) time, O(n) space.
public class Solution {
    public int LongestCommonSubsequence(string text1, string text2) {
        int n = text2.Length; var prev = new int[n + 1];
        for (int i = 1; i <= text1.Length; i++) {
            var cur = new int[n + 1];
            for (int j = 1; j <= n; j++)
                cur[j] = text1[i - 1] == text2[j - 1] ? prev[j - 1] + 1 : Math.Max(prev[j], cur[j - 1]);
            prev = cur;
        }
        return prev[n];
    }
}
