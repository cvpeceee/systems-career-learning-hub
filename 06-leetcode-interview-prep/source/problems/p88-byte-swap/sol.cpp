// Byte swap 32-bit - move each byte with a shift and a mask.  O(1).
class Solution {
public:
    long long byteSwap32(long long x) {
        FN("byteSwap32");
        unsigned v = (unsigned)x, out = 0;
        for (int step = 0; step < 4; step++) {
            unsigned b = (v >> (8 * step)) & 0xFFu;          // byte number `step` from the right
            out |= b << (8 * (3 - step));                    // goes to the mirrored position
            TR("x", x, "step", step, "out", (long long)out);
        }
        return (long long)out;
    }
};
