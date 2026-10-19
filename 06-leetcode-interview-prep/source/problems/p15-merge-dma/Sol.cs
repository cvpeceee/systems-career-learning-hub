using System; using System.Collections.Generic;
// Merge intervals - sort by start, then sweep once.  O(n log n).
public class Solution {
    public int[][] Merge(int[][] intervals) {
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));            // by start
        var merged = new List<int[]>();
        for (int i = 0; i < intervals.Length; i++) {
            var cur = intervals[i];
            if (merged.Count > 0 && cur[0] <= merged[^1][1])
                merged[^1][1] = Math.Max(merged[^1][1], cur[1]);           // extend
            else merged.Add(new[] { cur[0], cur[1] });                     // new region
            T.R("intervals", intervals, "i", i, "merged", merged);
        }
        return merged.ToArray();
    }
}
