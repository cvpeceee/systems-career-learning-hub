import java.util.*;
// Trie (prefix tree) - each node has 26 children + an end-of-word flag.  O(L) per op.
class Trie {
    private static class Node { Node[] child = new Node[26]; boolean isEnd; }
    private final Node root = new Node();
    public void insert(String w) {
        Node n = root;
        for (char ch : w.toCharArray()) {
            if (n.child[ch - 'a'] == null) n.child[ch - 'a'] = new Node();   // new drawer
            n = n.child[ch - 'a'];
        }
        n.isEnd = true;
    }
    private Node walk(String s) {
        Node n = root;
        for (char ch : s.toCharArray()) { n = n.child[ch - 'a']; if (n == null) return null; }
        return n;
    }
    public boolean search(String w) { Node n = walk(w); return n != null && n.isEnd; }
    public boolean startsWith(String p) { return walk(p) != null; }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; Trie t = null;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "Trie": t = new Trie(); out[i] = "null"; break;
                case "insert": t.insert(args[i]); out[i] = "null"; break;
                case "search": out[i] = String.valueOf(t.search(args[i])); break;
                default: out[i] = String.valueOf(t.startsWith(args[i]));
            }
        }
        return out;
    }
}
