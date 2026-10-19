import java.util.*;
import java.util.concurrent.locks.*;
// Bounded blocking queue - ReentrantLock + two Conditions (classic monitor).
class BoundedBlockingQueue {
    final ArrayDeque<Integer> q = new ArrayDeque<>(); final int cap;
    final ReentrantLock lock = new ReentrantLock();
    final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();
    BoundedBlockingQueue(int cap) { this.cap = cap; }
    void enqueue(int v) throws InterruptedException {
        lock.lock();
        try { while (q.size() == cap) notFull.await(); q.addLast(v); notEmpty.signal(); }
        finally { lock.unlock(); }
    }
    int dequeue() throws InterruptedException {
        lock.lock();
        try { while (q.isEmpty()) notEmpty.await(); int v = q.pollFirst(); notFull.signal(); return v; }
        finally { lock.unlock(); }
    }
    int size() { lock.lock(); try { return q.size(); } finally { lock.unlock(); } }
}
class Solution {
    static boolean stress(int cap, int P, int C, int n) throws InterruptedException {
        BoundedBlockingQueue q = new BoundedBlockingQueue(cap);
        int total = P * n; int[] seen = new int[total]; List<Thread> ts = new ArrayList<>();
        for (int p = 0; p < P; p++) { final int base = p * n;
            ts.add(new Thread(() -> { try { for (int i = 0; i < n; i++) q.enqueue(base + i); } catch (InterruptedException e) {} })); }
        for (int c = 0; c < C; c++) { final int mine = total / C + (c < total % C ? 1 : 0);
            ts.add(new Thread(() -> { try { for (int i = 0; i < mine; i++) { int v = q.dequeue(); synchronized (seen) { seen[v]++; } } } catch (InterruptedException e) {} })); }
        for (Thread t : ts) t.start();
        for (Thread t : ts) t.join();
        for (int s : seen) if (s != 1) return false;
        return q.size() == 0;
    }
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; BoundedBlockingQueue b = null; int cap = 0;
        try {
            for (int i = 0; i < ops.length; i++) {
                switch (ops[i]) {
                    case "BBQ": cap = Integer.parseInt(args[i]); b = new BoundedBlockingQueue(cap); out[i] = "null"; break;
                    case "enqueue": b.enqueue(Integer.parseInt(args[i])); out[i] = "null"; break;
                    case "dequeue": out[i] = String.valueOf(b.dequeue()); break;
                    case "size": out[i] = String.valueOf(b.size()); break;
                    default: { String[] a = args[i].split(","); out[i] = stress(cap, Integer.parseInt(a[0]), Integer.parseInt(a[1]), Integer.parseInt(a[2])) ? "ok" : "FAIL"; }
                }
            }
        } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        return out;
    }
}
