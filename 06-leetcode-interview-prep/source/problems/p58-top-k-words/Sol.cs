using System; using System.Collections.Generic;
// Top K frequent words - count, then a size-k min-heap with the tie-break reversed.  O(n log k).
public class Solution {
    public string[] TopKFrequent(string[] words, int k) {
        var count = new Dictionary<string, int>();
        foreach (var w in words) count[w] = count.GetValueOrDefault(w) + 1;
        var worstFirst = Comparer<string>.Create((a, b) => count[a] != count[b] ? count[a].CompareTo(count[b]) : string.CompareOrdinal(b, a));
        var heap = new PriorityQueue<string, string>(worstFirst);
        foreach (var w in count.Keys) { heap.Enqueue(w, w); if (heap.Count > k) heap.Dequeue(); }
        var output = new string[heap.Count];
        for (int i = output.Length - 1; i >= 0; i--) output[i] = heap.Dequeue();
        return output;
    }
}
