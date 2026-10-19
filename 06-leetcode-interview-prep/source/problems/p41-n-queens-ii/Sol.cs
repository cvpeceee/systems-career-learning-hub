using System.Numerics;
// N-Queens II - one queen per row; bitmasks for columns and both diagonals.
public class Solution {
    int n, count;
    void Place(int row, int colMask, int d1, int d2) {
        if (row == n) { count++; return; }
        int avail = ~(colMask | d1 | d2) & ((1 << n) - 1);
        while (avail != 0) {
            int bit = avail & -avail; avail -= bit;              // take the lowest free column
            T.R("row", row, "col", BitOperations.TrailingZeroCount(bit), "count", count);
            Place(row + 1, colMask | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
        }
    }
    public int TotalNQueens(int n) { this.n = n; count = 0; Place(0, 0, 0, 0); return count; }
}
