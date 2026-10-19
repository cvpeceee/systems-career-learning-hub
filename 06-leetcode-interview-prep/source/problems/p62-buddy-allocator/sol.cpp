// Buddy allocator - per-order free sets; split down on alloc, XOR-buddy coalesce on free.  O(K log n).
class Buddy {
    int K;
    vector<set<int>> freeAt;                     // freeAt[k] = offsets of free blocks of size 2^k
    unordered_map<int, int> orderOf;             // allocated offset -> its order
public:
    explicit Buddy(int units) { K = 0; while ((1 << K) < units) K++; freeAt.resize(K + 1); freeAt[K].insert(0); }
    int alloc(int n) {
        int k = 0; while ((1 << k) < n) k++;     // round up to a power of two
        int j = k; while (j <= K && freeAt[j].empty()) j++;
        if (j > K) return -1;                    // nothing big enough
        int off = *freeAt[j].begin(); freeAt[j].erase(freeAt[j].begin());
        while (j > k) { j--; freeAt[j].insert(off + (1 << j)); }   // split: keep lower half, free the upper
        orderOf[off] = k;
        return off;
    }
    void release(int off) {
        int k = orderOf[off]; orderOf.erase(off);
        while (k < K) {
            int buddy = off ^ (1 << k);          // the half this block was split from
            auto it = freeAt[k].find(buddy);
            if (it == freeAt[k].end()) break;    // buddy busy (or split smaller): stop
            freeAt[k].erase(it);
            off = min(off, buddy); k++;          // glue into the parent block
        }
        freeAt[k].insert(off);
    }
    map<int, vector<int>> view() const { map<int, vector<int>> m; for (int k = 0; k <= K; k++) if (!freeAt[k].empty()) m[1 << k] = vector<int>(freeAt[k].begin(), freeAt[k].end()); return m; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; unique_ptr<Buddy> b;
        for (size_t i = 0; i < ops.size(); i++) {
            string op = ops[i], arg = args[i];
            if (op == "Buddy") { b = make_unique<Buddy>(stoi(arg)); out.push_back("null"); }
            else if (op == "alloc") out.push_back(to_string(b->alloc(stoi(arg))));
            else { b->release(stoi(arg)); out.push_back("null"); }
            map<int, vector<int>> freeLists = b->view();       // block size -> free offsets
            TR("op", op, "arg", arg, "freeLists", freeLists, "out", out);
        }
        return out;
    }
};
