using System;
// CAN signal extraction - shift, mask, optional two's-complement sign extension.  O(1).
public class Solution {
    public long Extract(long data, int start, int len, bool isSigned) {
        ulong u = (ulong)data, mask = (1UL << len) - 1;
        ulong raw = (u >> start) & mask;
        T.R("raw", (long)raw, "start", start, "len", len);
        long v = (long)raw;
        if (isSigned && ((raw >> (len - 1)) & 1UL) == 1UL) v -= (long)(1UL << len);
        T.R("raw", (long)raw, "start", start, "len", len, "v", v);
        return v;
    }
}
