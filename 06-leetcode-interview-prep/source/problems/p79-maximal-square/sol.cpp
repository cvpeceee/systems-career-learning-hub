// Maximal Square - dp[i][j] = 1 + min(top, left, top-left).  O(r*c).
class Solution {
public:
    int maximalSquare(vector<vector<int>> matrix) {
        FN("maximalSquare");
        int R = matrix.size(), C = matrix[0].size(), side = 0;
        vector<vector<int>> dp(R, vector<int>(C, 0));
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++) {
                if (matrix[i][j] == 1)
                    dp[i][j] = (i == 0 || j == 0) ? 1 : 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
                side = max(side, dp[i][j]);
                TR("dp", dp, "i", i, "j", j, "side", side);
            }
        return side * side;
    }
};
