// K Closest Points - max-heap of size k on squared distance.  O(n log k).
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>> points, int k) {
        FN("kClosest");
        auto key = [](const vector<int>& p) { return make_tuple((long long)p[0] * p[0] + (long long)p[1] * p[1], p[0], p[1]); };
        priority_queue<tuple<long long,int,int>> pq;         // max-heap: farthest of the best k on top
        for (int i = 0; i < (int)points.size(); i++) {
            pq.push(key(points[i]));
            if ((int)pq.size() > k) pq.pop();                // throw out the farthest
            vector<long long> heap; { auto c = pq; while (!c.empty()) { heap.push_back(get<0>(c.top())); c.pop(); } }
            TR("i", i, "heap", heap);
        }
        vector<vector<int>> out;
        while (!pq.empty()) { auto [d, x, y] = pq.top(); pq.pop(); out.push_back({x, y}); }
        reverse(out.begin(), out.end());                     // nearest first
        return out;
    }
};
