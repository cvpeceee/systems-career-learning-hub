// 2-D convolution (valid, stride 1, no flip) - slide the kernel over every position.  O(h*w*kh*kw).
class Solution {
public:
    vector<vector<int>> conv2d(vector<vector<int>> img, vector<vector<int>> k) {
        FN("conv2d");
        int H = img.size(), W = img[0].size(), KH = k.size(), KW = k[0].size();
        int OH = H - KH + 1, OW = W - KW + 1;                    // valid output size
        vector<vector<int>> out(OH, vector<int>(OW, 0));
        for (int i = 0; i < OH; i++)
            for (int j = 0; j < OW; j++) {
                int s = 0;
                for (int a = 0; a < KH; a++)
                    for (int b = 0; b < KW; b++) s += img[i + a][j + b] * k[a][b];
                out[i][j] = s;
                TR("out", out, "i", i, "j", j, "s", s);
            }
        return out;
    }
};
