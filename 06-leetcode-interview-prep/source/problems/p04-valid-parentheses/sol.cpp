// Valid parentheses - stack of open brackets.  O(n) time, O(n) space.
class Solution {
public:
    bool isValid(string s) {
        FN("isValid");
        vector<char> st;                               // used as a stack (back = top)
        for (int i = 0; i < (int)s.size(); ++i) {
            char c = s[i];
            if (c == '(' || c == '[' || c == '{') {
                st.push_back(c);                       // opener: put a plate on the pile
                TR("s", s, "i", i, "c", c, "st", st);
                continue;
            }
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';   // opener that closes this
            if (st.empty() || st.back() != want) {     // nothing to close, or wrong type
                TR("s", s, "i", i, "c", c, "st", st, "_note", "mismatch -> false");
                return false;
            }
            st.pop_back();                             // matched: remove top plate
            TR("s", s, "i", i, "c", c, "st", st);
        }
        return st.empty();                             // leftovers mean unclosed openers
    }
};
