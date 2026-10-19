using System;
// Best Time to Buy and Sell Stock - running minimum, best difference.  O(n).
public class Solution {
    public int MaxProfit(int[] prices) {
        int minPrice = int.MaxValue, best = 0;
        for (int i = 0; i < prices.Length; i++) {
            minPrice = Math.Min(minPrice, prices[i]);
            best = Math.Max(best, prices[i] - minPrice);
            T.R("prices", prices, "i", i, "minPrice", minPrice, "best", best);
        }
        return best;
    }
}
