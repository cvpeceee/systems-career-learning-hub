using System;
// Palindrome Linked List - middle, reverse second half, compare, restore.  O(n) time, O(1) space.
public class Solution {
    ListNode Reverse(ListNode h) { ListNode p = null; while (h != null) { var n = h.next; h.next = p; p = h; h = n; } return p; }
    public bool IsPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
        var second = Reverse(slow.next);
        bool ok = true;
        for (ListNode a = head, b = second; b != null; a = a.next, b = b.next) {
            T.R("head", head, "second", second, "a", a.val, "b", b.val);
            if (a.val != b.val) { ok = false; break; }
        }
        slow.next = Reverse(second);
        return ok;
    }
}
