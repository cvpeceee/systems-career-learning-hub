// Add Two Numbers - schoolbook addition along two lists with a carry.  O(max(m,n)).
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        FN("addTwoNumbers");
        ListNode dummy(0); ListNode* tail = &dummy; int carry = 0;
        while (l1 || l2 || carry) {
            int s = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0);
            carry = s / 10;
            tail->next = new ListNode(s % 10); tail = tail->next;   // write the last digit
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
            TR("l1", l1, "l2", l2, "sum", dummy.next, "carry", carry);
        }
        return dummy.next;
    }
};
