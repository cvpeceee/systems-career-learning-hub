// Currency conversion - DFS over a two-way rate graph, multiplying along the path.  O(V+E).
class Solution {
public:
    double convert(vector<string> rates, string from, string to) {
        FN("convert");
        map<string, vector<pair<string, double>>> g;
        for (auto& r : rates) {
            size_t a = r.find(','), b = r.rfind(',');
            string x = r.substr(0, a), y = r.substr(a + 1, b - a - 1); double v = stod(r.substr(b + 1));
            g[x].push_back({y, v}); g[y].push_back({x, 1.0 / v});      // both directions
        }
        if (!g.count(from) || !g.count(to)) return -1.0;
        vector<pair<string, double>> stack{{from, 1.0}}; set<string> seen{from};
        while (!stack.empty()) {
            auto [cur, amount] = stack.back(); stack.pop_back();
            TR("cur", cur, "amount", amount);
            if (cur == to) return amount;
            for (auto& [nx, r] : g[cur]) if (seen.insert(nx).second) stack.push_back({nx, amount * r});
        }
        return -1.0;
    }
};
