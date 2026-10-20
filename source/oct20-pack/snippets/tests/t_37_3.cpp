#include "../lesson_37_3.cpp"
#include <cassert>
#include <cstdio>
#include <random>
int main() {
  assert(union_area({}) == 0);
  assert(union_area({{0, 0, 2, 2}, {1, 1, 3, 3}}) == 7);
  assert(union_area({{0, 0, 2, 2}, {0, 0, 2, 2}}) == 4);
  assert(union_area({{0, 0, 1, 1}, {1, 0, 2, 1}}) == 2);
  std::mt19937 rng(7);
  for (int t = 0; t < 20; t++) {
    std::vector<Rect> rs;
    for (int i = 0; i < 60; i++) { int64_t x = (int64_t)(rng() % 900), y = (int64_t)(rng() % 900), w = 1 + (int64_t)(rng() % 100), hh = 1 + (int64_t)(rng() % 100); rs.push_back({x, y, x + w, y + hh}); }
    int64_t a = union_area(rs);
    for (int64_t T : {100, 250, 1000}) for (int64_t halo : {0, 50}) assert(tiled_union_area(rs, 1000, 1000, T, halo) == a);
  }
  printf("37.3 ok\n");
}
