// Reverse Bits - move 32 bits one by one from n's low end to r's low end.  O(32).
class Solution {
public:
    long long reverseBits(long long n64) {
        FN("reverseBits");
        uint32_t n = (uint32_t)n64, r = 0;
        for (int i = 0; i < 32; i++) {
            r = (r << 1) | (n & 1);        // append n's lowest bit to r
            n >>= 1;                       // drop it from n
            if (i % 8 == 7) { long long rr = r; TR("i", i, "r", rr); }
        }
        return (long long)r;
    }
};
