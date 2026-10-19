// Valid Sudoku - one pass with row/column/box bitmasks.  O(81).
class Solution {
public:
    bool isValidSudoku(vector<string> board) {
        FN("isValidSudoku");
        int rows[9] = {0}, cols[9] = {0}, boxes[9] = {0};
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int bit = 1 << (board[r][c] - '0'), b = (r / 3) * 3 + c / 3;
                TR("board", board, "r", r, "c", c, "b", b);
                if ((rows[r] | cols[c] | boxes[b]) & bit) return false;   // seen before in a group
                rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
            }
        return true;
    }
};
