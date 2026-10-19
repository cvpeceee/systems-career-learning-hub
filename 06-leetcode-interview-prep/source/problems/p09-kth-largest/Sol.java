import java.util.*;
// Kth largest - min-heap holding the k largest seen so far.  O(n log k).
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();   // Java PQ is a min-heap by default
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();                  // drop the smallest
        }
        return heap.peek();
    }
}
