#include "../lesson_41_2.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Decision d = [](const Vec &v) { return (v[0] && v[1]) || v[2]; };
  std::vector<Vec> four = {{true, true, false}, {false, true, false}, {true, false, false}, {true, false, true}};
  assert(has_mcdc(d, four, 3));
  std::vector<Vec> three(four.begin(), four.begin() + 3);
  assert(!has_mcdc(d, three, 3) && mcdc_pairs(d, three, 3).size() == 2);
  std::vector<Vec> masked = {{true, true, true}, {false, true, true}, {true, false, true}, {false, false, false}};
  assert(!has_mcdc(d, masked, 3));
  assert(schedule_ok({{1, 0, 5000}, {2, 5000, 10000}, {3, 15000, 10000}}, 25000));
  assert(!schedule_ok({{1, 0, 6000}, {2, 5000, 10000}}, 25000));
  assert(!schedule_ok({{1, 20000, 6000}}, 25000));
  printf("41.2 ok\n");
}
