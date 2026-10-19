import java.util.*;
// Minimum Remove to Make Valid Parentheses - stack of "(" positions + removal marks.  O(n).
class Solution {
    public String minRemoveToMakeValid(String s) {
        Deque<Integer> st = new ArrayDeque<>();   // indices of unmatched "("
        boolean[] drop = new boolean[s.length()];
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(') st.push(i);
            else if (c == ')') { if (st.isEmpty()) drop[i] = true; else st.pop(); }
            T.r("s", s, "i", i, "st", T.rev(st));
        }
        for (int i : st) drop[i] = true;          // leftover "(" are unmatched
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) if (!drop[i]) out.append(s.charAt(i));
        return out.toString();
    }
}
