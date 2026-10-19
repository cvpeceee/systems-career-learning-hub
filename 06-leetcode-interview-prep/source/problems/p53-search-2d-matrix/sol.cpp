// Search a 2D matrix - one binary search over the flattened row-major index.  O(log(m*n)).
class Solution {
public:
    bool searchMatrix(vector<vector<int>> matrix, int target) {
        FN("searchMatrix");
        int m = matrix.size(), n = matrix[0].size();
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int r = mid / n, c = mid % n;          // flattened index -> (row, col)
            int v = matrix[r][c];
            TR("matrix", matrix, "lo", lo, "mid", mid, "hi", hi, "r", r, "c", c);
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
};
