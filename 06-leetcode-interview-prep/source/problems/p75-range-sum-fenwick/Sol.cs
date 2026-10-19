using System; using System.Linq;
// Range Sum Query Mutable - Fenwick (binary indexed) tree.  O(log n) update and query.
public class NumArray {
    int[] raw; public int[] bit;
    public NumArray(int[] nums) { raw = new int[nums.Length]; bit = new int[nums.Length + 1]; for (int i = 0; i < nums.Length; i++) Update(i, nums[i]); }
    void Add(int i, int d) { for (i++; i < bit.Length; i += i & -i) bit[i] += d; }
    int Prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
    public void Update(int i, int val) { Add(i, val - raw[i]); raw[i] = val; }
    public int SumRange(int l, int r) => Prefix(r + 1) - Prefix(l);
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; NumArray a = null;
        for (int k = 0; k < ops.Length; k++) {
            int[] v = args[k].Split(',').Select(int.Parse).ToArray();
            if (ops[k] == "NumArray") { a = new NumArray(v); output[k] = "null"; }
            else if (ops[k] == "update") { a.Update(v[0], v[1]); output[k] = "null"; }
            else output[k] = a.SumRange(v[0], v[1]).ToString();
            T.R("op", ops[k], "arg", args[k], "tree", a.bit);
        }
        return output;
    }
}
