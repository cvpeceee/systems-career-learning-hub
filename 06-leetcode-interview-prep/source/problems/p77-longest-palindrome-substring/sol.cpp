// Longest Palindromic Substring - expand around all 2n-1 centers.  O(n^2) time, O(1) space.
class Solution {
public:
    string longestPalindrome(string s) {
        FN("longestPalindrome");
        int bestL = 0, bestLen = 1, n = s.size();
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, r = l + c % 2;                   // odd center (l==r) or even gap
            while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
            int len = r - l - 1;                             // last matching window was (l+1 .. r-1)
            if (len > bestLen) { bestLen = len; bestL = l + 1; }
            TR("s", s, "l", l + 1, "r", r - 1, "bestLen", bestLen);
        }
        return s.substr(bestL, bestLen);
    }
};
