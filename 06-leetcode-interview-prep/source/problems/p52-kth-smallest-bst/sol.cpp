// Kth smallest in BST - iterative in-order with an explicit stack; stop at the k-th visit.  O(h + k).
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        FN("kthSmallest");
        vector<int> st; stack<TreeNode*> s;            // st mirrors s (values) for the visualizer
        TreeNode* cur = root;
        while (cur || !s.empty()) {
            while (cur) { s.push(cur); st.push_back(cur->val); cur = cur->left; }   // go left as far as possible
            cur = s.top(); s.pop(); st.pop_back();
            int val = cur->val;
            k--;                                       // visiting in sorted order
            TR("root", root, "val", val, "k", k, "st", st);
            if (k == 0) return val;
            cur = cur->right;
        }
        return -1;
    }
};
