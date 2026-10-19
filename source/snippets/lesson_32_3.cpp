#include <algorithm>
#include <string>
#include <vector>

// Simplified model of a 7-slice GPU. Real placement rules: nvidia-smi mig -lgipp.
struct Profile { std::string name; int slices; int mem_gb; std::vector<int> starts; };
const std::vector<Profile> kProfiles = {
  {"1g.10gb", 1, 10, {0, 1, 2, 3, 4, 5, 6}},
  {"2g.20gb", 2, 20, {0, 2, 4}},
  {"3g.40gb", 3, 40, {0, 4}},
  {"7g.80gb", 7, 80, {0}},
};

struct Model { std::string name; int mem_gb; int slices; };
struct Gpu { std::vector<bool> used = std::vector<bool>(7, false); std::vector<std::string> placed; };

// Smallest profile with enough memory and compute.
const Profile *fit(const Model &m) {
  for (const Profile &p : kProfiles)
    if (p.mem_gb >= m.mem_gb && p.slices >= m.slices) return &p;
  return nullptr;
}

bool place(Gpu &g, const Profile &p, const std::string &who) {
  for (int s : p.starts) {
    bool free = s + p.slices <= 7;
    for (int i = s; free && i < s + p.slices; ++i) free = !g.used[i];
    if (!free) continue;
    for (int i = s; i < s + p.slices; ++i) g.used[i] = true;
    g.placed.push_back(who + "@" + p.name);
    return true;
  }
  return false;
}

// First-fit decreasing; returns GPUs used, or -1 if a model fits no profile.
int pack(std::vector<Model> ms, std::vector<Gpu> &gpus) {
  for (const Model &m : ms) if (!fit(m)) return -1;
  std::sort(ms.begin(), ms.end(), [](const Model &a, const Model &b) {
    return fit(a)->slices > fit(b)->slices;
  });
  for (const Model &m : ms) {
    const Profile &p = *fit(m);
    bool ok = false;
    for (Gpu &g : gpus) if ((ok = place(g, p, m.name))) break;
    if (!ok) { gpus.emplace_back(); place(gpus.back(), p, m.name); }
  }
  return static_cast<int>(gpus.size());
}
