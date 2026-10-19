// Bounded blocking queue - mutex + two condition variables (classic monitor).
class BoundedBlockingQueue {
    deque<int> q; size_t cap;
    mutex m; condition_variable notFull, notEmpty;
public:
    explicit BoundedBlockingQueue(size_t c) : cap(c) {}
    void enqueue(int v) {
        unique_lock<mutex> lk(m);
        notFull.wait(lk, [&] { return q.size() < cap; });     // predicate wait = while loop: handles spurious wakeups
        q.push_back(v);
        lk.unlock();
        notEmpty.notify_one();                                // a consumer may proceed
    }
    int dequeue() {
        unique_lock<mutex> lk(m);
        notEmpty.wait(lk, [&] { return !q.empty(); });
        int v = q.front(); q.pop_front();
        lk.unlock();
        notFull.notify_one();                                 // a producer may proceed (backpressure released)
        return v;
    }
    int size() { lock_guard<mutex> lk(m); return q.size(); }
    deque<int> snapshot() { lock_guard<mutex> lk(m); return q; }
};
inline bool bbqStress(size_t cap, int P, int C, int n) {
    BoundedBlockingQueue q(cap);
    int total = P * n; vector<int> seen(total, 0); mutex sm;
    vector<thread> ts;
    for (int p = 0; p < P; p++) ts.emplace_back([&, p] { for (int i = 0; i < n; i++) q.enqueue(p * n + i); });
    for (int c = 0; c < C; c++) ts.emplace_back([&, c] {
        int mine = total / C + (c < total % C ? 1 : 0);       // consumers split the total
        for (int i = 0; i < mine; i++) { int v = q.dequeue(); lock_guard<mutex> lk(sm); seen[v]++; }
    });
    for (auto& t : ts) t.join();
    for (int s : seen) if (s != 1) return false;              // exactly once
    return q.size() == 0;
}
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; unique_ptr<BoundedBlockingQueue> b; size_t cap = 0;
        for (size_t i = 0; i < ops.size(); i++) {
            string op = ops[i], arg = args[i];
            if (op == "BBQ") { cap = stoul(arg); b = make_unique<BoundedBlockingQueue>(cap); out.push_back("null"); }
            else if (op == "enqueue") { b->enqueue(stoi(arg)); out.push_back("null"); }
            else if (op == "dequeue") out.push_back(to_string(b->dequeue()));
            else if (op == "size") out.push_back(to_string(b->size()));
            else { int P, C, n; sscanf(arg.c_str(), "%d,%d,%d", &P, &C, &n); out.push_back(bbqStress(cap, P, C, n) ? "ok" : "FAIL"); }
            deque<int> q = b->snapshot();
            TR("op", op, "arg", arg, "q", q, "out", out);
        }
        return out;
    }
};
