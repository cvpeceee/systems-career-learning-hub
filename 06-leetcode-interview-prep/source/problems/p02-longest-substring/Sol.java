import java.util.*;
// Longest substring without repeats - sliding window + last-seen index.  O(n) time.
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();   // char -> last index seen
        int left = 0, best = 0;                           // window = s[left..r]
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            Integer prev = last.get(c);
            if (prev != null && prev >= left) left = prev + 1;   // repeat inside window: move tail
            last.put(c, r);
            best = Math.max(best, r - left + 1);
        }
        return best;
    }
}
