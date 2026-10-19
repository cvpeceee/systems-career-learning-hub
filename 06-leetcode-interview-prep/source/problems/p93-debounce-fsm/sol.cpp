// Debounce - (stable, count) state machine; flip after k disagreeing samples in a row.  O(n).
class Solution {
public:
    vector<int> debounce(vector<int> samples, int k) {
        FN("debounce");
        int stable = 0, count = 0; vector<int> out;
        for (int t = 0; t < (int)samples.size(); t++) {
            if (samples[t] != stable) {
                if (++count >= k) { stable = samples[t]; count = 0; }   // believed: change state
            } else count = 0;                                           // agreeing sample resets patience
            out.push_back(stable);
            TR("out", out, "t", t, "count", count, "stable", stable);
        }
        return out;
    }
};
