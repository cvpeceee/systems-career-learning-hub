// Task Scheduler - frames formed by the most frequent task.  O(len).
class Solution {
public:
    int leastInterval(string tasks, int n) {
        FN("leastInterval");
        vector<int> count(26, 0);
        for (char c : tasks) {
            count[c - 'A']++;
            TR("c", string(1, c), "count", count);
        }
        int maxCount = *max_element(count.begin(), count.end());
        int numMax = 0;
        for (int c : count) if (c == maxCount) numMax++;           // letters tied for the max
        TR("count", count, "maxCount", maxCount, "numMax", numMax);
        int frames = (maxCount - 1) * (n + 1) + numMax;             // skeleton with gaps
        return max((int)tasks.size(), frames);                      // enough tasks => no idles
    }
};
