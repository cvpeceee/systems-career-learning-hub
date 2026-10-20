// MC/DC coverage - bitmask each row; the independence partner for condition c is mask ^ (1<<c).  O(R*n).
class Solution {
public:
    vector<int> mcdc(int n, vector<vector<int>> rows) {
        FN("mcdc");
        unordered_map<int, int> outcome;                     // mask -> outcome (0/1)
        for (auto& r : rows) {
            int m = 0;
            for (int k = 0; k < n; k++) if (r[k]) m |= 1 << k;
            outcome[m] = r[n];
        }
        vector<int> shown(n, 0);
        for (int c = 0; c < n; c++) {
            for (auto& [m, o] : outcome) {
                auto it = outcome.find(m ^ (1 << c));            // differs only in condition c
                if (it != outcome.end() && it->second != o) { shown[c] = 1; break; }
            }
            TR("c", c, "shown", shown);
        }
        return shown;
    }
};
