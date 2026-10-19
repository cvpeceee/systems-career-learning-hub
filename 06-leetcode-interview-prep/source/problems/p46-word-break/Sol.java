import java.util.*;
// Word Break - prefix DP: ok[i] = s[0..i) can be segmented.  O(n * maxLen).
class Solution {
    public boolean wordBreak(String s, String[] wordDict) {
        Set<String> dict = new HashSet<>(Arrays.asList(wordDict));
        int maxLen = 0; for (String w : wordDict) maxLen = Math.max(maxLen, w.length());
        boolean[] ok = new boolean[s.length() + 1]; ok[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int j = i - 1; j >= 0 && i - j <= maxLen; j--)
                if (ok[j] && dict.contains(s.substring(j, i))) { ok[i] = true; break; }
        return ok[s.length()];
    }
}
