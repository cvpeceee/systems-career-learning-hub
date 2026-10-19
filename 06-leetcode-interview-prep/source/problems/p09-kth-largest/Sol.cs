using System.Collections.Generic;
// Kth largest - min-heap holding the k largest seen so far.  O(n log k).
public class Solution {
    public int FindKthLargest(int[] nums, int k) {
        var heap = new PriorityQueue<int, int>();   // .NET 6+ PQ: lowest priority dequeues first (min-heap)
        foreach (int x in nums) {
            heap.Enqueue(x, x);
            if (heap.Count > k) heap.Dequeue();     // drop the smallest
        }
        return heap.Peek();
    }
}
