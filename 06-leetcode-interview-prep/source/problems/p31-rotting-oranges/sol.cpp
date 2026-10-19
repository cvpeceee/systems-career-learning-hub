// Rotting Oranges - multi-source BFS, one level per minute.  O(m*n).
class Solution {
public:
    int orangesRotting(vector<vector<int>> grid) {
        FN("orangesRotting");
        int m = grid.size(), n = grid[0].size(), fresh = 0, minutes = 0;
        queue<pair<int,int>> q;
        for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) q.push({i, j});       // every rotten orange is a source
            if (grid[i][j] == 1) fresh++;
        }
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        while (!q.empty() && fresh > 0) {
            int sz = q.size();                          // everything rotting THIS minute
            for (int k = 0; k < sz; k++) {
                auto [r, c] = q.front(); q.pop();
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2; fresh--;          // rot it and enqueue for next minute
                    q.push({nr, nc});
                }
            }
            minutes++;
            TR("grid", grid, "minutes", minutes, "fresh", fresh);
        }
        return fresh == 0 ? minutes : -1;
    }
};
