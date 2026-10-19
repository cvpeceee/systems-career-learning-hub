// Decode String - stack of (saved prefix, repeat count).  O(output).
class Solution {
public:
    string decodeString(string s) {
        FN("decodeString");
        vector<string> strs; vector<int> counts;
        string cur; int k = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            char c = s[i];
            if (isdigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { strs.push_back(cur); counts.push_back(k); cur.clear(); k = 0; }
            else if (c == ']') {
                string rep; for (int t = 0; t < counts.back(); t++) rep += cur;
                cur = strs.back() + rep; strs.pop_back(); counts.pop_back();
            } else cur += c;
            TR("s", s, "i", i, "cur", cur, "strs", strs, "counts", counts);
        }
        return cur;
    }
};
