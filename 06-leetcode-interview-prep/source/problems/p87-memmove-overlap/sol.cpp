// memmove - copy backward when the destination is to the right of the source.  O(n), O(1) extra.
class Solution {
public:
    vector<int> memmove(vector<int> buf, int dst, int src, int n) {
        FN("memmove");
        if (dst == src || n == 0) return buf;
        if (dst < src) {                                   // moving left: forward copy is safe
            for (int i = 0; i < n; i++) { buf[dst + i] = buf[src + i]; TR("buf", buf, "dst", dst, "src", src, "i", i); }
        } else {                                           // moving right: copy from the end
            for (int i = n - 1; i >= 0; i--) { buf[dst + i] = buf[src + i]; TR("buf", buf, "dst", dst, "src", src, "i", i); }
        }
        return buf;
    }
};
