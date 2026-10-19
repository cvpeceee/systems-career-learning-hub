// Valid Sudoku - one pass with row/column/box bitmasks.  O(81).
class Solution {
    public boolean isValidSudoku(String[] board) {
        int[] rows = new int[9], cols = new int[9], boxes = new int[9];
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                char ch = board[r].charAt(c);
                if (ch == '.') continue;
                int bit = 1 << (ch - '0'), b = (r / 3) * 3 + c / 3;
                T.r("board", board, "r", r, "c", c, "b", b);
                if (((rows[r] | cols[c] | boxes[b]) & bit) != 0) return false;
                rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
            }
        return true;
    }
}
