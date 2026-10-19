// Spiral Matrix - four shrinking boundaries.  O(m*n).
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>> matrix) {
        FN("spiralOrder");
        vector<int> out;
        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) out.push_back(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) out.push_back(matrix[i][right]);
            right--;
            if (top <= bottom) { for (int j = right; j >= left; j--) out.push_back(matrix[bottom][j]); bottom--; }
            if (left <= right) { for (int i = bottom; i >= top; i--) out.push_back(matrix[i][left]); left++; }
            TR("out", out, "top", top, "bottom", bottom, "left", left, "right", right);
        }
        return out;
    }
};
