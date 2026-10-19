using System; using System.Collections.Generic;
// Word Search II - trie of all words + grid DFS that follows trie edges.
public class Solution {
    class Node { public Node[] kid = new Node[26]; public string word; }
    char[][] b; List<string> found = new List<string>();
    void Dfs(int r, int c, Node node) {
        char ch = b[r][c];
        if (ch == '#' || node.kid[ch - 'a'] == null) return;     // prune
        node = node.kid[ch - 'a'];
        if (node.word != null) { found.Add(node.word); node.word = null; }
        b[r][c] = '#';
        T.R("board", b, "r", r, "c", c, "found", found);
        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) { int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nc >= 0 && nr < b.Length && nc < b[0].Length) Dfs(nr, nc, node); }
        b[r][c] = ch;                                              // restore
    }
    public string[] FindWords(string[] board, string[] words) {
        var root = new Node();
        foreach (var w in words) { var n = root;
            foreach (var ch in w) { n.kid[ch - 'a'] ??= new Node(); n = n.kid[ch - 'a']; }
            n.word = w; }
        b = Array.ConvertAll(board, s => s.ToCharArray());
        for (int r = 0; r < b.Length; r++) for (int c = 0; c < b[0].Length; c++) Dfs(r, c, root);
        found.Sort(StringComparer.Ordinal);
        return found.ToArray();
    }
}
