// Byte swap 32-bit - move each byte with a shift and a mask.  O(1).
class Solution {
    public long byteSwap32(long x) {
        long out = 0;
        for (int step = 0; step < 4; step++) {
            long b = (x >>> (8 * step)) & 0xFFL;
            out |= b << (8 * (3 - step));
            T.r("x", x, "step", step, "out", out);
        }
        return out;
    }
}
