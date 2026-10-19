using System; using System.Collections.Generic;
// Longest substring without repeats - sliding window + last-seen index.  O(n) time.
public class Solution {
    public int LengthOfLongestSubstring(string s) {
        var last = new Dictionary<char, int>();   // char -> last index seen
        int left = 0, best = 0;                   // window = s[left..r]
        for (int r = 0; r < s.Length; r++) {
            char c = s[r];
            if (last.TryGetValue(c, out int prev) && prev >= left) left = prev + 1;   // move tail past old copy
            last[c] = r;
            best = Math.Max(best, r - left + 1);
        }
        return best;
    }
}
