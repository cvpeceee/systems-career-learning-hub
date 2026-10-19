using System.Collections.Generic;
// LRU cache - Dictionary + LinkedList<(key,value)> from the BCL.  O(1) get and put.
public class LRUCache {
    private readonly int cap;
    private readonly LinkedList<(int key, int val)> order = new LinkedList<(int, int)>();   // First = most recent
    private readonly Dictionary<int, LinkedListNode<(int key, int val)>> where = new Dictionary<int, LinkedListNode<(int, int)>>();
    public LRUCache(int capacity) { cap = capacity; }
    public int Get(int key) {
        if (!where.TryGetValue(key, out var node)) return -1;
        order.Remove(node); order.AddFirst(node);              // O(1): we hold the node itself
        return node.Value.val;
    }
    public void Put(int key, int value) {
        if (where.TryGetValue(key, out var node)) {            // update + refresh
            order.Remove(node); node.Value = (key, value); order.AddFirst(node); return;
        }
        where[key] = order.AddFirst((key, value));
        if (order.Count > cap) { where.Remove(order.Last.Value.key); order.RemoveLast(); }   // evict LRU
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; LRUCache c = null;
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "LRUCache") { c = new LRUCache(int.Parse(args[i])); output[i] = "null"; }
            else if (ops[i] == "get") output[i] = c.Get(int.Parse(args[i])).ToString();
            else { var kv = args[i].Split(','); c.Put(int.Parse(kv[0]), int.Parse(kv[1])); output[i] = "null"; }
        }
        return output;
    }
}
