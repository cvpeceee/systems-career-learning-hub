// Minimum Window Substring - expand right until valid, shrink left while valid.  O(|s|+|t|).
public class Solution {
    public string MinWindow(string s, string t) {
        var need = new int[128];
        foreach (var c in t) need[c]++;
        int missing = t.Length, l = 0, bestL = 0, bestLen = int.MaxValue;
        for (int r = 0; r < s.Length; r++) {
            if (need[s[r]]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
                if (++need[s[l]] > 0) missing++;          // lost a needed char
                l++;
            }
        }
        return bestLen == int.MaxValue ? "" : s.Substring(bestL, bestLen);
    }
}
