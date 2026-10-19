// Accounts Merge - union-find over emails, then group by root.  ~O(N log N) with sorting.
class Solution {
public:
    map<string, string> parent;
    string find(const string& x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }
    vector<string> accountsMerge(vector<string> accounts) {
        FN("accountsMerge");
        map<string, string> owner;                           // email -> name
        for (auto& line : accounts) {
            vector<string> f; string cur; stringstream ss(line);
            while (getline(ss, cur, ',')) f.push_back(cur);
            for (size_t i = 1; i < f.size(); i++) {
                if (!parent.count(f[i])) parent[f[i]] = f[i];
                owner[f[i]] = f[0];
                string email = f[i];
                string a = find(f[1]), b = find(f[i]);
                if (a != b) parent[b] = a;                   // staple this badge to the first one
                TR("email", email, "parent", parent);
            }
        }
        map<string, set<string>> groups;
        for (auto& kv : parent) groups[find(kv.first)].insert(kv.first);
        vector<string> out;
        for (auto& g : groups) {
            string s = owner[g.first];
            for (auto& e : g.second) s += "," + e;
            out.push_back(s);
        }
        sort(out.begin(), out.end());
        return out;
    }
};
