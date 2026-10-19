// Palindrome Linked List - middle, reverse second half, compare, restore.  O(n) time, O(1) space.
class Solution {
    ListNode* reverse(ListNode* h) { ListNode* p = nullptr; while (h) { ListNode* n = h->next; h->next = p; p = h; h = n; } return p; }
public:
    bool isPalindrome(ListNode* head) {
        FN("isPalindrome");
        ListNode *slow = head, *fast = head;
        while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }   // slow = end of 1st half
        ListNode* second = reverse(slow->next);
        bool ok = true;
        for (ListNode *a = head, *b = second; b; a = a->next, b = b->next) {
            TR("head", head, "second", second, "a", a->val, "b", b->val);
            if (a->val != b->val) { ok = false; break; }
        }
        slow->next = reverse(second);                       // put the list back
        return ok;
    }
};
