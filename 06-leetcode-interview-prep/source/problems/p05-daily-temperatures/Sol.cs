using System.Collections.Generic;
// Daily temperatures - monotonic (decreasing) stack of indices.  O(n) amortized.
public class Solution {
    public int[] DailyTemperatures(int[] t) {
        int n = t.Length;
        var ans = new int[n];
        var st = new Stack<int>();                   // waiting indices
        for (int i = 0; i < n; i++) {
            while (st.Count > 0 && t[i] > t[st.Peek()]) {
                int j = st.Pop();
                ans[j] = i - j;
            }
            st.Push(i);
        }
        return ans;
    }
}
