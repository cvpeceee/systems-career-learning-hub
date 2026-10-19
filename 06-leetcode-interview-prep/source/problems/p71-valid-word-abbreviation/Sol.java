// Valid Word Abbreviation - two pointers, parse numbers as skips.  O(n).
class Solution {
    public boolean validWordAbbreviation(String word, String abbr) {
        int i = 0, j = 0, n = word.length(), m = abbr.length();
        while (i < n && j < m) {
            T.r("abbr", abbr, "i", i, "j", j);
            char c = abbr.charAt(j);
            if (Character.isDigit(c)) {
                if (c == '0') return false;
                int num = 0;
                while (j < m && Character.isDigit(abbr.charAt(j))) num = num * 10 + (abbr.charAt(j++) - '0');
                i += num;
            } else {
                if (word.charAt(i) != c) return false;
                i++; j++;
            }
        }
        return i == n && j == m;
    }
}
