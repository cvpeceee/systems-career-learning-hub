// Search a 2D matrix - one binary search over the flattened row-major index.  O(log(m*n)).
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length, lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1, v = matrix[mid / n][mid % n];
            T.r("matrix", matrix, "lo", lo, "mid", mid, "hi", hi, "r", mid / n, "c", mid % n);
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}
