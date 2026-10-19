#include "../lesson_35_2.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Limits L;
  assert(std::fabs(stopping_distance(1.0, L) - 0.35) < 1e-9);
  assert(safe({1.0, 1.0}, {1.0}, L));
  assert(!safe({1.0, 0.5}, {1.0}, L));
  assert(!safe({0, 10}, {2.0}, L));
  Supervisor s(L, 3);
  Cmd c = s.step({1.0, 0.5}, {1.0});
  assert(s.in_fallback() && c.v < 1.0 && s.interventions == 1);
  s.step({0.5, 0.4}, {1.0});                 // still unsafe, same intervention
  assert(s.interventions == 1);
  for (int i = 0; i < 2; ++i) { s.step({0.1, 3.0}, {0.2}); assert(s.in_fallback()); }
  s.step({0.1, 3.0}, {0.2});
  assert(!s.in_fallback());
  assert(s.step({0.1, 3.0}, {0.2}).v == 0.2);
  printf("35.2 ok\n");
}
