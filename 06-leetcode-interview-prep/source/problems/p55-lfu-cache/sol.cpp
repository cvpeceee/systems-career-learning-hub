// LFU cache - key -> (value, freq, list iterator); freq -> LRU list of keys; minFreq.  O(1) ops.
class LFUCache {
    int cap, minFreq = 0;
    struct Entry { int val, freq; list<int>::iterator it; };
    unordered_map<int, Entry> keys;
    unordered_map<int, list<int>> buckets;                 // freq -> keys, front = most recent
    void touch(int key) {                                  // move key to the next frequency bucket
        Entry& e = keys[key];
        buckets[e.freq].erase(e.it);
        if (buckets[e.freq].empty()) { buckets.erase(e.freq); if (minFreq == e.freq) minFreq++; }
        e.freq++;
        buckets[e.freq].push_front(key); e.it = buckets[e.freq].begin();
    }
public:
    LFUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!keys.count(key)) return -1;
        touch(key);
        return keys[key].val;
    }
    void put(int key, int value) {
        if (cap == 0) return;
        if (keys.count(key)) { keys[key].val = value; touch(key); return; }
        if ((int)keys.size() == cap) {                     // evict LRU key of the lowest frequency
            int victim = buckets[minFreq].back();
            buckets[minFreq].pop_back();
            if (buckets[minFreq].empty()) buckets.erase(minFreq);
            keys.erase(victim);
        }
        minFreq = 1;                                       // a brand-new key has frequency 1
        buckets[1].push_front(key);
        keys[key] = {value, 1, buckets[1].begin()};
    }
    map<int, list<int>> view() const { return map<int, list<int>>(buckets.begin(), buckets.end()); }
    int minF() const { return minFreq; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; LFUCache* c = nullptr;
        for (size_t i = 0; i < ops.size(); i++) {
            string op = ops[i], arg = args[i];
            if (op == "LFUCache") { c = new LFUCache(stoi(arg)); out.push_back("null"); }
            else if (op == "get") out.push_back(to_string(c->get(stoi(arg))));
            else { int k = stoi(arg.substr(0, arg.find(','))), v = stoi(arg.substr(arg.find(',') + 1)); c->put(k, v); out.push_back("null"); }
            map<int, list<int>> buckets = c->view(); int minFreq = c->minF();
            TR("op", op, "arg", arg, "buckets", buckets, "minFreq", minFreq, "out", out);
        }
        delete c;
        return out;
    }
};
