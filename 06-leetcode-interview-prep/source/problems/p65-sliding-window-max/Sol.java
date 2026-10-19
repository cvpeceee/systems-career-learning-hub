import java.util.*;
// Sliding Window Maximum - monotonic decreasing deque of indices.  O(n).
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        ArrayDeque<Integer> dq = new ArrayDeque<>(); int[] out = new int[nums.length - k + 1];
        for (int i = 0; i < nums.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.addLast(i);
            if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
            T.r("nums", nums, "i", i, "dq", dq, "out", out);
        }
        return out;
    }
}
