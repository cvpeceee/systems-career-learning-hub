using System.Collections.Generic;
// Merge k sorted lists - min-heap of current heads.  O(N log k) time, O(k) heap.
public class Solution {
    public ListNode MergeKLists(ListNode[] lists) {
        var pq = new PriorityQueue<ListNode, int>();       // .NET 6+ min-heap keyed by priority
        foreach (var h in lists) if (h != null) pq.Enqueue(h, h.val);
        var dummy = new ListNode(0); var tail = dummy;
        var merged = new List<int>();
        while (pq.Count > 0) {
            var n = pq.Dequeue();                          // smallest head
            tail.next = n; tail = n;
            if (n.next != null) pq.Enqueue(n.next, n.next.val);
            merged.Add(n.val);
            T.R("heap", T.Vals(pq), "picked", n.val, "merged", merged);
        }
        return dummy.next;
    }
}
