// N-Queens II - one queen per row; bitmasks for columns and both diagonals.
class Solution {
    int n, count;
    void place(int row, int colMask, int d1, int d2) {
        if (row == n) { count++; return; }
        int avail = ~(colMask | d1 | d2) & ((1 << n) - 1);
        while (avail != 0) {
            int bit = avail & -avail; avail -= bit;              // take the lowest free column
            T.r("row", row, "col", Integer.numberOfTrailingZeros(bit), "count", count);
            place(row + 1, colMask | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
        }
    }
    public int totalNQueens(int n) { this.n = n; count = 0; place(0, 0, 0, 0); return count; }
}
