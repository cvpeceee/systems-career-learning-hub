// Clone Graph - BFS with a map original->clone (the map is also the visited set).  O(V+E).
struct GNode { int val; vector<GNode*> nb; GNode(int v) : val(v) {} };
class Solution {
public:
    vector<vector<int>> cloneGraph(vector<vector<int>> adj) {
        FN("cloneGraph");
        int n = adj.size();
        vector<GNode*> orig(n);                              // build the input graph
        for (int i = 0; i < n; i++) orig[i] = new GNode(i + 1);
        for (int i = 0; i < n; i++) for (int j : adj[i]) orig[i]->nb.push_back(orig[j - 1]);
        unordered_map<GNode*, GNode*> copy;                  // original -> clone
        queue<GNode*> q; q.push(orig[0]); copy[orig[0]] = new GNode(1);
        map<int, int> seen;                                  // (for the visualizer) value -> cloned?
        seen[1] = 1;
        while (!q.empty()) {
            GNode* cur = q.front(); q.pop();
            int node = cur->val;
            for (GNode* nb : cur->nb) {
                if (!copy.count(nb)) { copy[nb] = new GNode(nb->val); q.push(nb); seen[nb->val] = 1; }   // first sighting
                copy[cur]->nb.push_back(copy[nb]);           // link clone edge
            }
            TR("node", node, "seen", seen);
        }
        vector<GNode*> cl(n, nullptr);                       // read back the clone's adjacency
        bool shared = false;
        for (auto& kv : copy) { cl[kv.second->val - 1] = kv.second; if (kv.first == kv.second) shared = true; }
        vector<vector<int>> out(n);
        for (int i = 0; i < n; i++) if (cl[i]) for (GNode* x : cl[i]->nb) {
            for (GNode* o : orig) if (o == x) shared = true;  // must not point into the original
            out[i].push_back(x->val);
        }
        for (auto& kv : copy) delete kv.second;
        for (auto o : orig) delete o;
        return shared ? vector<vector<int>>{} : out;
    }
};
