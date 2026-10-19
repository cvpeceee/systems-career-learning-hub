using System; using System.Collections.Generic;
// Min Stack - each entry stores (value, minimum of everything at or below it).  O(1) ops.
public class MinStack {
    public Stack<(int val, int min)> st = new();
    public void Push(int x) => st.Push((x, st.Count == 0 ? x : Math.Min(x, st.Peek().min)));
    public void Pop() => st.Pop();
    public int Top() => st.Peek().val;
    public int GetMin() => st.Peek().min;
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; var ms = new MinStack();
        for (int k = 0; k < ops.Length; k++) {
            switch (ops[k]) {
                case "push": ms.Push(int.Parse(args[k])); output[k] = "null"; break;
                case "pop": ms.Pop(); output[k] = "null"; break;
                case "top": output[k] = ms.Top().ToString(); break;
                case "getMin": output[k] = ms.GetMin().ToString(); break;
                default: output[k] = "null"; break;
            }
            T.R("op", ops[k], "arg", args[k], "size", ms.st.Count);
        }
        return output;
    }
}
