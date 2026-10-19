using System; using System.Linq;
// Task Scheduler - frames formed by the most frequent task.  O(len).
public class Solution {
    public int LeastInterval(string tasks, int n) {
        var count = new int[26];
        foreach (var c in tasks) {
            count[c - 'A']++;
            T.R("c", c.ToString(), "count", count);
        }
        int maxCount = count.Max(), numMax = count.Count(c => c == maxCount);
        T.R("count", count, "maxCount", maxCount, "numMax", numMax);
        return Math.Max(tasks.Length, (maxCount - 1) * (n + 1) + numMax);
    }
}
