using System.Collections.Generic; using System.Text;
// Serialize / deserialize - pre-order with '#' for null.  O(n) both ways.
public class Solution {
    void Ser(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.Append("#,"); return; }
        sb.Append(n.val).Append(',');
        Ser(n.left, sb); Ser(n.right, sb);
    }
    string Serialize(TreeNode root) { var sb = new StringBuilder(); Ser(root, sb); sb.Length--; return sb.ToString(); }
    TreeNode Des(Queue<string> q) {
        var t = q.Dequeue();
        if (t == "#") return null;
        var n = new TreeNode(int.Parse(t));
        n.left = Des(q); n.right = Des(q);
        return n;
    }
    TreeNode Deserialize(string s) => Des(new Queue<string>(s.Split(',')));
    public string RoundTrip(TreeNode root) {
        var s = Serialize(root);
        return Serialize(Deserialize(s)) == s ? s : "MISMATCH";
    }
}
