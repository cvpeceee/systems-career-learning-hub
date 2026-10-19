// Group Anagrams - canonical key (sorted letters) -> bucket.  O(n * k log k).
class Solution {
public:
    vector<string> groupAnagrams(vector<string> strs) {
        FN("groupAnagrams");
        map<string, vector<string>> groups;          // key -> words with that letter multiset
        for (int i = 0; i < (int)strs.size(); i++) {
            string key = strs[i];
            sort(key.begin(), key.end());            // "tea" -> "aet": same for every anagram
            groups[key].push_back(strs[i]);          // drop the word into its pigeonhole
            TR("strs", strs, "i", i, "key", key, "groups", groups);
        }
        vector<string> out;
        for (auto& kv : groups) {
            vector<string> g = kv.second;
            sort(g.begin(), g.end());                // deterministic order inside a group
            string joined;
            for (size_t j = 0; j < g.size(); j++) joined += (j ? "," : "") + g[j];
            out.push_back(joined);
        }
        sort(out.begin(), out.end());                // deterministic order of groups
        return out;
    }
};
