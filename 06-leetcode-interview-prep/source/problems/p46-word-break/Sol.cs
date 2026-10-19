using System.Collections.Generic; using System.Linq;
// Word Break - prefix DP: ok[i] = s[0..i) can be segmented.  O(n * maxLen).
public class Solution {
    public bool WordBreak(string s, string[] wordDict) {
        var dict = new HashSet<string>(wordDict);
        int maxLen = wordDict.Max(w => w.Length);
        var ok = new bool[s.Length + 1]; ok[0] = true;
        for (int i = 1; i <= s.Length; i++)
            for (int j = i - 1; j >= 0 && i - j <= maxLen; j--)
                if (ok[j] && dict.Contains(s.Substring(j, i - j))) { ok[i] = true; break; }
        return ok[s.Length];
    }
}
