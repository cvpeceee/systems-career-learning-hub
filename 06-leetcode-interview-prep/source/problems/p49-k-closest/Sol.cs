using System; using System.Collections.Generic; using System.Linq;
// K Closest Points - max-heap of size k on squared distance.  O(n log k).
public class Solution {
    static (long, int, int) Key(int[] p) => ((long)p[0] * p[0] + (long)p[1] * p[1], p[0], p[1]);
    public int[][] KClosest(int[][] points, int k) {
        var far = Comparer<(long, int, int)>.Create((a, b) => b.CompareTo(a));   // reversed => max-heap
        var pq = new PriorityQueue<int[], (long, int, int)>(far);
        foreach (var p in points) { pq.Enqueue(p, Key(p)); if (pq.Count > k) pq.Dequeue(); }
        return pq.UnorderedItems.Select(x => x.Element).OrderBy(Key).ToArray();
    }
}
