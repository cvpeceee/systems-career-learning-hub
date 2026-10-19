// Palindrome Linked List - middle, reverse second half, compare, restore.  O(n) time, O(1) space.
class Solution {
    ListNode reverse(ListNode h) { ListNode p = null; while (h != null) { ListNode n = h.next; h.next = p; p = h; h = n; } return p; }
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = reverse(slow.next);
        boolean ok = true;
        for (ListNode a = head, b = second; b != null; a = a.next, b = b.next) {
            T.r("head", head, "second", second, "a", a.val, "b", b.val);
            if (a.val != b.val) { ok = false; break; }
        }
        slow.next = reverse(second);
        return ok;
    }
}
