// Top K Frequent - count map + buckets indexed by frequency.  O(n).
class Solution {
public:
    vector<int> topKFrequent(vector<int> nums, int k) {
        FN("topKFrequent");
        map<int, int> count;                                 // value -> frequency
        for (int i = 0; i < (int)nums.size(); i++) {
            count[nums[i]]++;
            TR("nums", nums, "i", i, "count", count);
        }
        int n = nums.size();
        vector<vector<int>> bucket(n + 1);                   // bucket[f] = values seen f times
        for (auto& kv : count) bucket[kv.second].push_back(kv.first);   // map order => ascending values
        vector<int> out;
        for (int f = n; f >= 1 && (int)out.size() < k; f--) {
            for (int v : bucket[f]) {
                if ((int)out.size() == k) break;
                out.push_back(v);
            }
            TR("f", f, "out", out);
        }
        return out;
    }
};
