import java.util.*;
// Coin change - bottom-up DP over amounts.  O(amount * k) time, O(amount) space.
class Solution {
    public int coinChange(int[] coins, int amount) {
        int INF = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);   // c is the last coin
        return dp[amount] >= INF ? -1 : dp[amount];
    }
}
