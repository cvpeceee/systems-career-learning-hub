import java.util.*;
// Decode String - stack of (saved prefix, repeat count).  O(output).
class Solution {
    public String decodeString(String s) {
        Deque<StringBuilder> strs = new ArrayDeque<>(); Deque<Integer> counts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder(); int k = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { strs.push(cur); counts.push(k); cur = new StringBuilder(); k = 0; }
            else if (c == ']') { StringBuilder prev = strs.pop(); prev.append(cur.toString().repeat(counts.pop())); cur = prev; }
            else cur.append(c);
            T.r("s", s, "i", i, "cur", cur.toString(), "counts", T.rev(counts));
        }
        return cur.toString();
    }
}
