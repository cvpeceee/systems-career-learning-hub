import java.util.*;
// Permutations - backtracking with a used[] mask.  O(n * n!).
class Solution {
    List<List<Integer>> res = new ArrayList<>();
    void dfs(int[] nums, List<Integer> path, boolean[] used) {
        if (path.size() == nums.length) { res.add(new ArrayList<>(path)); return; }   // copy!
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.add(nums[i]);
            T.r("nums", nums, "i", i, "depth", path.size() - 1, "path", path);
            dfs(nums, path, used);
            path.remove(path.size() - 1); used[i] = false;
        }
    }
    public List<List<Integer>> permute(int[] nums) { dfs(nums, new ArrayList<>(), new boolean[nums.length]); return res; }
}
