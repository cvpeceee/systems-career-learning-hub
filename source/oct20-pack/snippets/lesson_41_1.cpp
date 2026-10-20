#include <algorithm>
#include <cstdint>
#include <cstdlib>
#include <map>
#include <string>
#include <utility>
#include <vector>

struct Poi { int32_t x, y; uint32_t name; };

struct Grid {
  int32_t cell;
  std::map<std::pair<int32_t, int32_t>, std::vector<uint32_t>> cells;
  const std::vector<Poi> *pois;
  Grid(const std::vector<Poi> &p, int32_t c) : cell(c), pois(&p) {
    for (uint32_t i = 0; i < p.size(); i++) cells[{fdiv(p[i].x), fdiv(p[i].y)}].push_back(i);
  }
  int32_t fdiv(int32_t v) const { return v >= 0 ? v / cell : -((-v + cell - 1) / cell); }

  // Exact nearest POI to (qx, qy); returns index or -1. 'visited' counts cells probed.
  long nearest(int32_t qx, int32_t qy, int &visited) const {
    visited = 0;
    if (cells.empty()) return -1;
    const int32_t cx = fdiv(qx), cy = fdiv(qy);
    int32_t maxr = 0;
    for (const auto &kv : cells)
      maxr = std::max(maxr, std::max(std::abs(kv.first.first - cx), std::abs(kv.first.second - cy)));
    long best = -1; int64_t bestd = INT64_MAX;
    for (int32_t r = 0; r <= maxr; r++) {
      int64_t ring_min = (int64_t)(r > 0 ? r - 1 : 0) * cell;
      if (best >= 0 && ring_min * ring_min > bestd) break;
      for (int32_t dx = -r; dx <= r; dx++)
        for (int32_t dy = -r; dy <= r; dy++) {
          if (std::max(std::abs(dx), std::abs(dy)) != r) continue;
          auto it = cells.find({cx + dx, cy + dy});
          visited++;
          if (it == cells.end()) continue;
          for (uint32_t i : it->second) {
            int64_t ddx = (int64_t)(*pois)[i].x - qx, ddy = (int64_t)(*pois)[i].y - qy;
            int64_t d = ddx * ddx + ddy * ddy;
            if (d < bestd) { bestd = d; best = i; }
          }
        }
    }
    return best;
  }
};

// Prefix search on a sorted name table: binary search, zero extra memory.
std::vector<std::string> prefix(const std::vector<std::string> &sorted, const std::string &p, size_t limit) {
  std::vector<std::string> out;
  auto it = std::lower_bound(sorted.begin(), sorted.end(), p);
  for (; it != sorted.end() && out.size() < limit && it->compare(0, p.size(), p) == 0; ++it) out.push_back(*it);
  return out;
}
