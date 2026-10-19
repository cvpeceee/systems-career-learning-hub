// CAN signal extraction - shift, mask, optional two's-complement sign extension.  O(1).
class Solution {
public:
    long long extract(long long data, int start, int len, bool isSigned) {
        FN("extract");
        unsigned long long u = (unsigned long long)data;          // unsigned: logical shifts
        unsigned long long mask = (1ULL << len) - 1;             // len <= 63, so no UB
        unsigned long long raw = (u >> start) & mask;
        TR("raw", (long long)raw, "start", start, "len", len);
        long long v = (long long)raw;
        if (isSigned && ((raw >> (len - 1)) & 1ULL)) v -= (long long)(1ULL << len);   // negative value
        TR("raw", (long long)raw, "start", start, "len", len, "v", v);
        return v;
    }
};
