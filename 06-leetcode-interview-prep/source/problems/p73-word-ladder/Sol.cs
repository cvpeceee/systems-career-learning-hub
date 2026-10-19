using System; using System.Collections.Generic;
// Word Ladder - BFS over an implicit graph; neighbours by changing one letter.  O(n*L*26).
public class Solution {
    public int LadderLength(string beginWord, string endWord, string[] wordList) {
        var dict = new HashSet<string>(wordList);
        if (!dict.Contains(endWord)) return 0;
        var q = new Queue<string>(); q.Enqueue(beginWord); dict.Remove(beginWord);
        for (int level = 1; q.Count > 0; level++) {
            T.R("level", level, "q", new List<string>(q));
            for (int sz = q.Count; sz > 0; sz--) {
                string word = q.Dequeue();
                if (word == endWord) return level;
                var w = word.ToCharArray();
                for (int p = 0; p < w.Length; p++) {
                    char old = w[p];
                    for (char c = 'a'; c <= 'z'; c++) { w[p] = c; var next = new string(w); if (dict.Remove(next)) q.Enqueue(next); }
                    w[p] = old;
                }
            }
        }
        return 0;
    }
}
