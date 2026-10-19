import java.util.*;
// Word Search II - trie of all words + grid DFS that follows trie edges.
class Solution {
    static class Node { Node[] kid = new Node[26]; String word; }
    char[][] b; List<String> found = new ArrayList<>();
    void dfs(int r, int c, Node node) {
        char ch = b[r][c];
        if (ch == '#' || node.kid[ch - 'a'] == null) return;     // prune
        node = node.kid[ch - 'a'];
        if (node.word != null) { found.add(node.word); node.word = null; }
        b[r][c] = '#';
        T.r("board", b, "r", r, "c", c, "found", found);
        int[][] d = {{1,0},{-1,0},{0,1},{0,-1}};
        for (int[] x : d) { int nr = r + x[0], nc = c + x[1];
            if (nr >= 0 && nc >= 0 && nr < b.length && nc < b[0].length) dfs(nr, nc, node); }
        b[r][c] = ch;                                              // restore
    }
    public String[] findWords(String[] board, String[] words) {
        Node root = new Node();
        for (String w : words) { Node n = root;
            for (char ch : w.toCharArray()) { if (n.kid[ch - 'a'] == null) n.kid[ch - 'a'] = new Node(); n = n.kid[ch - 'a']; }
            n.word = w; }
        b = new char[board.length][];
        for (int i = 0; i < board.length; i++) b[i] = board[i].toCharArray();
        for (int r = 0; r < b.length; r++) for (int c = 0; c < b[0].length; c++) dfs(r, c, root);
        Collections.sort(found);
        return found.toArray(new String[0]);
    }
}
