// Trie (prefix tree) - each node has 26 children + an end-of-word flag.  O(L) per op.
public class Trie {
    private class Node { public Node[] child = new Node[26]; public bool isEnd; }
    private readonly Node root = new Node();
    public void Insert(string w) {
        var n = root;
        foreach (char ch in w) { n.child[ch - 'a'] ??= new Node(); n = n.child[ch - 'a']; }   // create if missing
        n.isEnd = true;
    }
    private Node Walk(string s) {
        var n = root;
        foreach (char ch in s) { n = n.child[ch - 'a']; if (n == null) return null; }
        return n;
    }
    public bool Search(string w) { var n = Walk(w); return n != null && n.isEnd; }
    public bool StartsWith(string p) => Walk(p) != null;
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; Trie t = null;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "Trie": t = new Trie(); output[i] = "null"; break;
                case "insert": t.Insert(args[i]); output[i] = "null"; break;
                case "search": output[i] = t.Search(args[i]) ? "true" : "false"; break;
                default: output[i] = t.StartsWith(args[i]) ? "true" : "false"; break;
            }
        }
        return output;
    }
}
