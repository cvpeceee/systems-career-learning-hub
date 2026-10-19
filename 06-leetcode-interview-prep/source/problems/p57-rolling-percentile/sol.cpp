// Rolling percentile - keep the window sorted (binary-search insert/erase), read rank ceil(p*m/100).
class Solution {
public:
    vector<int> rollingPercentile(vector<int> lat, int w, int p) {
        FN("rollingPercentile");
        vector<int> win, out;                                         // win = current window, sorted
        for (int i = 0; i < (int)lat.size(); i++) {
            if (i >= w) win.erase(lower_bound(win.begin(), win.end(), lat[i - w]));   // drop the expired value (one copy)
            win.insert(upper_bound(win.begin(), win.end(), lat[i]), lat[i]);         // slot new value in order
            int m = win.size();
            int rank = (p * m + 99) / 100;                            // ceil(p*m/100), 1-based
            out.push_back(win[max(rank, 1) - 1]);
            TR("lat", lat, "i", i, "win", win, "rank", rank, "out", out);
        }
        return out;
    }
};
