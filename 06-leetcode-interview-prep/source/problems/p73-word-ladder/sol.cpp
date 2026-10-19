// Word Ladder - BFS over an implicit graph; neighbours by changing one letter.  O(n*L*26).
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string> wordList) {
        FN("ladderLength");
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;
        deque<string> q{beginWord}; dict.erase(beginWord);
        for (int level = 1; !q.empty(); level++) {
            vector<string> qv(q.begin(), q.end());
            TR("level", level, "q", qv);
            for (int sz = q.size(); sz > 0; sz--) {
                string word = q.front(); q.pop_front();
                if (word == endWord) return level;
                for (int p = 0; p < (int)word.size(); p++) {
                    string next = word;
                    for (char c = 'a'; c <= 'z'; c++) {
                        next[p] = c;
                        if (dict.erase(next)) q.push_back(next);   // first visit = shortest
                    }
                }
            }
        }
        return 0;
    }
};
