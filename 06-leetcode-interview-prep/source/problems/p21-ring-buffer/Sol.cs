// Circular queue (ring buffer) - fixed array + head index + count.  O(1) per op.
public class MyCircularQueue {
    private readonly int[] buf; private int head = 0, count = 0;
    public MyCircularQueue(int k) { buf = new int[k]; }
    public bool EnQueue(int x) {
        if (IsFull()) return false;
        buf[(head + count) % buf.Length] = x;    // write at tail (wraps)
        count++; return true;
    }
    public bool DeQueue() {
        if (IsEmpty()) return false;
        head = (head + 1) % buf.Length; count--; return true;   // move index, not data
    }
    public int Front() => IsEmpty() ? -1 : buf[head];
    public int Rear() => IsEmpty() ? -1 : buf[(head + count - 1) % buf.Length];
    public bool IsEmpty() => count == 0;
    public bool IsFull() => count == buf.Length;
}
public class Solution {
    public string[] Run(string[] ops, string[] args) {
        var output = new string[ops.Length]; MyCircularQueue q = null;
        string B(bool v) => v ? "true" : "false";
        for (int i = 0; i < ops.Length; i++) {
            switch (ops[i]) {
                case "MyCircularQueue": q = new MyCircularQueue(int.Parse(args[i])); output[i] = "null"; break;
                case "enQueue": output[i] = B(q.EnQueue(int.Parse(args[i]))); break;
                case "deQueue": output[i] = B(q.DeQueue()); break;
                case "Front": output[i] = q.Front().ToString(); break;
                case "Rear": output[i] = q.Rear().ToString(); break;
                case "isEmpty": output[i] = B(q.IsEmpty()); break;
                default: output[i] = B(q.IsFull()); break;
            }
        }
        return output;
    }
}
