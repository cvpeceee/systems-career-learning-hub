using System.Collections.Generic;
// Permutations - backtracking with a used[] mask.  O(n * n!).
public class Solution {
    IList<IList<int>> res = new List<IList<int>>();
    void Dfs(int[] nums, List<int> path, bool[] used) {
        if (path.Count == nums.Length) { res.Add(new List<int>(path)); return; }       // copy!
        for (int i = 0; i < nums.Length; i++) {
            if (used[i]) continue;
            used[i] = true; path.Add(nums[i]);
            T.R("nums", nums, "i", i, "depth", path.Count - 1, "path", path);
            Dfs(nums, path, used);
            path.RemoveAt(path.Count - 1); used[i] = false;
        }
    }
    public IList<IList<int>> Permute(int[] nums) { Dfs(nums, new List<int>(), new bool[nums.Length]); return res; }
}
