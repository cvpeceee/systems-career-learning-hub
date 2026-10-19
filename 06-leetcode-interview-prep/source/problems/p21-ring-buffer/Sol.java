// Circular queue (ring buffer) - fixed array + head index + count.  O(1) per op.
class MyCircularQueue {
    private final int[] buf; private int head = 0, count = 0;
    MyCircularQueue(int k) { buf = new int[k]; }
    public boolean enQueue(int x) {
        if (isFull()) return false;
        buf[(head + count) % buf.length] = x;    // write at tail (wraps)
        count++; return true;
    }
    public boolean deQueue() {
        if (isEmpty()) return false;
        head = (head + 1) % buf.length; count--; return true;   // move index, not data
    }
    public int Front() { return isEmpty() ? -1 : buf[head]; }
    public int Rear() { return isEmpty() ? -1 : buf[(head + count - 1) % buf.length]; }
    public boolean isEmpty() { return count == 0; }
    public boolean isFull() { return count == buf.length; }
}
class Solution {
    public String[] run(String[] ops, String[] args) {
        String[] out = new String[ops.length]; MyCircularQueue q = null;
        for (int i = 0; i < ops.length; i++) {
            switch (ops[i]) {
                case "MyCircularQueue": q = new MyCircularQueue(Integer.parseInt(args[i])); out[i] = "null"; break;
                case "enQueue": out[i] = String.valueOf(q.enQueue(Integer.parseInt(args[i]))); break;
                case "deQueue": out[i] = String.valueOf(q.deQueue()); break;
                case "Front": out[i] = String.valueOf(q.Front()); break;
                case "Rear": out[i] = String.valueOf(q.Rear()); break;
                case "isEmpty": out[i] = String.valueOf(q.isEmpty()); break;
                default: out[i] = String.valueOf(q.isFull());
            }
        }
        return out;
    }
}
