// CAN signal extraction - shift, mask, optional two's-complement sign extension.  O(1).
class Solution {
    public long extract(long data, int start, int len, boolean isSigned) {
        long mask = (1L << len) - 1;
        long raw = (data >>> start) & mask;                       // >>> = logical shift
        T.r("raw", raw, "start", start, "len", len);
        long v = raw;
        if (isSigned && ((raw >>> (len - 1)) & 1L) == 1L) v -= (1L << len);
        T.r("raw", raw, "start", start, "len", len, "v", v);
        return v;
    }
}
