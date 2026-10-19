// Paged KV-cache allocator - free-list stack + per-sequence block tables.
class KVAlloc {
    int blockSize;
    vector<int> freeList;                       // stack of free physical blocks (back = next to hand out)
    map<int, vector<int>> table;                // seq -> its physical blocks (like a page table)
    map<int, int> len;                          // seq -> tokens stored
    vector<int> owner;                          // block -> seq (or -1) : for the visualizer
public:
    KVAlloc(int n, int bs) : blockSize(bs), owner(n, -1) { for (int b = n - 1; b >= 0; --b) freeList.push_back(b); }
    string append(int seq, int t) {
        FN("append");
        int cur = len.count(seq) ? len[seq] : 0;
        int have = table.count(seq) ? (int)table[seq].size() : 0;
        int need = (cur + t + blockSize - 1) / blockSize - have;      // integer ceil, minus blocks owned
        if (need > (int)freeList.size()) {                             // all-or-nothing: refuse cleanly
            TR("seq", seq, "t", t, "need", need, "owner", owner, "_note", "oom");
            return "oom";
        }
        auto& tab = table[seq];
        for (int k = 0; k < need; ++k) { tab.push_back(freeList.back()); owner[freeList.back()] = seq; freeList.pop_back(); }
        len[seq] = cur + t;
        TR("seq", seq, "t", t, "need", need, "owner", owner, "freeList", freeList);
        return "ok:" + to_string(tab.size());
    }
    int release(int seq) {
        FN("free");
        auto it = table.find(seq);
        if (it == table.end()) return 0;
        int n = it->second.size();
        for (int k = n - 1; k >= 0; --k) { freeList.push_back(it->second[k]); owner[it->second[k]] = -1; }   // first block reused first
        table.erase(it); len.erase(seq);
        TR("seq", seq, "owner", owner, "freeList", freeList);
        return n;
    }
    string blocks(int seq) {
        string s; if (!table.count(seq)) return s;
        for (size_t k = 0; k < table[seq].size(); ++k) { if (k) s += "|"; s += to_string(table[seq][k]); }
        return s;
    }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        vector<string> out; unique_ptr<KVAlloc> a;
        for (size_t i = 0; i < ops.size(); ++i) {
            const string& s = args[i]; size_t k = s.find(',');
            if (ops[i] == "KVAlloc") { a = make_unique<KVAlloc>(stoi(s.substr(0, k)), stoi(s.substr(k + 1))); out.push_back("null"); }
            else if (ops[i] == "append") out.push_back(a->append(stoi(s.substr(0, k)), stoi(s.substr(k + 1))));
            else if (ops[i] == "free") out.push_back(to_string(a->release(stoi(s))));
            else out.push_back(a->blocks(stoi(s)));
        }
        return out;
    }
};
