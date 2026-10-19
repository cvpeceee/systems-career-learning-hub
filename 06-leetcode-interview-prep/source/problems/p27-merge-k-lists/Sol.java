import java.util.*;
// Merge k sorted lists - min-heap of current heads.  O(N log k) time, O(k) heap.
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode h : lists) if (h != null) pq.add(h);
        ListNode dummy = new ListNode(0), tail = dummy;
        List<Integer> merged = new ArrayList<>();
        while (!pq.isEmpty()) {
            ListNode n = pq.poll();                     // smallest head
            tail.next = n; tail = n;
            if (n.next != null) pq.add(n.next);         // refill from the same list
            merged.add(n.val);
            T.r("heap", T.vals(pq), "picked", n.val, "merged", merged);
        }
        return dummy.next;
    }
}
