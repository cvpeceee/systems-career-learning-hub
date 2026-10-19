using System.Collections.Generic;
// LFU cache - key -> node in a per-frequency LinkedList; minFreq.  O(1) ops.
public class LFUCache {
    int cap, minFreq;
    readonly Dictionary<int, LinkedListNode<(int key, int val, int freq)>> keys = new();
    readonly Dictionary<int, LinkedList<(int key, int val, int freq)>> buckets = new();   // First = most recent
    public LFUCache(int capacity) { cap = capacity; }
    LinkedListNode<(int key, int val, int freq)> Touch(LinkedListNode<(int key, int val, int freq)> node, int newVal) {
        var (k, _, f) = node.Value;
        buckets[f].Remove(node);
        if (buckets[f].Count == 0) { buckets.Remove(f); if (minFreq == f) minFreq++; }
        if (!buckets.TryGetValue(f + 1, out var list)) buckets[f + 1] = list = new LinkedList<(int, int, int)>();
        var nn = list.AddFirst((k, newVal, f + 1)); keys[k] = nn; return nn;
    }
    public int Get(int key) => keys.TryGetValue(key, out var n) ? Touch(n, n.Value.val).Value.val : -1;
    public void Put(int key, int value) {
        if (cap == 0) return;
        if (keys.TryGetValue(key, out var n)) { Touch(n, value); return; }
        if (keys.Count == cap) {
            var lst = buckets[minFreq]; keys.Remove(lst.Last.Value.key); lst.RemoveLast();   // LRU of lowest freq
            if (lst.Count == 0) buckets.Remove(minFreq);
        }
        minFreq = 1;
        if (!buckets.TryGetValue(1, out var one)) buckets[1] = one = new LinkedList<(int, int, int)>();
        keys[key] = one.AddFirst((key, value, 1));
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; LFUCache c = null;
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "LFUCache") { c = new LFUCache(int.Parse(args[i])); output[i] = "null"; }
            else if (ops[i] == "get") output[i] = c.Get(int.Parse(args[i])).ToString();
            else { var kv = args[i].Split(','); c.Put(int.Parse(kv[0]), int.Parse(kv[1])); output[i] = "null"; }
        }
        return output;
    }
}
