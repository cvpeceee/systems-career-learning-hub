// Top K frequent words - count, then a size-k heap ordered so the WORST kept word is on top.  O(n log k).
class Solution {
public:
    vector<string> topKFrequent(vector<string> words, int k) {
        FN("topKFrequent");
        map<string, int> count;
        for (auto& w : words) count[w]++;
        // comparator "a is better than b": higher count, or same count and alphabetically earlier
        auto better = [&](const string& a, const string& b) { return count[a] != count[b] ? count[a] > count[b] : a < b; };
        priority_queue<string, vector<string>, decltype(better)> heap(better);   // top = worst kept word
        for (auto& kv : count) {
            heap.push(kv.first);
            if ((int)heap.size() > k) heap.pop();      // drop the worst
            TR("count", count, "heap", heap);
        }
        vector<string> out;
        while (!heap.empty()) { out.push_back(heap.top()); heap.pop(); }
        reverse(out.begin(), out.end());               // best first
        return out;
    }
};
