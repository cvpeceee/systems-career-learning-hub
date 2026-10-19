import java.util.*;
// Min Stack - each entry stores (value, minimum of everything at or below it).  O(1) ops.
class MinStack {
    Deque<int[]> st = new ArrayDeque<>();
    void push(int x) { st.push(new int[]{x, st.isEmpty() ? x : Math.min(x, st.peek()[1])}); }
    void pop() { st.pop(); }
    int top() { return st.peek()[0]; }
    int getMin() { return st.peek()[1]; }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; MinStack ms = new MinStack();
        for (int k = 0; k < ops.length; k++) {
            switch (ops[k]) {
                case "push": ms.push(Integer.parseInt(args[k])); out[k] = "null"; break;
                case "pop": ms.pop(); out[k] = "null"; break;
                case "top": out[k] = String.valueOf(ms.top()); break;
                case "getMin": out[k] = String.valueOf(ms.getMin()); break;
                default: out[k] = "null";
            }
            T.r("op", ops[k], "arg", args[k], "size", ms.st.size());
        }
        return out;
    }
}
