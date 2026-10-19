// Coin change - bottom-up DP over amounts.  O(amount * k) time, O(amount) space.
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        FN("coinChange");
        const int INF = amount + 1;                    // safe "infinity": never overflows when +1
        vector<int> dp(amount + 1, INF);               // dp[a] = fewest coins to make a
        dp[0] = 0;                                     // zero coins make 0
        TR("coins", coins, "dp", dp);
        for (int a = 1; a <= amount; ++a) {
            for (int c : coins)
                if (c <= a && dp[a - c] + 1 < dp[a])   // use coin c as the LAST coin
                    dp[a] = dp[a - c] + 1;
            TR("coins", coins, "a", a, "dp", dp);
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }
};
