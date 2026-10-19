import java.util.*;
// Valid parentheses - stack of open brackets.  O(n) time, O(n) space.
class Solution {
    public boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();     // ArrayDeque is the idiomatic Java stack
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') { st.push(c); continue; }   // opener
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (st.isEmpty() || st.pop() != want) return false;              // empty or wrong type
        }
        return st.isEmpty();                          // all openers must be closed
    }
}
