using System;
// Byte swap 32-bit - move each byte with a shift and a mask.  O(1).
public class Solution {
    public long ByteSwap32(long x) {
        uint v = (uint)x, output = 0;
        for (int step = 0; step < 4; step++) {
            uint b = (v >> (8 * step)) & 0xFFu;
            output |= b << (8 * (3 - step));
            T.R("x", x, "step", step, "out", (long)output);
        }
        return output;
    }
}
