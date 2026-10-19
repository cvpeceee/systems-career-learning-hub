import java.util.*;
// My Calendar I - TreeMap start -> end; check floor and ceiling neighbors.  O(log n).
class MyCalendar {
    TreeMap<Integer, Integer> cal = new TreeMap<>();
    boolean book(int s, int e) {
        Map.Entry<Integer, Integer> prev = cal.floorEntry(s), next = cal.ceilingEntry(s);
        if (next != null && next.getKey() < e) return false;
        if (prev != null && prev.getValue() > s) return false;
        cal.put(s, e); return true;
    }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; MyCalendar c = new MyCalendar();
        for (int i = 0; i < ops.length; i++) {
            if (ops[i].equals("MyCalendar")) { out[i] = "null"; continue; }
            String[] a = args[i].split(",");
            out[i] = String.valueOf(c.book(Integer.parseInt(a[0]), Integer.parseInt(a[1])));
        }
        return out;
    }
}
