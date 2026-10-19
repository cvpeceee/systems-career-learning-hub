using System; using System.Collections.Generic; using System.Text;
// Minimum Remove to Make Valid Parentheses - stack of "(" positions + removal marks.  O(n).
public class Solution {
    public string MinRemoveToMakeValid(string s) {
        var st = new Stack<int>();                // indices of unmatched "("
        var drop = new bool[s.Length];
        for (int i = 0; i < s.Length; i++) {
            if (s[i] == '(') st.Push(i);
            else if (s[i] == ')') { if (st.Count == 0) drop[i] = true; else st.Pop(); }
            T.R("s", s, "i", i, "st", st);
        }
        foreach (int i in st) drop[i] = true;     // leftover "(" are unmatched
        var output = new StringBuilder();
        for (int i = 0; i < s.Length; i++) if (!drop[i]) output.Append(s[i]);
        return output.ToString();
    }
}
