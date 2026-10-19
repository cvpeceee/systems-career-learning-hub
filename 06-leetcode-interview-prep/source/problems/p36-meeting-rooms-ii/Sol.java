import java.util.*;
// Meeting Rooms II - sort by start; min-heap of end times = rooms in use.  O(n log n).
class Solution {
    public int minMeetingRooms(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int i = 0; i < intervals.length; i++) {
            if (!heap.isEmpty() && heap.peek() <= intervals[i][0]) heap.poll();   // reuse freed room
            heap.add(intervals[i][1]);
            T.r("intervals", intervals, "i", i, "heap", heap);
        }
        return heap.size();
    }
}
