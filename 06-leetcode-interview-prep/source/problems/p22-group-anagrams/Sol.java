import java.util.*;
// Group Anagrams - canonical key (sorted letters) -> bucket.  O(n * k log k).
class Solution {
    public String[] groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] c = s.toCharArray();
            Arrays.sort(c);                                   // canonical signature
            groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(s);
        }
        List<String> out = new ArrayList<>();
        for (List<String> g : groups.values()) {
            Collections.sort(g);
            out.add(String.join(",", g));
        }
        Collections.sort(out);
        return out.toArray(new String[0]);
    }
}
