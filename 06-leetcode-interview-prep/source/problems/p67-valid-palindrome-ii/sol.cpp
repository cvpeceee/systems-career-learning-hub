// Valid Palindrome II - two pointers, one branch on the first mismatch.  O(n).
class Solution {
    bool isPal(const string& s, int l, int r) {
        while (l < r) { if (s[l] != s[r]) return false; l++; r--; }
        return true;
    }
public:
    bool validPalindrome(string s) {
        FN("validPalindrome");
        int l = 0, r = (int)s.size() - 1;
        while (l < r) {
            TR("s", s, "l", l, "r", r);
            if (s[l] != s[r])                         // one coupon: skip left or skip right
                return isPal(s, l + 1, r) || isPal(s, l, r - 1);
            l++; r--;
        }
        return true;
    }
};
