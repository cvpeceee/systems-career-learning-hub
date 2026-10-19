// Compare Version Numbers - parse one revision at a time from each string.  O(n), O(1) extra.
class Solution {
public:
    int compareVersion(string v1, string v2) {
        FN("compareVersion");
        int i = 0, j = 0, n = v1.size(), m = v2.size();
        while (i < n || j < m) {
            long a = 0, b = 0;
            while (i < n && v1[i] != '.') a = a * 10 + (v1[i++] - '0');   // missing part -> 0
            while (j < m && v2[j] != '.') b = b * 10 + (v2[j++] - '0');
            TR("v1", v1, "i", i, "j", j, "a", (int)a, "b", (int)b);
            if (a != b) return a < b ? -1 : 1;
            i++; j++;                                                    // skip the dots
        }
        return 0;
    }
};
