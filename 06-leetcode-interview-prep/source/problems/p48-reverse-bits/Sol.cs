// Reverse Bits - loop with uint (C# has real unsigned types).  O(32).
public class Solution {
    public long ReverseBits(long n64) {
        uint n = (uint)n64, r = 0;
        for (int i = 0; i < 32; i++) { r = (r << 1) | (n & 1); n >>= 1; }
        return r;
    }
}
