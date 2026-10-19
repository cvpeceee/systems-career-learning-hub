// Longest Palindromic Substring - expand around all 2n-1 centers.  O(n^2) time, O(1) space.
class Solution {
    public String longestPalindrome(String s) {
        int bestL = 0, bestLen = 1, n = s.length();
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { l--; r++; }
            int len = r - l - 1;
            if (len > bestLen) { bestLen = len; bestL = l + 1; }
            T.r("s", s, "l", l + 1, "r", r - 1, "bestLen", bestLen);
        }
        return s.substring(bestL, bestL + bestLen);
    }
}
