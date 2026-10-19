using System; using System.Collections.Generic; using System.Linq;
// Resumable multi-file iterator - cursor (file, pos) normalized past exhausted files.  O(1) amortized.
public class FileIter {
    List<int[]> files = new(); public int f = 0, p = 0;
    public FileIter(string spec) {
        foreach (var part in spec.Split('|'))
            files.Add(part.Length == 0 ? new int[0] : part.Split(',').Select(int.Parse).ToArray());
        Normalize();
    }
    void Normalize() { while (f < files.Count && p >= files[f].Length) { f++; p = 0; } }
    public bool HasNext() => f < files.Count;
    public string Next() { if (!HasNext()) return "END"; int v = files[f][p++]; Normalize(); return v.ToString(); }
    public string GetState() => f + "," + p;
    public void SetState(string s) { var a = s.Split(','); f = int.Parse(a[0]); p = int.Parse(a[1]); Normalize(); }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; FileIter it = null;
        for (int q = 0; q < ops.Length; q++) {
            switch (ops[q]) {
                case "Iter": it = new FileIter(args[q]); output[q] = "null"; break;
                case "next": output[q] = it.Next(); break;
                case "hasNext": output[q] = it.HasNext() ? "true" : "false"; break;
                case "getState": output[q] = it.GetState(); break;
                default: it.SetState(args[q]); output[q] = "null"; break;
            }
            T.R("op", ops[q], "arg", args[q], "f", it.f, "p", it.p);
        }
        return output;
    }
}
