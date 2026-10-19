import java.util.*;
// Spiral Matrix - four shrinking boundaries.  O(m*n).
class Solution {
    public int[] spiralOrder(int[][] matrix) {
        List<Integer> out = new ArrayList<>();
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) out.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) out.add(matrix[i][right]);
            right--;
            if (top <= bottom) { for (int j = right; j >= left; j--) out.add(matrix[bottom][j]); bottom--; }
            if (left <= right) { for (int i = bottom; i >= top; i--) out.add(matrix[i][left]); left++; }
            T.r("out", out, "top", top, "bottom", bottom, "left", left, "right", right);
        }
        return out.stream().mapToInt(x -> x).toArray();
    }
}
