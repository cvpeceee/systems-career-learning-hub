#include "../lesson_41_1.cpp"
#include <cassert>
#include <cstdio>
#include <random>
int main() {
  std::mt19937 rng(3);
  std::vector<Poi> p;
  for (uint32_t i = 0; i < 5000; i++) p.push_back({(int32_t)(rng() % 200000) - 100000, (int32_t)(rng() % 200000) - 100000, i});
  for (int32_t cell : {500, 2000, 10000}) {
    Grid g(p, cell);
    for (int q = 0; q < 300; q++) {
      int32_t x = (int32_t)(rng() % 260000) - 130000, y = (int32_t)(rng() % 260000) - 130000;
      int vis; long got = g.nearest(x, y, vis);
      int64_t best = INT64_MAX;
      for (const Poi &a : p) { int64_t dx = a.x - x, dy = a.y - y; best = std::min(best, dx * dx + dy * dy); }
      int64_t dx = p[(size_t)got].x - x, dy = p[(size_t)got].y - y;
      assert(dx * dx + dy * dy == best);
    }
  }
  std::vector<Poi> none; Grid e(none, 100); int v; assert(e.nearest(0, 0, v) == -1);
  std::vector<std::string> names = {"Bergen", "Berlin", "Bern", "Bonn", "Paris"};
  auto r = prefix(names, "Ber", 10); assert(r.size() == 3 && r[1] == "Berlin");
  assert(prefix(names, "Ber", 2).size() == 2 && prefix(names, "X", 5).empty());
  printf("41.1 ok\n");
}
