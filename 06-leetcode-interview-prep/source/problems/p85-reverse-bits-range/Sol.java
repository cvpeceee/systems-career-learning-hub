// Reverse bits l..r - extract the field, reverse it, insert it back.  O(r-l+1).
class Solution {
    public int reverseRange(int n, int l, int r) {
        int len = r - l + 1;
        int mask = (len == 32) ? -1 : ((1 << len) - 1);
        int field = (n >>> l) & mask, rev = 0;                         // >>> = unsigned shift
        for (int i = 0; i < len; i++) {
            rev = (rev << 1) | ((field >>> i) & 1);
            T.r("n", n, "l", l, "r", r, "i", i, "rev", rev);
        }
        return (n & ~(mask << l)) | (rev << l);
    }
}
