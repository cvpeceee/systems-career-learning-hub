// Valid Word Abbreviation - two pointers, parse numbers as skips.  O(n).
class Solution {
public:
    bool validWordAbbreviation(string word, string abbr) {
        FN("validWordAbbreviation");
        int i = 0, j = 0, n = word.size(), m = abbr.size();
        while (i < n && j < m) {
            TR("abbr", abbr, "i", i, "j", j);
            if (isdigit(abbr[j])) {
                if (abbr[j] == '0') return false;          // no leading zeros
                int num = 0;
                while (j < m && isdigit(abbr[j])) num = num * 10 + (abbr[j++] - '0');
                i += num;                                  // skip that many letters
            } else {
                if (word[i] != abbr[j]) return false;
                i++; j++;
            }
        }
        return i == n && j == m;
    }
};
