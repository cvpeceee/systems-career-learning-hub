// Circular queue (ring buffer) - fixed array + head index + count.  O(1) per op.
class MyCircularQueue {
    vector<int> buf;      // the conveyor belt
    int head = 0;         // index of the oldest element
    int count = 0;        // how many plates are on the belt (disambiguates full vs empty)
public:
    explicit MyCircularQueue(int k) : buf(k, 0) {}
    bool enQueue(int x) {
        FN("enQueue");
        if (isFull()) { TR("buf", buf, "head", head, "count", count, "x", x, "_note", "full"); return false; }
        buf[(head + count) % buf.size()] = x;     // tail position wraps with modulo
        ++count;
        TR("buf", buf, "head", head, "count", count, "x", x);
        return true;
    }
    bool deQueue() {
        FN("deQueue");
        if (isEmpty()) return false;
        head = (head + 1) % buf.size();           // advance consumer; no data is moved
        --count;
        TR("buf", buf, "head", head, "count", count);
        return true;
    }
    int Front() const { return isEmpty() ? -1 : buf[head]; }
    int Rear() const { return isEmpty() ? -1 : buf[(head + count - 1) % buf.size()]; }
    bool isEmpty() const { return count == 0; }
    bool isFull() const { return count == (int)buf.size(); }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        FN("run");
        vector<string> out;
        unique_ptr<MyCircularQueue> q;
        auto b = [](bool v) { return string(v ? "true" : "false"); };
        for (size_t i = 0; i < ops.size(); ++i) {
            const string& op = ops[i];
            if (op == "MyCircularQueue") { q = make_unique<MyCircularQueue>(stoi(args[i])); out.push_back("null"); }
            else if (op == "enQueue") out.push_back(b(q->enQueue(stoi(args[i]))));
            else if (op == "deQueue") out.push_back(b(q->deQueue()));
            else if (op == "Front") out.push_back(to_string(q->Front()));
            else if (op == "Rear") out.push_back(to_string(q->Rear()));
            else if (op == "isEmpty") out.push_back(b(q->isEmpty()));
            else out.push_back(b(q->isFull()));
            TR("op", op, "arg", args[i], "out", out);
        }
        return out;
    }
};
