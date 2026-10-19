import java.util.*;
// Word Ladder - BFS over an implicit graph; neighbours by changing one letter.  O(n*L*26).
class Solution {
    public int ladderLength(String beginWord, String endWord, String[] wordList) {
        Set<String> dict = new HashSet<>(Arrays.asList(wordList));
        if (!dict.contains(endWord)) return 0;
        Deque<String> q = new ArrayDeque<>(); q.add(beginWord); dict.remove(beginWord);
        for (int level = 1; !q.isEmpty(); level++) {
            T.r("level", level, "q", new ArrayList<>(q));
            for (int sz = q.size(); sz > 0; sz--) {
                String word = q.poll();
                if (word.equals(endWord)) return level;
                char[] w = word.toCharArray();
                for (int p = 0; p < w.length; p++) {
                    char old = w[p];
                    for (char c = 'a'; c <= 'z'; c++) { w[p] = c; String next = new String(w); if (dict.remove(next)) q.add(next); }
                    w[p] = old;
                }
            }
        }
        return 0;
    }
}
