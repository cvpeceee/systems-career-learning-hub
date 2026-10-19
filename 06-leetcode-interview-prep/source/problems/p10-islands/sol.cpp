// Number of islands - DFS "sinks" each island the first time we touch it.  O(m*n).
class Solution {
    void sink(vector<vector<int>>& grid, int r, int c) {
        FN("sink");
        if (r < 0 || c < 0 || r >= (int)grid.size() || c >= (int)grid[0].size()) return;  // off the map
        if (grid[r][c] == 0) return;                 // water or already painted
        grid[r][c] = 0;                              // paint (mark visited)
        TR("grid", grid, "r", r, "c", c);
        sink(grid, r + 1, c);                        // spread down
        sink(grid, r - 1, c);                        // up
        sink(grid, r, c + 1);                        // right
        sink(grid, r, c - 1);                        // left
    }
public:
    int numIslands(vector<vector<int>>& grid) {
        FN("numIslands");
        int count = 0;
        for (int r = 0; r < (int)grid.size(); ++r)
            for (int c = 0; c < (int)grid[0].size(); ++c)
                if (grid[r][c] == 1) {               // untouched land = a new island
                    ++count;
                    TR("grid", grid, "r", r, "c", c, "count", count);
                    sink(grid, r, c);
                }
        TR("grid", grid, "count", count);
        return count;
    }
};
