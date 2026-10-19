import java.util.*;
// Rotting Oranges - multi-source BFS, one level per minute.  O(m*n).
class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length, fresh = 0, minutes = 0;
        ArrayDeque<int[]> q = new ArrayDeque<>();
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) q.add(new int[]{i, j});
            if (grid[i][j] == 1) fresh++;
        }
        int[][] d = {{1,0},{-1,0},{0,1},{0,-1}};
        while (!q.isEmpty() && fresh > 0) {
            for (int sz = q.size(); sz > 0; sz--) {
                int[] cell = q.poll();
                for (int[] x : d) {
                    int r = cell[0] + x[0], c = cell[1] + x[1];
                    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] != 1) continue;
                    grid[r][c] = 2; fresh--; q.add(new int[]{r, c});
                }
            }
            minutes++;
            T.r("grid", grid, "minutes", minutes, "fresh", fresh);
        }
        return fresh == 0 ? minutes : -1;
    }
}
