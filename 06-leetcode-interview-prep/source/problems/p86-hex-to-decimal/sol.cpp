// Hex string -> number - shift in one nibble per hex digit.  O(n).
class Solution {
    int digit(char c) {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    }
public:
    long long hexToLong(string s) {
        FN("hexToLong");
        int i = 0;
        if (s.size() >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) i = 2;   // optional prefix
        if (i == (int)s.size()) return -1;                                       // no digits
        long long v = 0;
        for (; i < (int)s.size(); i++) {
            int d = digit(s[i]);
            if (d < 0) return -1;
            v = (v << 4) | d;                                                    // v*16 + d
            TR("s", s, "i", i, "v", v);
        }
        return v;
    }
};
