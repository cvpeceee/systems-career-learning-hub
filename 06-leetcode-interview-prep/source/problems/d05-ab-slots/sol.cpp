// A/B OTA slots - tiny state machine; the running slot is never written.
class ABSlots {
    int act = 0;                 // 0 = A, 1 = B (currently running slot)
    vector<string> ver;          // firmware version in each slot
    bool pend = false;           // inactive slot holds an untested update
    int tries = 0;               // boot attempts left for the pending image
    static char N(int s) { return s == 0 ? 'A' : 'B'; }
    string slot(int s) const { return string(1, N(s)) + ":" + ver[s]; }
public:
    explicit ABSlots(const string& v) : ver{v, "0"} {}
    string install(const string& v) {
        FN("install");
        if (pend) return "busy";                 // one update in flight at a time
        ver[1 - act] = v;                        // write ONLY the inactive slot
        pend = true; tries = 3;
        TR("ver", ver, "act", act, "pend", pend, "tries", tries);
        return "ok";
    }
    string boot(const string& result) {
        FN("boot");
        if (!pend) return "booted:" + slot(act);
        if (result == "good") {                  // health check passed: commit
            act = 1 - act; pend = false;
            TR("ver", ver, "act", act, "pend", pend, "tries", tries, "_note", "commit");
            return "switched:" + slot(act);
        }
        --tries;                                 // bad boot of the new image
        if (tries == 0) {
            pend = false;
            TR("ver", ver, "act", act, "pend", pend, "tries", tries, "_note", "rollback");
            return "rollback:" + slot(act);      // old slot was never touched
        }
        TR("ver", ver, "act", act, "pend", pend, "tries", tries);
        return "retry:" + to_string(tries);
    }
    string status() const {
        string s;
        for (int i = 0; i < 2; ++i) {
            if (i) s += ",";
            s += slot(i);
            if (i == act) s += "*";
            if (pend && i != act) s += "?";
        }
        return s;
    }
};
class Solution {
public:
    vector<string> run(vector<string>& ops, vector<string>& args) {
        vector<string> out; unique_ptr<ABSlots> m;
        for (size_t i = 0; i < ops.size(); ++i) {
            if (ops[i] == "ABSlots") { m = make_unique<ABSlots>(args[i]); out.push_back("null"); }
            else if (ops[i] == "install") out.push_back(m->install(args[i]));
            else if (ops[i] == "boot") out.push_back(m->boot(args[i]));
            else out.push_back(m->status());
        }
        return out;
    }
};
