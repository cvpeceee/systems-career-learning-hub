#include "../lesson_36_6.cpp"
#include <cassert>
#include <cstdio>
int main() {
  std::vector<double> before, after, same;
  for (int i = 0; i < 40; ++i) { before.push_back(10 + (i % 7)); after.push_back(6 + (i % 5)); same.push_back(10 + ((i * 3) % 7)); }
  CI c = bootstrap_diff(before, after);
  assert(c.lo <= c.est && c.est <= c.hi && improved(c, true));
  CI d = bootstrap_diff(before, same);
  assert(!improved(d, true) && d.lo < 0 && d.hi > 0);
  CI e = bootstrap_diff({}, after); assert(e.est == 0);
  CI c2 = bootstrap_diff(before, after); assert(c2.lo == c.lo && c2.hi == c.hi);
  printf("36.6 ok diff=%.2f [%.2f, %.2f]\n", c.est, c.lo, c.hi);
}
