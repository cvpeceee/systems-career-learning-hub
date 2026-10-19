using System;
// Maximal Square - dp[i][j] = 1 + min(top, left, top-left).  O(r*c).
public class Solution {
    public int MaximalSquare(int[][] matrix) {
        int R = matrix.Length, C = matrix[0].Length, side = 0;
        var dp = new int[R][];
        for (int i = 0; i < R; i++) dp[i] = new int[C];
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++) {
                if (matrix[i][j] == 1)
                    dp[i][j] = (i == 0 || j == 0) ? 1 : 1 + Math.Min(dp[i - 1][j], Math.Min(dp[i][j - 1], dp[i - 1][j - 1]));
                side = Math.Max(side, dp[i][j]);
                T.R("dp", dp, "i", i, "j", j, "side", side);
            }
        return side * side;
    }
}
