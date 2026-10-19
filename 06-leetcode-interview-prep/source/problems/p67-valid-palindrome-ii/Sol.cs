using System;
// Valid Palindrome II - two pointers, one branch on the first mismatch.  O(n).
public class Solution {
    bool IsPal(string s, int l, int r) {
        while (l < r) { if (s[l] != s[r]) return false; l++; r--; }
        return true;
    }
    public bool ValidPalindrome(string s) {
        int l = 0, r = s.Length - 1;
        while (l < r) {
            T.R("s", s, "l", l, "r", r);
            if (s[l] != s[r]) return IsPal(s, l + 1, r) || IsPal(s, l, r - 1);
            l++; r--;
        }
        return true;
    }
}
