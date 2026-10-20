#include <algorithm>
#include <cstdint>
#include <vector>

struct Rect { int64_t x1, y1, x2, y2; };

// Area covered by the union of rectangles: sweep in x, count coverage per compressed y-interval.
int64_t union_area(const std::vector<Rect> &rs) {
  std::vector<int64_t> ys;
  struct Ev { int64_t x; int d; int64_t y1, y2; };
  std::vector<Ev> ev;
  for (const Rect &r : rs) {
    if (r.x1 >= r.x2 || r.y1 >= r.y2) continue;
    ys.push_back(r.y1); ys.push_back(r.y2);
    ev.push_back({r.x1, +1, r.y1, r.y2}); ev.push_back({r.x2, -1, r.y1, r.y2});
  }
  std::sort(ys.begin(), ys.end()); ys.erase(std::unique(ys.begin(), ys.end()), ys.end());
  std::sort(ev.begin(), ev.end(), [](const Ev &a, const Ev &b) { return a.x < b.x; });
  std::vector<int> cover(ys.size(), 0);
  int64_t area = 0, prev_x = ev.empty() ? 0 : ev[0].x;
  for (const Ev &e : ev) {
    int64_t len = 0;
    for (size_t i = 0; i + 1 < ys.size(); i++) if (cover[i] > 0) len += ys[i + 1] - ys[i];
    area += len * (e.x - prev_x);
    prev_x = e.x;
    size_t a = (size_t)(std::lower_bound(ys.begin(), ys.end(), e.y1) - ys.begin());
    size_t b = (size_t)(std::lower_bound(ys.begin(), ys.end(), e.y2) - ys.begin());
    for (size_t i = a; i < b; i++) cover[i] += e.d;
  }
  return area;
}

static Rect clip(const Rect &r, const Rect &w) {
  return {std::max(r.x1, w.x1), std::max(r.y1, w.y1), std::min(r.x2, w.x2), std::min(r.y2, w.y2)};
}

// Tiled run: each worker gets the shapes touching its tile + halo, computes, and keeps only its core.
int64_t tiled_union_area(const std::vector<Rect> &rs, int64_t W, int64_t H, int64_t T, int64_t halo) {
  int64_t total = 0;
  for (int64_t tx = 0; tx < W; tx += T)
    for (int64_t ty = 0; ty < H; ty += T) {
      Rect core{tx, ty, std::min(tx + T, W), std::min(ty + T, H)};
      Rect ext{core.x1 - halo, core.y1 - halo, core.x2 + halo, core.y2 + halo};
      std::vector<Rect> local;
      for (const Rect &r : rs) {
        Rect c = clip(r, ext);
        if (c.x1 < c.x2 && c.y1 < c.y2) local.push_back(c);
      }
      std::vector<Rect> kept;
      for (const Rect &r : local) kept.push_back(clip(r, core));
      total += union_area(kept);
    }
  return total;
}
