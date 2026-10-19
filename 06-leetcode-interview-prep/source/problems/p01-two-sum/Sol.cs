using System.Collections.Generic;
// Two Sum - one pass with a hash map.  Time O(n), Space O(n).
public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var seen = new Dictionary<int, int>();          // value -> index (the "coat rack")
        for (int i = 0; i < nums.Length; i++) {
            long need = (long)target - nums[i];          // partner we still need; long avoids overflow
            T.R("nums", nums, "i", i, "need", need, "seen", seen);
            if (need >= int.MinValue && need <= int.MaxValue && seen.TryGetValue((int)need, out int j))
                return new[] { j, i };                   // earlier index first
            seen[nums[i]] = i;                           // insert AFTER the check
            T.R("nums", nums, "i", i, "need", need, "seen", seen);
        }
        return new int[0];                               // unreachable if an answer exists
    }
}
