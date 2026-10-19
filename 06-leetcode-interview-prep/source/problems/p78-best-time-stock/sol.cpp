// Best Time to Buy and Sell Stock - running minimum, best difference.  O(n).
class Solution {
public:
    int maxProfit(vector<int> prices) {
        FN("maxProfit");
        int minPrice = INT_MAX, best = 0;
        for (int i = 0; i < (int)prices.size(); i++) {
            minPrice = min(minPrice, prices[i]);           // cheapest buy so far
            best = max(best, prices[i] - minPrice);        // sell today?
            TR("prices", prices, "i", i, "minPrice", minPrice, "best", best);
        }
        return best;
    }
};
