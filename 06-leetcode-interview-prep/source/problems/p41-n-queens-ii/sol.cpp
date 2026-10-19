// N-Queens II - one queen per row; bitmasks for columns and both diagonals.
class Solution {
public:
    int n, count = 0;
    vector<int> cols;                                       // cols[row] = column of that row's queen (viz)
    void place(int row, int colMask, int d1, int d2) {
        FN("place");
        if (row == n) { count++; TR("cols", cols, "row", row, "count", count); return; }
        int avail = ~(colMask | d1 | d2) & ((1 << n) - 1);  // 1-bits = safe squares in this row
        while (avail) {
            int bit = avail & -avail;                       // lowest safe square
            avail -= bit;
            int col = __builtin_ctz(bit);
            cols[row] = col;
            TR("cols", cols, "row", row, "col", col, "count", count);
            place(row + 1, colMask | bit, (d1 | bit) << 1, (d2 | bit) >> 1);   // diagonals shift as we go down
            cols[row] = -1;                                 // backtrack
        }
    }
    int totalNQueens(int n_) {
        FN("totalNQueens");
        n = n_; cols.assign(n, -1);
        place(0, 0, 0, 0);
        return count;
    }
};
