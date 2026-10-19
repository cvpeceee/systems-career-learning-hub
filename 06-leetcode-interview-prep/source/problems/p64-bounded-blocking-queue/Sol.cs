using System.Collections.Generic; using System.Threading;
// Bounded blocking queue - Monitor (lock + Wait/PulseAll).  A .NET monitor has one wait set,
// so we PulseAll and every waiter re-checks its condition in a while loop.
public class BoundedBlockingQueue {
    readonly Queue<int> q = new(); readonly int cap; readonly object gate = new();
    public BoundedBlockingQueue(int cap) { this.cap = cap; }
    public void Enqueue(int v) {
        lock (gate) { while (q.Count == cap) Monitor.Wait(gate); q.Enqueue(v); Monitor.PulseAll(gate); }
    }
    public int Dequeue() {
        lock (gate) { while (q.Count == 0) Monitor.Wait(gate); int v = q.Dequeue(); Monitor.PulseAll(gate); return v; }
    }
    public int Size() { lock (gate) return q.Count; }
}
public class Solution {
    static bool Stress(int cap, int P, int C, int n) {
        var q = new BoundedBlockingQueue(cap); int total = P * n; var seen = new int[total]; var ts = new List<Thread>();
        for (int p = 0; p < P; p++) { int b = p * n; ts.Add(new Thread(() => { for (int i = 0; i < n; i++) q.Enqueue(b + i); })); }
        for (int c = 0; c < C; c++) { int mine = total / C + (c < total % C ? 1 : 0);
            ts.Add(new Thread(() => { for (int i = 0; i < mine; i++) { int v = q.Dequeue(); Interlocked.Increment(ref seen[v]); } })); }
        foreach (var t in ts) t.Start();
        foreach (var t in ts) t.Join();
        foreach (var s in seen) if (s != 1) return false;
        return q.Size() == 0;
    }
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; BoundedBlockingQueue b = null; int cap = 0;
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "BBQ": cap = int.Parse(args[i]); b = new BoundedBlockingQueue(cap); output[i] = "null"; break;
                case "enqueue": b.Enqueue(int.Parse(args[i])); output[i] = "null"; break;
                case "dequeue": output[i] = b.Dequeue().ToString(); break;
                case "size": output[i] = b.Size().ToString(); break;
                default: { var a = args[i].Split(','); output[i] = Stress(cap, int.Parse(a[0]), int.Parse(a[1]), int.Parse(a[2])) ? "ok" : "FAIL"; break; }
            }
        }
        return output;
    }
}
