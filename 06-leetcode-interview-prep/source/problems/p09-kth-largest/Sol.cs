using System.Collections.Generic;
// Kth largest - min-heap holding the k largest seen so far.  O(n log k).
public class Solution {
    public int FindKthLargest(int[] nums, int k) {
        var heap = new PriorityQueue<int, int>();   // .NET 6+ PQ: lowest priority dequeues first (min-heap)
        for (int i = 0; i < nums.Length; i++) {
            heap.Enqueue(nums[i], nums[i]);
            if (heap.Count > k) heap.Dequeue();     // drop the smallest
            T.R("nums", nums, "i", i, "heap", heap);
        }
        return heap.Peek();
    }
}
