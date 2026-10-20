// Rectangle Area II - strip sweep over distinct x edges, merge y intervals per strip.  O(n^2 log n).
class Solution {
public:
    int rectangleArea(vector<vector<int>> rects) {
        FN("rectangleArea");
        vector<int> xs;
        for (auto& r : rects) { xs.push_back(r[0]); xs.push_back(r[2]); }
        sort(xs.begin(), xs.end()); xs.erase(unique(xs.begin(), xs.end()), xs.end());
        long long area = 0;
        for (int i = 0; i + 1 < (int)xs.size(); i++) {
            vector<pair<int,int>> ys;                                  // y ranges spanning this strip
            for (auto& r : rects) if (r[0] <= xs[i] && r[2] >= xs[i + 1]) ys.push_back({r[1], r[3]});
            sort(ys.begin(), ys.end());
            long long cov = 0; long long s = -1, e = -1;
            for (auto& y : ys) {
                if (y.first > e) { cov += e - s; s = y.first; e = y.second; }   // gap: close the run
                else e = max(e, (long long)y.second);                         // overlap: extend
            }
            cov += e - s;
            area += cov * (long long)(xs[i + 1] - xs[i]);
            TR("xs", xs, "i", i, "cov", cov, "area", area);
        }
        return (int)(area % 1000000007LL);
    }
};
