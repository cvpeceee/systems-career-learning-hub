// Decode Ways - climbing-stairs DP with validity checks.  O(n), O(1).
public class Solution {
    public int NumDecodings(string s) {
        int prev2 = 1, prev1 = s[0] != '0' ? 1 : 0;
        for (int i = 2; i <= s.Length; i++) {
            int cur = 0;
            if (s[i - 1] != '0') cur += prev1;
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (two >= 10 && two <= 26) cur += prev2;
            prev2 = prev1; prev1 = cur;
        }
        return prev1;
    }
}
