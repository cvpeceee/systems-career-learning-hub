using System; using System.Collections.Generic; using System.Text;
// Decode String - stack of (saved prefix, repeat count).  O(output).
public class Solution {
    public string DecodeString(string s) {
        var strs = new Stack<StringBuilder>(); var counts = new Stack<int>();
        var cur = new StringBuilder(); int k = 0;
        for (int i = 0; i < s.Length; i++) {
            char c = s[i];
            if (char.IsDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { strs.Push(cur); counts.Push(k); cur = new StringBuilder(); k = 0; }
            else if (c == ']') { var prev = strs.Pop(); int n = counts.Pop(); var piece = cur.ToString(); for (int t = 0; t < n; t++) prev.Append(piece); cur = prev; }
            else cur.Append(c);
            T.R("s", s, "i", i, "cur", cur.ToString(), "counts", counts);
        }
        return cur.ToString();
    }
}
