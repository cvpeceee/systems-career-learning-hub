using System;
// Compare Version Numbers - parse one revision at a time from each string.  O(n), O(1) extra.
public class Solution {
    public int CompareVersion(string v1, string v2) {
        int i = 0, j = 0, n = v1.Length, m = v2.Length;
        while (i < n || j < m) {
            long a = 0, b = 0;
            while (i < n && v1[i] != '.') a = a * 10 + (v1[i++] - '0');
            while (j < m && v2[j] != '.') b = b * 10 + (v2[j++] - '0');
            T.R("v1", v1, "i", i, "j", j, "a", a, "b", b);
            if (a != b) return a < b ? -1 : 1;
            i++; j++;
        }
        return 0;
    }
}
