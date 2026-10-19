// Range Sum Query Mutable - Fenwick (binary indexed) tree.  O(log n) update and query.
class NumArray {
    vector<int> raw, bit;                                  // bit is 1-indexed
    void add(int i, int delta) { for (i++; i < (int)bit.size(); i += i & -i) bit[i] += delta; }
    int prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }   // sum of first i
public:
    NumArray(vector<int> nums) : raw(nums.size(), 0), bit(nums.size() + 1, 0) { for (int i = 0; i < (int)nums.size(); i++) update(i, nums[i]); }
    void update(int i, int val) { add(i, val - raw[i]); raw[i] = val; }
    int sumRange(int l, int r) { return prefix(r + 1) - prefix(l); }
    vector<int> tree() const { return bit; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; NumArray* a = nullptr;
        for (size_t k = 0; k < ops.size(); k++) {
            string op = ops[k], arg = args[k];
            vector<int> v; { stringstream ss(arg); string t; while (getline(ss, t, ',')) v.push_back(stoi(t)); }
            if (op == "NumArray") { a = new NumArray(v); out.push_back("null"); }
            else if (op == "update") { a->update(v[0], v[1]); out.push_back("null"); }
            else out.push_back(to_string(a->sumRange(v[0], v[1])));
            vector<int> tree = a->tree();
            TR("op", op, "arg", arg, "tree", tree, "out", out);
        }
        delete a;
        return out;
    }
};
