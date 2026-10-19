using System.Collections.Generic;
// Top K Frequent - count map + buckets indexed by frequency.  O(n).
public class Solution {
    public int[] TopKFrequent(int[] nums, int k) {
        var count = new SortedDictionary<int, int>();                // sorted keys: ties -> smaller first
        for (int i = 0; i < nums.Length; i++) {
            count[nums[i]] = count.GetValueOrDefault(nums[i]) + 1;
            T.R("nums", nums, "i", i, "count", count);
        }
        var bucket = new List<int>[nums.Length + 1];
        for (int i = 0; i <= nums.Length; i++) bucket[i] = new List<int>();
        foreach (var kv in count) bucket[kv.Value].Add(kv.Key);
        var output = new List<int>();
        for (int f = nums.Length; f >= 1 && output.Count < k; f--)
            foreach (var v in bucket[f]) { if (output.Count == k) break; output.Add(v); }
        return output.ToArray();
    }
}
