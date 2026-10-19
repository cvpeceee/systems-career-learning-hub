// Minimum Window Substring - expand right until valid, shrink left while valid.  O(|s|+|t|).
class Solution {
public:
    string minWindow(string s, string t) {
        FN("minWindow");
        map<char, int> need;                         // >0: still missing, <0: surplus in window
        for (char c : t) need[c]++;
        int missing = t.size(), l = 0, bestL = 0, bestLen = INT_MAX;
        for (int r = 0; r < (int)s.size(); r++) {
            if (need[s[r]]-- > 0) missing--;         // this char was actually needed
            TR("s", s, "l", l, "r", r, "need", need, "missing", missing);
            while (missing == 0) {                   // window [l..r] is valid: try to shrink
                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
                if (++need[s[l]] > 0) missing++;     // dropping a needed char breaks validity
                l++;
                TR("s", s, "l", l, "r", r, "need", need, "missing", missing, "bestLen", bestLen);
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};
