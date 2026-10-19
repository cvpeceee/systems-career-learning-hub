import java.util.*;
// Top K Frequent - count map + buckets indexed by frequency.  O(n) (+ tiny sort for ties).
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new TreeMap<>();               // sorted keys: ties -> smaller first
        for (int i = 0; i < nums.length; i++) {
            count.merge(nums[i], 1, Integer::sum);
            T.r("nums", nums, "i", i, "count", count);
        }
        List<List<Integer>> bucket = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) bucket.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : count.entrySet()) bucket.get(e.getValue()).add(e.getKey());
        int[] out = new int[k]; int c = 0;
        for (int f = nums.length; f >= 1 && c < k; f--)
            for (int v : bucket.get(f)) { if (c == k) break; out[c++] = v; }
        return out;
    }
}
