using System.Collections.Generic;
// Subsets - classic backtracking (choose / explore / un-choose).  O(n * 2^n).
public class Solution {
    private readonly List<IList<int>> res = new List<IList<int>>();
    private readonly List<int> path = new List<int>();
    public IList<IList<int>> Subsets(int[] nums) { Bt(nums, 0); return res; }
    private void Bt(int[] nums, int start) {
        res.Add(new List<int>(path));              // COPY the current path
        for (int i = start; i < nums.Length; i++) {
            path.Add(nums[i]);                     // choose
            Bt(nums, i + 1);                       // explore
            path.RemoveAt(path.Count - 1);         // un-choose
        }
    }
}
