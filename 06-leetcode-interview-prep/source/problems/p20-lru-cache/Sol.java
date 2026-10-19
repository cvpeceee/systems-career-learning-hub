import java.util.*;
// LRU cache - hash map + hand-written doubly linked list with sentinels.  O(1) get and put.
class LRUCache {
    private static class Node { int key, val; Node prev, next; Node(int k, int v) { key = k; val = v; } }
    private final int cap;
    private final Map<Integer, Node> where = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);   // sentinels: no null checks
    LRUCache(int capacity) { cap = capacity; head.next = tail; tail.prev = head; }
    private void unlink(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void pushFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }
    public int get(int key) {
        Node n = where.get(key);
        if (n == null) return -1;
        unlink(n); pushFront(n);                  // most recent
        return n.val;
    }
    public void put(int key, int value) {
        Node n = where.get(key);
        if (n != null) { n.val = value; unlink(n); pushFront(n); return; }   // update + refresh
        n = new Node(key, value); where.put(key, n); pushFront(n);
        if (where.size() > cap) { Node lru = tail.prev; unlink(lru); where.remove(lru.key); }   // evict
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; LRUCache c = null;
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("LRUCache")) { c = new LRUCache(Integer.parseInt(args[i])); out[i] = "null"; }
            else if (ops[i].equals("get")) out[i] = String.valueOf(c.get(Integer.parseInt(args[i])));
            else { String[] kv = args[i].split(","); c.put(Integer.parseInt(kv[0]), Integer.parseInt(kv[1])); out[i] = "null"; }
        }
        return out;
    }
}
