// Linked List Cycle II - Floyd's tortoise & hare, then reset one pointer to head.  O(n), O(1).
public class Solution {
    public int DetectCycle(int[] vals, int pos) {
        int n = vals.Length; var nodes = new ListNode[n];
        for (int i = 0; i < n; i++) nodes[i] = new ListNode(vals[i]);
        for (int i = 0; i + 1 < n; i++) nodes[i].next = nodes[i + 1];
        if (pos >= 0) nodes[n - 1].next = nodes[pos];
        ListNode head = n > 0 ? nodes[0] : null, s = head, f = head;
        while (f != null && f.next != null) {
            s = s.next; f = f.next.next;
            if (s == f) {
                var p = head;
                while (p != s) { p = p.next; s = s.next; }
                return System.Array.IndexOf(nodes, p);
            }
        }
        return -1;
    }
}
