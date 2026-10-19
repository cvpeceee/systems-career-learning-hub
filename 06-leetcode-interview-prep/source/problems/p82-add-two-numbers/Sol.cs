using System;
// Add Two Numbers - schoolbook addition along two lists with a carry.  O(max(m,n)).
public class Solution {
    public ListNode AddTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0), tail = dummy; int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int s = carry + (l1?.val ?? 0) + (l2?.val ?? 0);
            carry = s / 10;
            tail.next = new ListNode(s % 10); tail = tail.next;
            l1 = l1?.next; l2 = l2?.next;
            T.R("l1", l1, "l2", l2, "sum", dummy.next, "carry", carry);
        }
        return dummy.next;
    }
}
