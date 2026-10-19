// My Calendar I - ordered map start -> end; only the two neighbors can overlap.  O(log n) per booking.
class MyCalendar {
    map<int, int> cal;
public:
    bool book(int s, int e) {
        auto next = cal.lower_bound(s);                       // first booking starting at or after s
        if (next != cal.end() && next->first < e) return false;               // it starts before we end
        if (next != cal.begin() && prev(next)->second > s) return false;      // previous one ends after we start
        cal[s] = e;
        return true;
    }
    vector<vector<int>> view() const { vector<vector<int>> v; for (auto& kv : cal) v.push_back({kv.first, kv.second}); return v; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; MyCalendar c;
        for (size_t i = 0; i < ops.size(); i++) {
            string arg = args[i];
            if (ops[i] == "MyCalendar") { out.push_back("null"); continue; }
            size_t k = arg.find(',');
            out.push_back(c.book(stoi(arg.substr(0, k)), stoi(arg.substr(k + 1))) ? "true" : "false");
            vector<vector<int>> booked = c.view();
            TR("arg", arg, "booked", booked, "out", out);
        }
        return out;
    }
};
