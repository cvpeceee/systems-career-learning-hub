// Validate BST - recursion passing down the allowed (lo, hi) range.  O(n) time, O(h) stack.
class Solution {
    bool dfs(TreeNode* node, long long lo, long long hi) {
        FN("dfs");
        if (!node) return true;                          // empty subtree is valid
        int val = node->val;
        TR("val", val, "lo", lo, "hi", hi);
        if (val <= lo || val >= hi) {                     // outside the range ancestors allow
            TR("val", val, "lo", lo, "hi", hi, "_note", "out of range -> false");
            return false;
        }
        bool okLeft = dfs(node->left, lo, val);           // left: upper limit becomes val
        TR("val", val, "lo", lo, "hi", hi, "okLeft", okLeft);
        if (!okLeft) return false;                        // short-circuit
        bool okRight = dfs(node->right, val, hi);         // right: lower limit becomes val
        TR("val", val, "lo", lo, "hi", hi, "okLeft", okLeft, "okRight", okRight);
        return okRight;
    }
public:
    bool isValidBST(TreeNode* root) {
        FN("isValidBST");
        TR("root", root);
        bool ans = dfs(root, LLONG_MIN, LLONG_MAX);       // 64-bit bounds: INT_MAX values are legal
        TR("root", root, "ans", ans);
        return ans;
    }
};
