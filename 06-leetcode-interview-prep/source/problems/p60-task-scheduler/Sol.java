// Task Scheduler - frames formed by the most frequent task.  O(len).
class Solution {
    public int leastInterval(String tasks, int n) {
        int[] count = new int[26]; int maxCount = 0, numMax = 0;
        for (char c : tasks.toCharArray()) {
            maxCount = Math.max(maxCount, ++count[c - 'A']);
            T.r("c", String.valueOf(c), "count", count, "maxCount", maxCount);
        }
        for (int c : count) if (c == maxCount) numMax++;
        T.r("count", count, "maxCount", maxCount, "numMax", numMax);
        return Math.max(tasks.length(), (maxCount - 1) * (n + 1) + numMax);
    }
}
