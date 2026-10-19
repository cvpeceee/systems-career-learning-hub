using System; using System.Collections.Generic;
// Hashed timer wheel - bucket = fireTime % S; each tick inspects one bucket.  O(1) add/cancel.
public class TimerWheel {
    readonly int S; public long Now;
    public readonly SortedSet<string>[] Slot;
    readonly Dictionary<string, long> fireAt = new();
    public TimerWheel(int s) { S = s; Slot = new SortedSet<string>[s]; for (int i = 0; i < s; i++) Slot[i] = new SortedSet<string>(StringComparer.Ordinal); }
    public void Add(string id, long delay) { long t = Now + delay; fireAt[id] = t; Slot[t % S].Add(id); }
    public bool Cancel(string id) {
        if (!fireAt.Remove(id, out var t)) return false;
        Slot[t % S].Remove(id); return true;
    }
    public string Tick() {
        Now++;
        var b = Slot[Now % S]; var fired = new List<string>();
        foreach (var id in b) if (fireAt[id] == Now) fired.Add(id);
        foreach (var id in fired) { b.Remove(id); fireAt.Remove(id); }
        return string.Join(",", fired);
    }
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; TimerWheel w = null;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "Wheel": w = new TimerWheel(int.Parse(args[i])); output[i] = "null"; break;
                case "add": { var a = args[i].Split(','); w.Add(a[0], long.Parse(a[1])); output[i] = "null"; break; }
                case "cancel": output[i] = w.Cancel(args[i]) ? "true" : "false"; break;
                default: output[i] = w.Tick(); break;
            }
            T.R("op", ops[i], "arg", args[i], "now", w.Now, "wheel", w.Slot, "out", output[i]);
        }
        return output;
    }
}
