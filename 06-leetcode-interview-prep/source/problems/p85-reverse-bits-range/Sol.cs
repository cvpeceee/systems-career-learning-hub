using System;
// Reverse bits l..r - extract the field, reverse it, insert it back.  O(r-l+1).
public class Solution {
    public int ReverseRange(int n, int l, int r) {
        uint x = (uint)n; int len = r - l + 1;
        uint mask = len == 32 ? 0xFFFFFFFFu : ((1u << len) - 1);
        uint field = (x >> l) & mask, rev = 0;
        for (int i = 0; i < len; i++) {
            rev = (rev << 1) | ((field >> i) & 1u);
            T.R("n", n, "l", l, "r", r, "i", i, "rev", (int)rev);
        }
        return (int)((x & ~(mask << l)) | (rev << l));
    }
}
