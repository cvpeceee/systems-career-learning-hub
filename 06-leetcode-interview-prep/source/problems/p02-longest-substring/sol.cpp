// Longest substring without repeats - sliding window + last-seen index.  O(n) time.
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        FN("lengthOfLongestSubstring");
        unordered_map<char, int> last;   // char -> last index where it appeared
        int left = 0, best = 0;          // window is s[left..r]
        TR("s", s, "left", left, "best", best, "last", last);
        for (int r = 0; r < (int)s.size(); ++r) {
            char c = s[r];
            auto it = last.find(c);
            if (it != last.end() && it->second >= left)   // c is inside the current window
                left = it->second + 1;                     // jump tail past the old copy
            TR("s", s, "left", left, "r", r, "c", c, "best", best, "last", last);
            last[c] = r;                                   // remember newest position
            best = max(best, r - left + 1);                // window length
            TR("s", s, "left", left, "r", r, "c", c, "best", best, "last", last);
        }
        return best;
    }
};
