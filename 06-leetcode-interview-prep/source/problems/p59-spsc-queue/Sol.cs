using System.Threading;
// Lock-free SPSC ring queue.  Volatile.Write = release store, Volatile.Read = acquire load.
public class SpscQueue {
    public readonly int[] Buf; readonly int n;
    long head, tail;                               // consumer-owned / producer-owned
    public long Head => Volatile.Read(ref head);
    public long Tail => Volatile.Read(ref tail);
    public SpscQueue(int cap) { n = cap + 1; Buf = new int[n]; }
    public bool Push(int v) {                      // producer only
        long t = tail, next = (t + 1) % n;
        if (next == Volatile.Read(ref head)) return false;   // full
        Buf[t] = v;                                // write data first
        Volatile.Write(ref tail, next);            // then publish (release)
        return true;
    }
    public bool TryPop(out int v) {                // consumer only
        long h = head; v = 0;
        if (h == Volatile.Read(ref tail)) return false;      // empty (acquire)
        v = Buf[h];
        Volatile.Write(ref head, (h + 1) % n);
        return true;
    }
}
public class Solution {
    static bool Stress(int cap, int count) {
        var q = new SpscQueue(cap); bool ok = true;
        var prod = new Thread(() => { for (int i = 0; i < count; i++) while (!q.Push(i)) Thread.SpinWait(1); });
        var cons = new Thread(() => { for (int e = 0; e < count;) { if (!q.TryPop(out var v)) { Thread.SpinWait(1); continue; } if (v != e) ok = false; e++; } });
        prod.Start(); cons.Start(); prod.Join(); cons.Join();
        return ok && !q.TryPop(out _);
    }
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; SpscQueue q = null; int cap = 0;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "SPSC": cap = int.Parse(args[i]); q = new SpscQueue(cap); output[i] = "null"; break;
                case "push": output[i] = q.Push(int.Parse(args[i])) ? "true" : "false"; break;
                case "pop": output[i] = q.TryPop(out var v) ? v.ToString() : "empty"; break;
                default: output[i] = Stress(cap, int.Parse(args[i])) ? "ok" : "FAIL"; break;
            }
            T.R("op", ops[i], "buf", q.Buf, "head", q.Head, "tail", q.Tail, "out", output[i]);
        }
        return output;
    }
}
