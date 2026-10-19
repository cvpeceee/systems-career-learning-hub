// Reverse a singly linked list in place - three pointers.  O(n) time, O(1) space.
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode nxt = cur.next;   // save rest
            cur.next = prev;           // flip
            prev = cur;                // grow reversed part
            cur = nxt;                 // advance
        }
        return prev;
    }
}
