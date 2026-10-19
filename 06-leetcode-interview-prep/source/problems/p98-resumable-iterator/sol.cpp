// Resumable multi-file iterator - cursor (file, pos) normalized past exhausted files.  O(1) amortized.
class FileIter {
    vector<vector<int>> files; int f = 0, p = 0;
    void normalize() { while (f < (int)files.size() && p >= (int)files[f].size()) { f++; p = 0; } }
public:
    FileIter(const string& spec) {
        size_t start = 0;
        while (true) {                                      // split on '|', keep empty files
            size_t bar = spec.find('|', start);
            string part = spec.substr(start, bar == string::npos ? string::npos : bar - start);
            vector<int> v; stringstream ss(part); string t;
            while (getline(ss, t, ',')) if (!t.empty()) v.push_back(stoi(t));
            files.push_back(v);
            if (bar == string::npos) break;
            start = bar + 1;
        }
        normalize();
    }
    bool hasNext() const { return f < (int)files.size(); }
    string next() { if (!hasNext()) return "END"; int v = files[f][p++]; normalize(); return to_string(v); }
    string getState() const { return to_string(f) + "," + to_string(p); }
    void setState(const string& s) { f = stoi(s.substr(0, s.find(','))); p = stoi(s.substr(s.find(',') + 1)); normalize(); }
    int file() const { return f; }
    int pos() const { return p; }
};
class Solution {
public:
    vector<string> run(vector<string> ops, vector<string> args) {
        FN("run");
        vector<string> out; FileIter* it = nullptr;
        for (size_t q = 0; q < ops.size(); q++) {
            string op = ops[q], arg = args[q];
            if (op == "Iter") { it = new FileIter(arg); out.push_back("null"); }
            else if (op == "next") out.push_back(it->next());
            else if (op == "hasNext") out.push_back(it->hasNext() ? "true" : "false");
            else if (op == "getState") out.push_back(it->getState());
            else { it->setState(arg); out.push_back("null"); }
            int f = it->file(), p = it->pos();
            TR("op", op, "arg", arg, "f", f, "p", p, "out", out);
        }
        delete it;
        return out;
    }
};
