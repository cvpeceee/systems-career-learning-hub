using System; using System.Collections.Generic;
// Spiral Matrix - four shrinking boundaries.  O(m*n).
public class Solution {
    public int[] SpiralOrder(int[][] matrix) {
        var output = new List<int>();
        int top = 0, bottom = matrix.Length - 1, left = 0, right = matrix[0].Length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) output.Add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) output.Add(matrix[i][right]);
            right--;
            if (top <= bottom) { for (int j = right; j >= left; j--) output.Add(matrix[bottom][j]); bottom--; }
            if (left <= right) { for (int i = bottom; i >= top; i--) output.Add(matrix[i][left]); left++; }
            T.R("out", output, "top", top, "bottom", bottom, "left", left, "right", right);
        }
        return output.ToArray();
    }
}
