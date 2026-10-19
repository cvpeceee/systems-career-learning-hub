// Counting bits - reuse the answer for i >> 1.  O(n).
public class Solution {
    public int[] CountBits(int n) {
        var ans = new int[n + 1];
        for (int i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1);   // drop last bit, add it back
        return ans;
    }
}
