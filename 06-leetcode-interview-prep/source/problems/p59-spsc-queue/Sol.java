import java.util.concurrent.atomic.AtomicLong;
// Lock-free SPSC ring queue.  AtomicLong get()/set() have volatile (acquire/release) semantics.
class SpscQueue {
    final int[] buf; final int n;
    final AtomicLong head = new AtomicLong(), tail = new AtomicLong();   // consumer-owned / producer-owned
    SpscQueue(int cap) { n = cap + 1; buf = new int[n]; }
    boolean push(int v) {                         // producer only
        long t = tail.get(); long next = (t + 1) % n;
        if (next == head.get()) return false;     // full
        buf[(int) t] = v;                         // write data first
        tail.set(next);                           // then publish (volatile store = release)
        return true;
    }
    Integer pop() {                               // consumer only
        long h = head.get();
        if (h == tail.get()) return null;         // empty (volatile load = acquire)
        int v = buf[(int) h];
        head.set((h + 1) % n);
        return v;
    }
}
class Solution {
    static boolean stress(int cap, int count) throws InterruptedException {
        SpscQueue q = new SpscQueue(cap); boolean[] ok = {true};
        Thread prod = new Thread(() -> { for (int i = 0; i < count; i++) while (!q.push(i)) Thread.onSpinWait(); });
        Thread cons = new Thread(() -> { for (int e = 0; e < count; ) { Integer v = q.pop(); if (v == null) { Thread.onSpinWait(); continue; } if (v != e) ok[0] = false; e++; } });
        prod.start(); cons.start(); prod.join(); cons.join();
        return ok[0] && q.pop() == null;
    }
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; SpscQueue q = null; int cap = 0;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "SPSC": cap = Integer.parseInt(args[i]); q = new SpscQueue(cap); out[i] = "null"; break;
                case "push": out[i] = String.valueOf(q.push(Integer.parseInt(args[i]))); break;
                case "pop": { Integer v = q.pop(); out[i] = v == null ? "empty" : String.valueOf(v); break; }
                default: try { out[i] = stress(cap, Integer.parseInt(args[i])) ? "ok" : "FAIL"; } catch (InterruptedException e) { out[i] = "FAIL"; }
            }
            T.r("op", ops[i], "buf", q.buf, "head", q.head.get(), "tail", q.tail.get(), "out", out[i]);
        }
        return out;
    }
}
