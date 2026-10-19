import java.util.*;
// K Closest Points - max-heap of size k on squared distance.  O(n log k).
class Solution {
    static long d(int[] p) { return (long) p[0] * p[0] + (long) p[1] * p[1]; }
    public int[][] kClosest(int[][] points, int k) {
        Comparator<int[]> near = Comparator.<int[]>comparingLong(Solution::d).thenComparingInt(p -> p[0]).thenComparingInt(p -> p[1]);
        PriorityQueue<int[]> pq = new PriorityQueue<>(near.reversed());     // max-heap
        for (int[] p : points) { pq.add(p); if (pq.size() > k) pq.poll(); }
        int[][] out = pq.toArray(new int[0][]);
        Arrays.sort(out, near);
        return out;
    }
}
