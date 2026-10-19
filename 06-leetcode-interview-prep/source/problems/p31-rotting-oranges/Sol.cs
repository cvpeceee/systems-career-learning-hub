using System.Collections.Generic;
// Rotting Oranges - multi-source BFS, one level per minute.  O(m*n).
public class Solution {
    public int OrangesRotting(int[][] grid) {
        int m = grid.Length, n = grid[0].Length, fresh = 0, minutes = 0;
        var q = new Queue<(int r, int c)>();
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) q.Enqueue((i, j));
            if (grid[i][j] == 1) fresh++;
        }
        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        while (q.Count > 0 && fresh > 0) {
            for (int sz = q.Count; sz > 0; sz--) {
                var (r0, c0) = q.Dequeue();
                for (int d = 0; d < 4; d++) {
                    int r = r0 + dr[d], c = c0 + dc[d];
                    if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] != 1) continue;
                    grid[r][c] = 2; fresh--; q.Enqueue((r, c));
                }
            }
            minutes++;
            T.R("grid", grid, "minutes", minutes, "fresh", fresh);
        }
        return fresh == 0 ? minutes : -1;
    }
}
