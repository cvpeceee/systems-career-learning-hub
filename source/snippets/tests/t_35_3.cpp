#include "../lesson_35_3.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Interval a = wilson(18, 20);
  assert(a.lo > 0.69 && a.lo < 0.71 && a.hi > 0.96 && a.hi < 0.98);
  Interval z = wilson(0, 0); assert(z.lo == 0 && z.hi == 1);
  Interval f = wilson(10, 10); assert(f.hi <= 1.0 && f.lo > 0.6);
  std::vector<TaskResult> small = {{"box", 23, 25, 21, 25, false}};
  assert(!release_gate(small, 0.1, 0.1, 100, 200).pass);
  std::vector<TaskResult> big = {{"box", 380, 400, 340, 400, false}, {"bottle", 190, 200, 170, 200, true}};
  Gate g = release_gate(big, 0.1, 0.1, 100, 200);
  assert(g.pass);
  assert(!release_gate(big, 0.2, 0.1, 100, 200).pass);
  assert(!release_gate(big, 0.1, 0.1, 300, 200).pass);
  std::vector<TaskResult> reg = {{"box", 400, 400, 340, 400, false}, {"bottle", 100, 200, 170, 200, true}};
  assert(release_gate(reg, 0.1, 0.1, 100, 200).why.find("critical") != std::string::npos);
  printf("35.3 ok [%.3f, %.3f]\n", a.lo, a.hi);
}
