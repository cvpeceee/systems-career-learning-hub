// Word Search II - trie of all words + grid DFS that follows trie edges.  Prunes dead prefixes.
class Solution {
    struct Node { Node* kid[26] = {}; string word; ~Node() { for (auto k : kid) delete k; } };
public:
    vector<string> board_, found;
    void dfs(int r, int c, Node* node) {
        FN("dfs");
        char ch = board_[r][c];
        if (ch == '#' || !node->kid[ch - 'a']) return;   // used cell, or no word continues this way
        node = node->kid[ch - 'a'];
        if (!node->word.empty()) { found.push_back(node->word); node->word.clear(); }   // report once
        board_[r][c] = '#';                               // mark visited for this path
        vector<string> board = board_;
        TR("board", board, "r", r, "c", c, "found", found);
        int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nc >= 0 && nr < (int)board_.size() && nc < (int)board_[0].size()) dfs(nr, nc, node);
        }
        board_[r][c] = ch;                                // backtrack: restore
    }
    vector<string> findWords(vector<string> board, vector<string> words) {
        FN("findWords");
        Node root;
        for (auto& w : words) {                           // build the trie
            Node* n = &root;
            for (char ch : w) { if (!n->kid[ch - 'a']) n->kid[ch - 'a'] = new Node(); n = n->kid[ch - 'a']; }
            n->word = w;
        }
        board_ = board;
        for (int r = 0; r < (int)board.size(); r++)
            for (int c = 0; c < (int)board[0].size(); c++) dfs(r, c, &root);
        sort(found.begin(), found.end());
        return found;
    }
};
