// Minimum Remove to Make Valid Parentheses - stack of "(" positions + removal marks.  O(n).
class Solution {
public:
    string minRemoveToMakeValid(string s) {
        FN("minRemoveToMakeValid");
        vector<int> st;                          // indices of "(" still waiting for a partner
        vector<bool> drop(s.size(), false);
        for (int i = 0; i < (int)s.size(); i++) {
            if (s[i] == '(') st.push_back(i);
            else if (s[i] == ')') {
                if (st.empty()) drop[i] = true;  // nobody to match -> remove
                else st.pop_back();              // matched the latest open "("
            }
            TR("s", s, "i", i, "st", st);
        }
        for (int i : st) drop[i] = true;         // leftover "(" are unmatched
        string out;
        for (int i = 0; i < (int)s.size(); i++) if (!drop[i]) out += s[i];
        return out;
    }
};
