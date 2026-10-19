// Kth largest - min-heap holding the k largest seen so far.  O(n log k).
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        FN("findKthLargest");
        priority_queue<int, vector<int>, greater<int>> heap;   // min-heap: smallest of top-k on top
        for (int i = 0; i < (int)nums.size(); ++i) {
            heap.push(nums[i]);                                 // O(log k)
            if ((int)heap.size() > k) heap.pop();               // evict smallest -> keep k biggest
            TR("nums", nums, "i", i, "k", k, "heap", heap);
        }
        return heap.top();                                      // k-th largest
    }
};
