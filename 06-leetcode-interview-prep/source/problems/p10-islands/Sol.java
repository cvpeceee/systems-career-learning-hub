// Number of islands - DFS "sinks" each island the first time we touch it.  O(m*n).
class Solution {
    public int numIslands(int[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == 1) { count++; sink(grid, r, c); }   // new island found
        return count;
    }
    private void sink(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] == 0) return;  // edge/water
        g[r][c] = 0;                                                  // mark visited
        sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
    }
}
