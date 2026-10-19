// Daily temperatures - monotonic (decreasing) stack of indices.  O(n) amortized.
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& t) {
        FN("dailyTemperatures");
        int n = t.size();
        vector<int> ans(n, 0);      // default 0 = no warmer day
        vector<int> st;             // indices of days still waiting; temps decrease bottom->top
        for (int i = 0; i < n; ++i) {
            while (!st.empty() && t[i] > t[st.back()]) {   // today resolves colder waiting days
                int j = st.back(); st.pop_back();
                ans[j] = i - j;                            // days waited
                TR("t", t, "i", i, "j", j, "st", st, "ans", ans);
            }
            st.push_back(i);                               // today now waits too
            TR("t", t, "i", i, "st", st, "ans", ans);
        }
        return ans;
    }
};
