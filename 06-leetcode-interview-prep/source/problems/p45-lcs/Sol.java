// LCS - 2-D DP with one rolling row.  O(m*n) time, O(n) space.
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int n = text2.length(); int[] prev = new int[n + 1];
        for (int i = 1; i <= text1.length(); i++) {
            int[] cur = new int[n + 1];
            for (int j = 1; j <= n; j++)
                cur[j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
            prev = cur;
        }
        return prev[n];
    }
}
