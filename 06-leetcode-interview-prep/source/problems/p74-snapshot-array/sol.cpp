// Snapshot Array - per-index history of (snapId, value); binary search on get.
class SnapshotArray {
    vector<vector<pair<int, int>>> hist;   // hist[i] sorted by snapId
    int snapId = 0;
public:
    SnapshotArray(int n) : hist(n, vector<pair<int, int>>{{0, 0}}) {}
    void set(int i, int v) {
        if (hist[i].back().first == snapId) hist[i].back().second = v;   // same snapshot: overwrite
        else hist[i].push_back({snapId, v});
    }
    int snap() { return snapId++; }
    int get(int i, int id) {
        auto it = upper_bound(hist[i].begin(), hist[i].end(), make_pair(id, INT_MAX));
        return prev(it)->second;                                        // last version <= id
    }
    int current() const { return snapId; }
    map<int, vector<int>> view() const {
        map<int, vector<int>> m;
        for (int i = 0; i < (int)hist.size(); i++) for (auto& p : hist[i]) { m[i].push_back(p.first); m[i].push_back(p.second); }
        return m;
    }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; SnapshotArray* a = nullptr;
        for (size_t k = 0; k < ops.size(); k++) {
            string op = ops[k], arg = args[k];
            if (op == "SnapshotArray") { a = new SnapshotArray(stoi(arg)); out.push_back("null"); }
            else if (op == "snap") out.push_back(to_string(a->snap()));
            else {
                int x = stoi(arg.substr(0, arg.find(','))), y = stoi(arg.substr(arg.find(',') + 1));
                if (op == "set") { a->set(x, y); out.push_back("null"); }
                else out.push_back(to_string(a->get(x, y)));
            }
            map<int, vector<int>> hist = a->view(); int snapId = a->current();
            TR("op", op, "arg", arg, "snapId", snapId, "hist", hist, "out", out);
        }
        delete a;
        return out;
    }
};
