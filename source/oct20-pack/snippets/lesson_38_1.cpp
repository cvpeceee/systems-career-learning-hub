#include <algorithm>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <vector>

struct Dep { std::string name; int min_ver; };
struct Pkg { std::string name; int ver; std::vector<Dep> deps; };
struct Plan { bool ok = true; std::string error; std::vector<std::string> order; };

// repo: every available (name, version). Greedy: pick the highest version that meets every constraint seen.
Plan resolve(const std::vector<Pkg> &repo, const std::vector<Dep> &want) {
  std::map<std::string, std::vector<const Pkg *>> by;
  for (const Pkg &p : repo) by[p.name].push_back(&p);
  for (auto &kv : by) std::sort(kv.second.begin(), kv.second.end(), [](const Pkg *a, const Pkg *b) { return a->ver > b->ver; });
  std::map<std::string, int> need;
  std::map<std::string, const Pkg *> pick;
  std::vector<Dep> todo = want;
  Plan plan;
  while (!todo.empty()) {
    Dep d = todo.back(); todo.pop_back();
    need[d.name] = std::max(need[d.name], d.min_ver);
    auto it = by.find(d.name);
    if (it == by.end()) return {false, "missing package " + d.name, {}};
    if (pick.count(d.name)) {
      if (pick[d.name]->ver < need[d.name])
        return {false, "conflict on " + d.name + ": picked " + std::to_string(pick[d.name]->ver) + ", need >= " + std::to_string(need[d.name]), {}};
      continue;
    }
    const Pkg *best = nullptr;
    for (const Pkg *p : it->second) if (p->ver >= need[d.name]) { best = p; break; }
    if (!best) return {false, "no version of " + d.name + " >= " + std::to_string(need[d.name]), {}};
    pick[d.name] = best;
    for (const Dep &x : best->deps) todo.push_back(x);
  }
  // Kahn's algorithm: install dependencies first; leftover nodes mean a cycle.
  std::map<std::string, int> indeg; std::map<std::string, std::vector<std::string>> users;
  for (auto &kv : pick) { indeg[kv.first] += 0; for (const Dep &x : kv.second->deps) { indeg[kv.first]++; users[x.name].push_back(kv.first); } }
  std::queue<std::string> q;
  for (auto &kv : indeg) if (kv.second == 0) q.push(kv.first);
  while (!q.empty()) {
    std::string n = q.front(); q.pop();
    plan.order.push_back(n + "-" + std::to_string(pick[n]->ver));
    for (const std::string &u : users[n]) if (--indeg[u] == 0) q.push(u);
  }
  if (plan.order.size() != pick.size()) return {false, "dependency cycle", {}};
  return plan;
}

// Kernel config: merge fragments in order; later values win; report every override.
using Config = std::map<std::string, std::string>;      // "CONFIG_X" -> "y" | "m" | "n" | value
Config merge_fragments(const std::vector<Config> &frags, std::vector<std::string> &warnings) {
  Config out;
  for (const Config &f : frags)
    for (const auto &kv : f) {
      auto it = out.find(kv.first);
      if (it != out.end() && it->second != kv.second)
        warnings.push_back(kv.first + ": " + it->second + " -> " + kv.second);
      out[kv.first] = kv.second;
    }
  return out;
}

// After olddefconfig, confirm every requested option survived (Kconfig drops options with unmet deps).
std::vector<std::string> missing_after_build(const Config &requested, const Config &final_cfg) {
  std::vector<std::string> bad;
  for (const auto &kv : requested) {
    auto it = final_cfg.find(kv.first);
    std::string got = it == final_cfg.end() ? "n" : it->second;
    if (got != kv.second) bad.push_back(kv.first);
  }
  return bad;
}
