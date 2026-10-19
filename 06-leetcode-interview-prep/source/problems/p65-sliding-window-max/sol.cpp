// Sliding Window Maximum - monotonic decreasing deque of indices.  O(n).
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int> nums, int k) {
        FN("maxSlidingWindow");
        deque<int> d;                                         // indices; values decreasing front -> back
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (!d.empty() && d.front() <= i - k) d.pop_front();          // front left the window
            while (!d.empty() && nums[d.back()] <= nums[i]) d.pop_back(); // smaller & older: never the max again
            d.push_back(i);
            if (i >= k - 1) out.push_back(nums[d.front()]);               // front = window max
            vector<int> dq(d.begin(), d.end());
            TR("nums", nums, "i", i, "dq", dq, "out", out);
        }
        return out;
    }
};
