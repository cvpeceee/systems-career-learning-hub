// Serialize / deserialize - pre-order with '#' for null.  O(n) both ways.
class Solution {
public:
    void ser(TreeNode* n, vector<string>& out, TreeNode* root) {
        FN("ser");
        if (!n) { out.push_back("#"); return; }        // explicit null marker removes ambiguity
        out.push_back(to_string(n->val));
        int val = n->val;
        TR("root", root, "val", val, "out", out);
        ser(n->left, out, root);
        ser(n->right, out, root);
    }
    string plain(TreeNode* n) { return n ? to_string(n->val) + "," + plain(n->left) + "," + plain(n->right) : "#"; }
    TreeNode* des(const vector<string>& tok, size_t& i) {
        if (tok[i] == "#") { i++; return nullptr; }
        TreeNode* n = new TreeNode(stoi(tok[i++]));      // same order as written
        n->left = des(tok, i);
        n->right = des(tok, i);
        return n;
    }
    string serialize(TreeNode* root, TreeNode* show) {
        vector<string> out; ser(root, out, show);
        string s; for (size_t i = 0; i < out.size(); i++) s += (i ? "," : "") + out[i];
        return s;
    }
    TreeNode* deserialize(const string& s) {
        vector<string> tok; string cur; stringstream ss(s);
        while (getline(ss, cur, ',')) tok.push_back(cur);
        size_t i = 0; return des(tok, i);
    }
    string roundTrip(TreeNode* root) {
        FN("roundTrip");
        string s = serialize(root, root);
        TreeNode* back = deserialize(s);
        string again = plain(back);                      // re-serialize the rebuilt tree

        util::freeTree(back);
        return again == s ? s : "MISMATCH";
    }
};
