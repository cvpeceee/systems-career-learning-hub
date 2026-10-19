// Trie (prefix tree) - each node has 26 children + an end-of-word flag.  O(L) per op.
struct TrieNode {
    unique_ptr<TrieNode> child[26];     // unique_ptr: nodes are freed automatically (RAII)
    bool isEnd = false;                 // "a full word ends here"
};
class Trie {
    TrieNode root;
    const TrieNode* walk(const string& s) const {      // follow s; nullptr if path missing
        const TrieNode* n = &root;
        for (char ch : s) {
            n = n->child[ch - 'a'].get();
            if (!n) return nullptr;
        }
        return n;
    }
public:
    vector<string> words;               // only for the visualizer: words inserted so far
    void insert(const string& w) {
        FN("insert");
        TrieNode* n = &root;
        for (char ch : w) {
            auto& slot = n->child[ch - 'a'];
            if (!slot) slot = make_unique<TrieNode>();  // open a new drawer
            n = slot.get();
        }
        n->isEnd = true;                                // mark word end
        words.push_back(w);
        TR("word", w, "trie", words);
    }
    bool search(const string& w) const { const TrieNode* n = walk(w); return n && n->isEnd; }
    bool startsWith(const string& p) const { return walk(p) != nullptr; }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        FN("run");
        vector<string> out;
        unique_ptr<Trie> t;
        for (size_t i = 0; i < ops.size(); ++i) {
            const string& op = ops[i];
            if (op == "Trie") { t = make_unique<Trie>(); out.push_back("null"); }
            else if (op == "insert") { t->insert(args[i]); out.push_back("null"); }
            else if (op == "search") out.push_back(t->search(args[i]) ? "true" : "false");
            else out.push_back(t->startsWith(args[i]) ? "true" : "false");
            TR("op", op, "word", args[i], "trie", t->words, "out", out);
        }
        return out;
    }
};
