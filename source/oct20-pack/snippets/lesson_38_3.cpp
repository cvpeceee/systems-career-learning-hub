#include <cstdint>
#include <map>
#include <string>
#include <vector>

// Process identity must survive PID reuse: key by (pid, start time).
struct ProcKey { int pid; uint64_t start; bool operator<(const ProcKey &o) const { return pid != o.pid ? pid < o.pid : start < o.start; } };
struct Proc { std::string image; ProcKey parent; bool has_parent; };

struct Tree {
  std::map<ProcKey, Proc> procs;
  void exec(ProcKey k, std::string image, ProcKey parent, bool has_parent) { procs[k] = {std::move(image), parent, has_parent}; }
  // Ancestry from the process up, bounded so a corrupt loop can't hang the sensor.
  std::vector<std::string> ancestry(ProcKey k, int max_depth = 16) const {
    std::vector<std::string> out;
    for (int d = 0; d < max_depth; d++) {
      auto it = procs.find(k);
      if (it == procs.end()) break;
      out.push_back(it->second.image);
      if (!it->second.has_parent) break;
      k = it->second.parent;
    }
    return out;
  }
};

// Rule: an outbound connect from a process whose chain (child first) contains these images in order.
bool matches(const std::vector<std::string> &chain, const std::vector<std::string> &pattern) {
  size_t j = 0;
  for (const std::string &img : chain) if (j < pattern.size() && img == pattern[j]) j++;
  return j == pattern.size();
}

// Kernel -> user ring. When full, count drops; never block the hook.
struct Ring {
  std::vector<int> buf; size_t head = 0, tail = 0; uint64_t dropped = 0;
  explicit Ring(size_t n) : buf(n) {}
  bool push(int ev) {
    if (head - tail == buf.size()) { dropped++; return false; }
    buf[head++ % buf.size()] = ev; return true;
  }
  bool pop(int &ev) { if (head == tail) return false; ev = buf[tail++ % buf.size()]; return true; }
};

// Content validation before load: every rule may reference only fields the sensor actually supplies.
struct Rule { std::string name; std::vector<int> field_refs; };
struct Validation { bool ok; std::string why; };
Validation validate(const std::vector<Rule> &rules, int supplied_fields) {
  for (const Rule &r : rules)
    for (int f : r.field_refs)
      if (f < 0 || f >= supplied_fields)
        return {false, r.name + " references field " + std::to_string(f) + " but only " + std::to_string(supplied_fields) + " exist"};
  return {true, "ok"};
}
