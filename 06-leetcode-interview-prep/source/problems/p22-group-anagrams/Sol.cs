using System; using System.Collections.Generic; using System.Linq;
// Group Anagrams - canonical key (sorted letters) -> bucket.  O(n * k log k).
public class Solution {
    public string[] GroupAnagrams(string[] strs) {
        var groups = new Dictionary<string, List<string>>();
        foreach (var s in strs) {
            var c = s.ToCharArray(); Array.Sort(c);               // canonical signature
            var key = new string(c);
            if (!groups.TryGetValue(key, out var list)) groups[key] = list = new List<string>();
            list.Add(s);
        }
        var output = groups.Values.Select(g => string.Join(",", g.OrderBy(x => x, StringComparer.Ordinal))).ToList();
        output.Sort(StringComparer.Ordinal);
        return output.ToArray();
    }
}
