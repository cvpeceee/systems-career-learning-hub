// Search a 2D matrix - one binary search over the flattened row-major index.  O(log(m*n)).
public class Solution {
    public bool SearchMatrix(int[][] matrix, int target) {
        int m = matrix.Length, n = matrix[0].Length, lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, v = matrix[mid / n][mid % n];
            T.R("matrix", matrix, "lo", lo, "mid", mid, "hi", hi, "r", mid / n, "c", mid % n);
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}
