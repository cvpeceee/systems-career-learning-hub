// Reverse bits l..r - extract the field, reverse it, insert it back.  O(r-l+1).
class Solution {
public:
    int reverseRange(int n, int l, int r) {
        FN("reverseRange");
        unsigned x = (unsigned)n;
        int len = r - l + 1;
        unsigned mask = (len == 32) ? 0xFFFFFFFFu : ((1u << len) - 1);    // avoid 1<<32 (UB)
        unsigned field = (x >> l) & mask, rev = 0;
        for (int i = 0; i < len; i++) {
            rev = (rev << 1) | ((field >> i) & 1u);                    // lowest bit becomes highest
            TR("n", (int)x, "l", l, "r", r, "i", i, "rev", (int)rev);
        }
        x = (x & ~(mask << l)) | (rev << l);                           // clear the hole, insert
        return (int)x;
    }
};
