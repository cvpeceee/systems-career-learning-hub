using System;
// Hex string -> number - shift in one nibble per hex digit.  O(n).
public class Solution {
    int Digit(char c) {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    }
    public long HexToLong(string s) {
        int i = 0;
        if (s.Length >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) i = 2;
        if (i == s.Length) return -1;
        long v = 0;
        for (; i < s.Length; i++) {
            int d = Digit(s[i]);
            if (d < 0) return -1;
            v = (v << 4) | (long)d;
            T.R("s", s, "i", i, "v", v);
        }
        return v;
    }
}
