// Nearest POI - uniform grid + ring search with a proven stopping rule.
class Solution {
    static long long fdiv(long long a, long long b) { return a >= 0 ? a / b : -((-a + b - 1) / b); }   // floor division
public:
    vector<int> nearest(vector<vector<int>> pois, vector<vector<int>> queries, int cell) {
        FN("nearest");
        map<pair<long long,long long>, vector<int>> grid;
        long long minx = LLONG_MAX, maxx = LLONG_MIN, miny = LLONG_MAX, maxy = LLONG_MIN;
        for (int i = 0; i < (int)pois.size(); i++) {
            long long cx = fdiv(pois[i][0], cell), cy = fdiv(pois[i][1], cell);
            grid[{cx, cy}].push_back(i);
            minx = min(minx, cx); maxx = max(maxx, cx); miny = min(miny, cy); maxy = max(maxy, cy);
        }
        vector<int> out;
        for (auto& q : queries) {
            long long qx = fdiv(q[0], cell), qy = fdiv(q[1], cell);
            long long maxr = max(max(llabs(qx - minx), llabs(qx - maxx)), max(llabs(qy - miny), llabs(qy - maxy)));
            long long best = LLONG_MAX; int bi = -1;
            for (long long r = 0; r <= maxr; r++) {
                for (long long dx = -r; dx <= r; dx++)
                    for (long long dy = -r; dy <= r; dy++) {
                        if (max(llabs(dx), llabs(dy)) != r) continue;            // ring only
                        auto it = grid.find({qx + dx, qy + dy});
                        if (it == grid.end()) continue;
                        for (int i : it->second) {
                            long long ddx = pois[i][0] - q[0], ddy = pois[i][1] - q[1], d = ddx * ddx + ddy * ddy;
                            if (d < best || (d == best && i < bi)) { best = d; bi = i; }
                        }
                    }
                long long reach = r * (long long)cell;                          // anything further is >= reach away
                TR("r", r, "best", best, "bi", bi);
                if (bi >= 0 && best < reach * reach) break;
            }
            out.push_back(bi);
        }
        return out;
    }
};
