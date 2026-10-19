// Reverse Bits - divide & conquer mask swaps (16, 8, 4, 2, 1).  O(1).
class Solution {
    public long reverseBits(long n64) {
        int n = (int) n64;
        n = (n >>> 16) | (n << 16);                                  // swap halves
        n = ((n & 0xff00ff00) >>> 8) | ((n & 0x00ff00ff) << 8);      // swap bytes
        n = ((n & 0xf0f0f0f0) >>> 4) | ((n & 0x0f0f0f0f) << 4);      // swap nibbles
        n = ((n & 0xcccccccc) >>> 2) | ((n & 0x33333333) << 2);      // swap pairs
        n = ((n & 0xaaaaaaaa) >>> 1) | ((n & 0x55555555) << 1);      // swap single bits
        return n & 0xffffffffL;                                      // back to unsigned
    }
}
