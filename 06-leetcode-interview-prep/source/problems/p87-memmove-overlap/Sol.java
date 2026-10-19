// memmove - copy backward when the destination is to the right of the source.  O(n), O(1) extra.
class Solution {
    public int[] memmove(int[] buf, int dst, int src, int n) {
        if (dst == src || n == 0) return buf;
        if (dst < src) {
            for (int i = 0; i < n; i++) { buf[dst + i] = buf[src + i]; T.r("buf", buf, "dst", dst, "src", src, "i", i); }
        } else {
            for (int i = n - 1; i >= 0; i--) { buf[dst + i] = buf[src + i]; T.r("buf", buf, "dst", dst, "src", src, "i", i); }
        }
        return buf;
    }
}
