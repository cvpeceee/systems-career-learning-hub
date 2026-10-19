import java.util.*;
// Merge intervals - sort by start, then sweep once.  O(n log n).
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));   // by start
        List<int[]> merged = new ArrayList<>();
        for (int[] cur : intervals) {
            if (!merged.isEmpty() && cur[0] <= merged.get(merged.size() - 1)[1]) {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], cur[1]);                       // extend
            } else merged.add(new int[]{cur[0], cur[1]});                  // new region
        }
        return merged.toArray(new int[0][]);
    }
}
