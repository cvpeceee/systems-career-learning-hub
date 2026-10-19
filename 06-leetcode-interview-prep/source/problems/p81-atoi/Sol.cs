using System;
// String to Integer (atoi) - staged parse with overflow check before each multiply.  O(n).
public class Solution {
    public int MyAtoi(string s) {
        int i = 0, n = s.Length, sign = 1, res = 0;
        while (i < n && s[i] == ' ') i++;
        if (i < n && (s[i] == '+' || s[i] == '-')) sign = (s[i++] == '-') ? -1 : 1;
        while (i < n && s[i] >= '0' && s[i] <= '9') {
            int d = s[i] - '0';
            if (res > (int.MaxValue - d) / 10) return sign == 1 ? int.MaxValue : int.MinValue;
            res = res * 10 + d;
            T.R("s", s, "i", i, "res", res);
            i++;
        }
        return sign * res;
    }
}
