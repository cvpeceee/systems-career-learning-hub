import java.util.*;
// Daily temperatures - monotonic (decreasing) stack of indices.  O(n) amortized.
class Solution {
    public int[] dailyTemperatures(int[] t) {
        int n = t.length;
        int[] ans = new int[n];                      // Java zero-initializes
        Deque<Integer> st = new ArrayDeque<>();      // waiting indices
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && t[i] > t[st.peek()]) {
                int j = st.pop();
                ans[j] = i - j;                      // resolved: wait = distance
            }
            st.push(i);
            T.r("t", t, "i", i, "st", T.rev(st), "ans", ans);
        }
        return ans;
    }
}
