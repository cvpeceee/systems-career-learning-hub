// Insert Interval - copy before, merge overlapping, copy after.  O(n).
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>> intervals, vector<int> newInterval) {
        FN("insert");
        vector<vector<int>> res;
        int i = 0, n = intervals.size();
        while (i < n && intervals[i][1] < newInterval[0]) res.push_back(intervals[i++]);   // entirely before
        TR("intervals", intervals, "i", i, "res", res, "newInterval", newInterval);
        while (i < n && intervals[i][0] <= newInterval[1]) {                                // overlaps: swallow
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
            TR("intervals", intervals, "i", i, "res", res, "newInterval", newInterval);
        }
        res.push_back(newInterval);
        while (i < n) res.push_back(intervals[i++]);                                        // entirely after
        TR("intervals", intervals, "i", i, "res", res);
        return res;
    }
};
