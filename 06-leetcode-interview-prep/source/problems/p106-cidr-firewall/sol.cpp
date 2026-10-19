// CIDR firewall - parse to 32-bit, compare masked prefixes, first match wins.  O(rules) per ip.
class Solution {
    static uint32_t parseIp(const string& s) {
        uint32_t v = 0; stringstream ss(s); string part;
        while (getline(ss, part, '.')) v = (v << 8) | (uint32_t)stoul(part);
        return v;
    }
    static uint32_t maskOf(int p) { return p == 0 ? 0u : 0xFFFFFFFFu << (32 - p); }   // avoid << 32
public:
    vector<string> check(vector<string> rules, vector<string> ips) {
        FN("check");
        vector<string> out;
        for (int i = 0; i < (int)ips.size(); i++) {
            uint32_t ip = parseIp(ips[i]); string decision = "DENY";            // default deny
            for (auto& r : rules) {
                size_t sp = r.find(' '), sl = r.find('/');
                uint32_t net = parseIp(r.substr(sp + 1, sl - sp - 1)), m = maskOf(stoi(r.substr(sl + 1)));
                if ((ip & m) == (net & m)) { decision = r.substr(0, sp); break; }   // first match wins
            }
            out.push_back(decision);
            TR("out", out, "i", i);
        }
        return out;
    }
};
