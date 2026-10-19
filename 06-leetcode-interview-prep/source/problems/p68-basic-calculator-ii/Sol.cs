using System; using System.Collections.Generic;
// Basic Calculator II - apply * and / immediately, defer + and - on a stack.  O(n).
public class Solution {
    public int Calculate(string s) {
        var st = new List<int>(); int num = 0; char op = '+';
        for (int i = 0; i < s.Length; i++) {
            char c = s[i];
            if (char.IsDigit(c)) num = num * 10 + (c - '0');
            if ((!char.IsDigit(c) && c != ' ') || i == s.Length - 1) {
                if (op == '+') st.Add(num);
                else if (op == '-') st.Add(-num);
                else if (op == '*') st[^1] *= num;
                else st[^1] /= num;                                  // C# truncates toward zero
                op = c; num = 0;
                T.R("s", s, "i", i, "st", st);
            }
        }
        int total = 0;
        foreach (int v in st) total += v;
        return total;
    }
}
