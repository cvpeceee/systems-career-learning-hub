using System;
// Valid Word Abbreviation - two pointers, parse numbers as skips.  O(n).
public class Solution {
    public bool ValidWordAbbreviation(string word, string abbr) {
        int i = 0, j = 0, n = word.Length, m = abbr.Length;
        while (i < n && j < m) {
            T.R("abbr", abbr, "i", i, "j", j);
            if (char.IsDigit(abbr[j])) {
                if (abbr[j] == '0') return false;
                int num = 0;
                while (j < m && char.IsDigit(abbr[j])) num = num * 10 + (abbr[j++] - '0');
                i += num;
            } else {
                if (word[i] != abbr[j]) return false;
                i++; j++;
            }
        }
        return i == n && j == m;
    }
}
