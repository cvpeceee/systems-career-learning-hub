// String to Integer (atoi) - staged parse with overflow check before each multiply.  O(n).
class Solution {
public:
    int myAtoi(string s) {
        FN("myAtoi");
        int i = 0, n = s.size(), sign = 1, res = 0;
        while (i < n && s[i] == ' ') i++;                      // stage 1: spaces
        if (i < n && (s[i] == '+' || s[i] == '-')) sign = (s[i++] == '-') ? -1 : 1;   // stage 2: sign
        while (i < n && isdigit(s[i])) {                       // stage 3: digits
            int d = s[i] - '0';
            if (res > (INT_MAX - d) / 10) return sign == 1 ? INT_MAX : INT_MIN;      // would overflow
            res = res * 10 + d;
            TR("s", s, "i", i, "res", res);
            i++;
        }
        return sign * res;
    }
};
