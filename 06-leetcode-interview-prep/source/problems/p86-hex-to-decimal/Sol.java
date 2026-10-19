// Hex string -> number - shift in one nibble per hex digit.  O(n).
class Solution {
    int digit(char c) {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    }
    public long hexToLong(String s) {
        int i = 0;
        if (s.length() >= 2 && s.charAt(0) == '0' && (s.charAt(1) == 'x' || s.charAt(1) == 'X')) i = 2;
        if (i == s.length()) return -1;
        long v = 0;
        for (; i < s.length(); i++) {
            int d = digit(s.charAt(i));
            if (d < 0) return -1;
            v = (v << 4) | d;
            T.r("s", s, "i", i, "v", v);
        }
        return v;
    }
}
