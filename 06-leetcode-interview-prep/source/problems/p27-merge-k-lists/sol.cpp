// Merge k sorted lists - min-heap of current heads.  O(N log k) time, O(k) heap.
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*> lists) {
        FN("mergeKLists");
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };   // > makes it a MIN-heap
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (ListNode* h : lists) if (h) pq.push(h);   // only the front of each line
        ListNode dummy(0); ListNode* tail = &dummy;
        vector<int> heap, merged;
        while (!pq.empty()) {
            ListNode* n = pq.top(); pq.pop();            // smallest head overall
            tail->next = n; tail = n;                    // append (reuse the node, no copy)
            if (n->next) pq.push(n->next);               // next person in that line steps up
            heap.clear(); { auto c = pq; while (!c.empty()) { heap.push_back(c.top()->val); c.pop(); } }
            merged.push_back(n->val);
            TR("heap", heap, "picked", n->val, "merged", merged);
        }
        tail->next = nullptr;
        return dummy.next;
    }
};
