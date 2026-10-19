// Merge intervals - sort by start, then sweep once.  O(n log n).
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        FN("merge");
        sort(intervals.begin(), intervals.end());           // by start (then end)
        vector<vector<int>> merged;
        for (int i = 0; i < (int)intervals.size(); ++i) {
            auto& cur = intervals[i];
            if (!merged.empty() && cur[0] <= merged.back()[1])    // overlaps/touches the last strip
                merged.back()[1] = max(merged.back()[1], cur[1]);  // extend (max handles containment)
            else
                merged.push_back(cur);                             // gap: start a new strip
            TR("intervals", intervals, "i", i, "merged", merged);
        }
        return merged;
    }
};
