import java.util.*;
// Two Sum - one pass with a hash map.  Time O(n), Space O(n).
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();   // value -> index (the "coat rack")
        for (int i = 0; i < nums.length; i++) {
            long need = (long) target - nums[i];         // partner we still need; long avoids overflow
            if (need >= Integer.MIN_VALUE && need <= Integer.MAX_VALUE) {
                Integer j = seen.get((int) need);        // O(1) average lookup
                if (j != null) return new int[]{j, i};   // earlier index first
            }
            seen.put(nums[i], i);                        // insert AFTER the check
        }
        return new int[0];                               // unreachable if an answer exists
    }
}
