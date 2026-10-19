// 2-D convolution (valid, stride 1, no flip) - slide the kernel over every position.  O(h*w*kh*kw).
class Solution {
    public int[][] conv2d(int[][] img, int[][] k) {
        int H = img.length, W = img[0].length, KH = k.length, KW = k[0].length;
        int OH = H - KH + 1, OW = W - KW + 1;
        int[][] out = new int[OH][OW];
        for (int i = 0; i < OH; i++)
            for (int j = 0; j < OW; j++) {
                int s = 0;
                for (int a = 0; a < KH; a++)
                    for (int b = 0; b < KW; b++) s += img[i + a][j + b] * k[a][b];
                out[i][j] = s;
                T.r("out", out, "i", i, "j", j, "s", s);
            }
        return out;
    }
}
