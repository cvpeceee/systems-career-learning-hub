using System;
// Coin change - bottom-up DP over amounts.  O(amount * k) time, O(amount) space.
public class Solution {
    public int CoinChange(int[] coins, int amount) {
        int INF = amount + 1;
        var dp = new int[amount + 1];
        Array.Fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            foreach (int c in coins)
                if (c <= a) dp[a] = Math.Min(dp[a], dp[a - c] + 1);   // c is the last coin
        return dp[amount] >= INF ? -1 : dp[amount];
    }
}
