// Lock-free SPSC ring queue.  head is written only by the consumer, tail only by the producer.
// Publishing uses release stores; observing the other side uses acquire loads.  O(1) wait-free ops.
template <class T>
class SpscQueue {
    vector<T> buf;
    const size_t N;                                   // cap + 1 slots: one stays empty so full != empty
    alignas(64) atomic<size_t> head{0};               // next slot to read  (consumer-owned)
    alignas(64) atomic<size_t> tail{0};               // next slot to write (producer-owned); padded: no false sharing
public:
    explicit SpscQueue(size_t cap) : buf(cap + 1), N(cap + 1) {}
    bool push(const T& v) {                           // producer thread only
        size_t t = tail.load(memory_order_relaxed);   // my own index: no sync needed
        size_t next = (t + 1) % N;
        if (next == head.load(memory_order_acquire)) return false;   // full (see consumer's progress)
        buf[t] = v;                                   // 1) write the data
        tail.store(next, memory_order_release);       // 2) publish: data is visible before the index
        return true;
    }
    optional<T> pop() {                               // consumer thread only
        size_t h = head.load(memory_order_relaxed);
        if (h == tail.load(memory_order_acquire)) return nullopt;    // empty (acquire pairs with push's release)
        T v = buf[h];                                 // safe: producer's write happened-before
        head.store((h + 1) % N, memory_order_release);// hand the slot back to the producer
        return v;
    }
    vector<T> snapshot() const { return buf; }
    size_t h() const { return head.load(); }
    size_t t() const { return tail.load(); }
};
inline bool spscStress(size_t cap, long long n) {     // real threads: 1 producer, 1 consumer
    SpscQueue<long long> q(cap);
    bool ok = true;
    thread prod([&] { for (long long i = 0; i < n; i++) while (!q.push(i)) this_thread::yield(); });
    thread cons([&] {
        for (long long expect = 0; expect < n; ) {
            auto v = q.pop();
            if (!v) { this_thread::yield(); continue; }
            if (*v != expect) ok = false;             // FIFO + exactly-once check
            expect++;
        }
    });
    prod.join(); cons.join();
    return ok && !q.pop();
}
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; unique_ptr<SpscQueue<int>> q; size_t cap = 0;
        for (size_t i = 0; i < ops.size(); i++) {
            const string& op = ops[i];
            if (op == "SPSC") { cap = stoul(args[i]); q = make_unique<SpscQueue<int>>(cap); out.push_back("null"); }
            else if (op == "push") out.push_back(q->push(stoi(args[i])) ? "true" : "false");
            else if (op == "pop") { auto v = q->pop(); out.push_back(v ? to_string(*v) : "empty"); }
            else out.push_back(spscStress(cap, stoll(args[i])) ? "ok" : "FAIL");
            vector<int> buf = q->snapshot(); int head = q->h(), tail = q->t();
            TR("op", op, "buf", buf, "head", head, "tail", tail, "out", out);
        }
        return out;
    }
};
