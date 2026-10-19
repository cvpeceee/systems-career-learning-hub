import java.util.*;
// Basic Calculator II - apply * and / immediately, defer + and - on a stack.  O(n).
class Solution {
    public int calculate(String s) {
        List<Integer> st = new ArrayList<>(); int num = 0; char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0');
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                int last = st.isEmpty() ? 0 : st.size() - 1;
                if (op == '+') st.add(num);
                else if (op == '-') st.add(-num);
                else if (op == '*') st.set(last, st.get(last) * num);
                else st.set(last, st.get(last) / num);               // Java truncates toward zero
                op = c; num = 0;
                T.r("s", s, "i", i, "st", st);
            }
        }
        int total = 0;
        for (int v : st) total += v;
        return total;
    }
}
