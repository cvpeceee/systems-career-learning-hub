// LRU cache - hash map + doubly linked list.  O(1) get and put.
class LRUCache {
    int cap;
    list<pair<int,int>> order;                                   // front = most recent; (key, value)
    unordered_map<int, list<pair<int,int>>::iterator> where;     // key -> node in 'order'
public:
    explicit LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        FN("get");
        auto it = where.find(key);
        if (it == where.end()) { TR("key", key, "order", order, "_note", "miss"); return -1; }
        order.splice(order.begin(), order, it->second);          // move node to front, O(1), iterator stays valid
        TR("key", key, "order", order);
        return it->second->second;
    }
    void put(int key, int value) {
        FN("put");
        auto it = where.find(key);
        if (it != where.end()) {                                 // update existing key + refresh recency
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            TR("key", key, "value", value, "order", order);
            return;
        }
        order.emplace_front(key, value);
        where[key] = order.begin();
        if ((int)order.size() > cap) {                           // too many: evict least recent (back)
            where.erase(order.back().first);
            order.pop_back();
        }
        TR("key", key, "value", value, "order", order);
    }
    const list<pair<int,int>>& view() const { return order; }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        FN("run");
        vector<string> out;
        unique_ptr<LRUCache> c;
        for (size_t i = 0; i < ops.size(); ++i) {
            const string& op = ops[i]; const string& arg = args[i];
            if (op == "LRUCache") { c = make_unique<LRUCache>(stoi(arg)); out.push_back("null"); }
            else if (op == "get") out.push_back(to_string(c->get(stoi(arg))));
            else { size_t k = arg.find(','); c->put(stoi(arg.substr(0, k)), stoi(arg.substr(k + 1))); out.push_back("null"); }
            TR("op", op, "arg", arg, "order", c->view(), "out", out);
        }
        return out;
    }
};
