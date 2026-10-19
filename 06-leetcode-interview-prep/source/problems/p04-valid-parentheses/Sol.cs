using System.Collections.Generic;
// Valid parentheses - stack of open brackets.  O(n) time, O(n) space.
public class Solution {
    public bool IsValid(string s) {
        var st = new Stack<char>();
        for (int i = 0; i < s.Length; i++) {
            char c = s[i];
            T.R("s", s, "i", i, "st", st);
            if (c == '(' || c == '[' || c == '{') { st.Push(c); continue; }   // opener
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (st.Count == 0 || st.Pop() != want) return false;              // empty or wrong type
        }
        return st.Count == 0;                         // all openers must be closed
    }
}
