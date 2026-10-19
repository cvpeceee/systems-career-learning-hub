// Best Time to Buy and Sell Stock - running minimum, best difference.  O(n).
class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, best = 0;
        for (int i = 0; i < prices.length; i++) {
            minPrice = Math.min(minPrice, prices[i]);
            best = Math.max(best, prices[i] - minPrice);
            T.r("prices", prices, "i", i, "minPrice", minPrice, "best", best);
        }
        return best;
    }
}
