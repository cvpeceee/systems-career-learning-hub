using System; using System.Collections.Generic;
// Meeting Rooms II - sort by start; min-heap of end times = rooms in use.  O(n log n).
public class Solution {
    public int MinMeetingRooms(int[][] intervals) {
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        var heap = new PriorityQueue<int, int>();
        for (int i = 0; i < intervals.Length; i++) {
            if (heap.Count > 0 && heap.Peek() <= intervals[i][0]) heap.Dequeue();   // reuse freed room
            heap.Enqueue(intervals[i][1], intervals[i][1]);
            T.R("intervals", intervals, "i", i, "heap", heap);
        }
        return heap.Count;
    }
}
