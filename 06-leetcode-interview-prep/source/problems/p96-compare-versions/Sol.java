// Compare Version Numbers - parse one revision at a time from each string.  O(n), O(1) extra.
class Solution {
    public int compareVersion(String v1, String v2) {
        int i = 0, j = 0, n = v1.length(), m = v2.length();
        while (i < n || j < m) {
            long a = 0, b = 0;
            while (i < n && v1.charAt(i) != '.') a = a * 10 + (v1.charAt(i++) - '0');
            while (j < m && v2.charAt(j) != '.') b = b * 10 + (v2.charAt(j++) - '0');
            T.r("v1", v1, "i", i, "j", j, "a", a, "b", b);
            if (a != b) return a < b ? -1 : 1;
            i++; j++;
        }
        return 0;
    }
}
