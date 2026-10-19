// Basic Calculator II - apply * and / immediately, defer + and - on a stack.  O(n).
class Solution {
public:
    int calculate(string s) {
        FN("calculate");
        vector<int> st; long num = 0; char op = '+';
        for (int i = 0; i < (int)s.size(); i++) {
            char c = s[i];
            if (isdigit(c)) num = num * 10 + (c - '0');
            if ((!isdigit(c) && c != ' ') || i == (int)s.size() - 1) {   // a number just ended
                if (op == '+') st.push_back((int)num);
                else if (op == '-') st.push_back((int)-num);
                else if (op == '*') st.back() *= (int)num;
                else st.back() /= (int)num;                              // C++ truncates toward zero
                op = c; num = 0;
                TR("s", s, "i", i, "st", st);
            }
        }
        int total = 0;
        for (int v : st) total += v;
        return total;
    }
};
