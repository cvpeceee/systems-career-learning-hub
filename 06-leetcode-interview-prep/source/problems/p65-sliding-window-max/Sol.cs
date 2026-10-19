using System.Collections.Generic;
// Sliding Window Maximum - monotonic decreasing deque of indices (LinkedList as a deque).  O(n).
public class Solution {
    public int[] MaxSlidingWindow(int[] nums, int k) {
        var dq = new LinkedList<int>(); var output = new int[nums.Length - k + 1];
        for (int i = 0; i < nums.Length; i++) {
            if (dq.Count > 0 && dq.First.Value <= i - k) dq.RemoveFirst();
            while (dq.Count > 0 && nums[dq.Last.Value] <= nums[i]) dq.RemoveLast();
            dq.AddLast(i);
            if (i >= k - 1) output[i - k + 1] = nums[dq.First.Value];
            T.R("nums", nums, "i", i, "dq", dq, "out", output);
        }
        return output;
    }
}
