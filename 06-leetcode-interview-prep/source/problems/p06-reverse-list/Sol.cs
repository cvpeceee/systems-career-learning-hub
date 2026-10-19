// Reverse a singly linked list in place - three pointers.  O(n) time, O(1) space.
public class Solution {
    public ListNode ReverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            var nxt = cur.next;        // save rest
            cur.next = prev;           // flip
            prev = cur;                // grow reversed part
            cur = nxt;                 // advance
            T.R("prev", prev, "cur", cur);
        }
        return prev;
    }
}
