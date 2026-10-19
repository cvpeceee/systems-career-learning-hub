// Reverse a singly linked list in place - three pointers.  O(n) time, O(1) space.
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        FN("reverseList");
        ListNode* prev = nullptr;          // already-reversed part
        ListNode* cur = head;              // part still to reverse
        TR("prev", prev, "cur", cur);
        while (cur) {
            ListNode* nxt = cur->next;     // 1) save the rest of the line
            cur->next = prev;              // 2) turn around: point backwards
            prev = cur;                    // 3) reversed part grows by one
            cur = nxt;                     // 4) step forward
            TR("prev", prev, "cur", cur);
        }
        return prev;                       // new head
    }
};
