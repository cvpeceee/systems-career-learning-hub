// Number of islands - DFS "sinks" each island the first time we touch it.  O(m*n).
public class Solution {
    public int NumIslands(int[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.Length; r++)
            for (int c = 0; c < grid[0].Length; c++)
                if (grid[r][c] == 1) { count++; Sink(grid, r, c); }   // new island found
        return count;
    }
    private void Sink(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.Length || c >= g[0].Length || g[r][c] == 0) return;  // edge/water
        g[r][c] = 0;                                                  // mark visited
        T.R("grid", g, "r", r, "c", c);
        Sink(g, r + 1, c); Sink(g, r - 1, c); Sink(g, r, c + 1); Sink(g, r, c - 1);
    }
}
