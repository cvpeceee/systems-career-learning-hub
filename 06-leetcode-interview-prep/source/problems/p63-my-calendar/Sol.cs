using System.Collections.Generic;
// My Calendar I - sorted list with binary search for the neighbors.  O(log n) search (+ O(n) insert shift).
public class MyCalendar {
    readonly List<(int s, int e)> cal = new();
    public bool Book(int s, int e) {
        int lo = 0, hi = cal.Count;                       // lower_bound on start
        while (lo < hi) { int m = (lo + hi) / 2; if (cal[m].s < s) lo = m + 1; else hi = m; }
        if (lo < cal.Count && cal[lo].s < e) return false;
        if (lo > 0 && cal[lo - 1].e > s) return false;
        cal.Insert(lo, (s, e)); return true;
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; var c = new MyCalendar();
        for (int i = 0; i < ops.Length; i++) {
            if (ops[i] == "MyCalendar") { output[i] = "null"; continue; }
            var a = args[i].Split(',');
            output[i] = c.Book(int.Parse(a[0]), int.Parse(a[1])) ? "true" : "false";
        }
        return output;
    }
}
