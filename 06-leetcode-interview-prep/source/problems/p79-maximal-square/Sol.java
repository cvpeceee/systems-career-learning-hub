// Maximal Square - dp[i][j] = 1 + min(top, left, top-left).  O(r*c).
class Solution {
    public int maximalSquare(int[][] matrix) {
        int R = matrix.length, C = matrix[0].length, side = 0;
        int[][] dp = new int[R][C];
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++) {
                if (matrix[i][j] == 1)
                    dp[i][j] = (i == 0 || j == 0) ? 1 : 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
                side = Math.max(side, dp[i][j]);
                T.r("dp", dp, "i", i, "j", j, "side", side);
            }
        return side * side;
    }
}
