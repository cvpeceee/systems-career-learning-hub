// Linked List Cycle II - Floyd's tortoise & hare, then reset one pointer to head.  O(n), O(1).
class Solution {
public:
    int detectCycle(vector<int> vals, int pos) {
        FN("detectCycle");
        int n = vals.size();
        vector<ListNode*> nodes(n);                            // harness: build the (possibly cyclic) list
        for (int i = 0; i < n; i++) nodes[i] = new ListNode(vals[i]);
        for (int i = 0; i + 1 < n; i++) nodes[i]->next = nodes[i + 1];
        if (pos >= 0) nodes[n - 1]->next = nodes[pos];
        auto idx = [&](ListNode* p) { for (int i = 0; i < n; i++) if (nodes[i] == p) return i; return -1; };
        ListNode* head = n ? nodes[0] : nullptr;
        ListNode *s = head, *f = head; int ans = -1;
        while (f && f->next) {
            s = s->next; f = f->next->next;                    // 1 step vs 2 steps
            int slow = idx(s), fast = idx(f);
            TR("vals", vals, "slow", slow, "fast", fast);
            if (s == f) {                                      // they met inside the loop
                ListNode* p = head;
                while (p != s) { p = p->next; s = s->next; slow = idx(s); fast = idx(p); TR("vals", vals, "slow", slow, "fast", fast); }
                ans = idx(p); break;                           // loop entrance
            }
        }
        for (auto x : nodes) delete x;
        return ans;
    }
};
