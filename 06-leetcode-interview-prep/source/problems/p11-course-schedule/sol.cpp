// Course schedule - Kahn's algorithm (BFS topological sort).  O(V + E).
class Solution {
public:
    bool canFinish(int n, vector<vector<int>>& prereq) {
        FN("canFinish");
        vector<vector<int>> adj(n);
        vector<int> indeg(n, 0);                   // unfinished prerequisites per task
        for (auto& p : prereq) {                   // p = [a, b]: b -> a
            adj[p[1]].push_back(p[0]);
            indeg[p[0]]++;
        }
        vector<int> queue;                         // FIFO via index 'head' (keeps it printable)
        for (int v = 0; v < n; ++v) if (indeg[v] == 0) queue.push_back(v);   // free to start
        size_t head = 0; int done = 0;
        TR("prereq", prereq, "n", n, "indeg", indeg, "queue", queue, "done", done);
        while (head < queue.size()) {
            int node = queue[head++];              // take the next ready task
            ++done;
            for (int nxt : adj[node])
                if (--indeg[nxt] == 0) queue.push_back(nxt);   // its last prerequisite just finished
            TR("prereq", prereq, "n", n, "node", node, "indeg", indeg, "queue", queue, "done", done);
        }
        return done == n;                          // leftovers are stuck in a cycle
    }
};
