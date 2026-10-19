// Set-associative cache simulator - per-set LRU list of tags.  O(n * W).
class Solution {
public:
    int simulate(int S, int W, int B, vector<int> addrs) {
        FN("simulate");
        vector<deque<int>> sets(S);                       // front = most recently used tag
        int hits = 0;
        for (int i = 0; i < (int)addrs.size(); i++) {
            int line = addrs[i] / B, set = line % S, tag = line / S;
            deque<int>& d = sets[set];
            auto it = find(d.begin(), d.end(), tag);
            if (it != d.end()) { hits++; d.erase(it); }   // hit: move to front
            else if ((int)d.size() == W) d.pop_back();    // miss on a full set: evict LRU
            d.push_front(tag);
            vector<vector<int>> view; for (auto& s : sets) view.push_back(vector<int>(s.begin(), s.end()));
            TR("sets", view, "i", i, "set", set, "tag", tag, "hits", hits);
        }
        return hits;
    }
};
