// Consistent hash ring with virtual nodes.  get: O(log P), P = number of ring points.
static uint32_t fnv1a(const string& s) {               // FNV-1a 32-bit: same result in C#, Java, C++
    uint32_t h = 2166136261u;
    for (unsigned char c : s) { h ^= c; h *= 16777619u; }   // unsigned overflow wraps (defined behaviour)
    return h;
}
class HashRing {
    int vnodes;
    map<uint32_t, int> ring;                             // ring point -> server id (sorted = clockwise)
public:
    explicit HashRing(int v) : vnodes(v) {}
    void add(int id) { for (int i = 0; i < vnodes; ++i) ring[fnv1a("n" + to_string(id) + "#" + to_string(i))] = id; }
    void remove(int id) {
        for (auto it = ring.begin(); it != ring.end();)
            it = (it->second == id) ? ring.erase(it) : next(it);   // drop only this server's points
    }
    int get(const string& key) {
        FN("get");
        if (ring.empty()) return -1;
        uint32_t h = fnv1a("k" + key);
        auto it = ring.lower_bound(h);                   // first point clockwise at or after h
        if (it == ring.end()) it = ring.begin();         // wrap around the circle
        TR("key", key, "h", (unsigned long)h, "server", it->second, "ring", ring);
        return it->second;
    }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        vector<string> out; unique_ptr<HashRing> r;
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "HashRing") { r = make_unique<HashRing>(stoi(args[i])); out.push_back("null"); }
            else if (ops[i] == "add") { r->add(stoi(args[i])); out.push_back("null"); }
            else if (ops[i] == "remove") { r->remove(stoi(args[i])); out.push_back("null"); }
            else out.push_back(to_string(r->get(args[i])));
        }
        return out;
    }
};
