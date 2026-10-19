// Min Stack - each entry stores (value, minimum of everything at or below it).  O(1) ops.
class MinStack {
    vector<pair<int, int>> st;
public:
    void push(int x) { st.push_back({x, st.empty() ? x : min(x, st.back().second)}); }
    void pop() { st.pop_back(); }
    int top() { return st.back().first; }
    int getMin() { return st.back().second; }
    vector<int> view() const { vector<int> v; for (auto& p : st) v.push_back(p.first); return v; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; MinStack ms;
        for (size_t k = 0; k < ops.size(); k++) {
            string op = ops[k], arg = args[k];
            if (op == "push") { ms.push(stoi(arg)); out.push_back("null"); }
            else if (op == "pop") { ms.pop(); out.push_back("null"); }
            else if (op == "top") out.push_back(to_string(ms.top()));
            else if (op == "getMin") out.push_back(to_string(ms.getMin()));
            else out.push_back("null");                     // constructor
            vector<int> st = ms.view();
            TR("op", op, "arg", arg, "st", st, "out", out);
        }
        return out;
    }
};
