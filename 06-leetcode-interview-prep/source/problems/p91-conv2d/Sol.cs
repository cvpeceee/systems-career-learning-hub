using System;
// 2-D convolution (valid, stride 1, no flip) - slide the kernel over every position.  O(h*w*kh*kw).
public class Solution {
    public int[][] Conv2d(int[][] img, int[][] k) {
        int H = img.Length, W = img[0].Length, KH = k.Length, KW = k[0].Length;
        int OH = H - KH + 1, OW = W - KW + 1;
        var output = new int[OH][];
        for (int i = 0; i < OH; i++) output[i] = new int[OW];
        for (int i = 0; i < OH; i++)
            for (int j = 0; j < OW; j++) {
                int s = 0;
                for (int a = 0; a < KH; a++)
                    for (int b = 0; b < KW; b++) s += img[i + a][j + b] * k[a][b];
                output[i][j] = s;
                T.R("out", output, "i", i, "j", j, "s", s);
            }
        return output;
    }
}
