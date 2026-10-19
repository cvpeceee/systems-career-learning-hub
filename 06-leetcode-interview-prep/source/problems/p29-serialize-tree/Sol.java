import java.util.*;
// Serialize / deserialize - pre-order with '#' for null.  O(n) both ways.
class Solution {
    void ser(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.append("#,"); return; }
        sb.append(n.val).append(',');
        ser(n.left, sb); ser(n.right, sb);
    }
    String serialize(TreeNode root) { StringBuilder sb = new StringBuilder(); ser(root, sb); sb.setLength(sb.length() - 1); return sb.toString(); }
    TreeNode des(Iterator<String> it) {
        String t = it.next();
        if (t.equals("#")) return null;
        TreeNode n = new TreeNode(Integer.parseInt(t));
        n.left = des(it); n.right = des(it);
        return n;
    }
    TreeNode deserialize(String s) { return des(Arrays.asList(s.split(",")).iterator()); }
    public String roundTrip(TreeNode root) {
        String s = serialize(root);
        return serialize(deserialize(s)).equals(s) ? s : "MISMATCH";
    }
}
