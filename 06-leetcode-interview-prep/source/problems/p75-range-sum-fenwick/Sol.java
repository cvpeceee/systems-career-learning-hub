import java.util.*;
// Range Sum Query Mutable - Fenwick (binary indexed) tree.  O(log n) update and query.
class NumArray {
    int[] raw, bit;
    NumArray(int[] nums) { raw = new int[nums.length]; bit = new int[nums.length + 1]; for (int i = 0; i < nums.length; i++) update(i, nums[i]); }
    void add(int i, int d) { for (i++; i < bit.length; i += i & -i) bit[i] += d; }
    int prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
    void update(int i, int val) { add(i, val - raw[i]); raw[i] = val; }
    int sumRange(int l, int r) { return prefix(r + 1) - prefix(l); }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; NumArray a = null;
        for (int k = 0; k < ops.length; k++) {
            int[] v = Arrays.stream(args[k].split(",")).mapToInt(Integer::parseInt).toArray();
            if (ops[k].equals("NumArray")) { a = new NumArray(v); out[k] = "null"; }
            else if (ops[k].equals("update")) { a.update(v[0], v[1]); out[k] = "null"; }
            else out[k] = String.valueOf(a.sumRange(v[0], v[1]));
            T.r("op", ops[k], "arg", args[k], "tree", a.bit);
        }
        return out;
    }
}
