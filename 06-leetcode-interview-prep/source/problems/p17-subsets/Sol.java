import java.util.*;
// Subsets - classic backtracking (choose / explore / un-choose).  O(n * 2^n).
class Solution {
    private final List<List<Integer>> res = new ArrayList<>();
    private final List<Integer> path = new ArrayList<>();
    public List<List<Integer>> subsets(int[] nums) { bt(nums, 0); return res; }
    private void bt(int[] nums, int start) {
        res.add(new ArrayList<>(path));            // COPY the current path
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);                     // choose
            bt(nums, i + 1);                       // explore
            path.remove(path.size() - 1);          // un-choose (remove by index, not by value!)
        }
    }
}
