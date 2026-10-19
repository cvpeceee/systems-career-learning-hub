// Meeting Rooms II - sort by start; min-heap of end times = rooms in use.  O(n log n).
class Solution {
public:
    int minMeetingRooms(vector<vector<int>> intervals) {
        FN("minMeetingRooms");
        sort(intervals.begin(), intervals.end());                 // by start time
        priority_queue<int, vector<int>, greater<int>> heap;      // end times, earliest on top
        for (int i = 0; i < (int)intervals.size(); i++) {
            if (!heap.empty() && heap.top() <= intervals[i][0]) heap.pop();   // that room is free: reuse
            heap.push(intervals[i][1]);                           // occupy a room until end
            TR("intervals", intervals, "i", i, "heap", heap);
        }
        return heap.size();                                       // rooms ever opened
    }
};
