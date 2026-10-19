#include "../lesson_32_3.cpp"
#include <cassert>
#include <cstdio>
int main() {
  std::vector<Gpu> g;
  std::vector<Model> ms = {{"s1", 8, 1}, {"big", 35, 3}, {"s2", 9, 1}, {"m", 18, 2}, {"big2", 40, 2}, {"s3", 5, 1}};
  int n = pack(ms, g);
  assert(n == 2);
  int used = 0;
  for (auto &x : g) for (bool b : x.used) used += b;
  assert(used == 1 + 3 + 1 + 2 + 3 + 1);
  std::vector<Gpu> g2;
  assert(pack({{"huge", 100, 1}}, g2) == -1);
  std::vector<Gpu> g3;
  assert(pack({{"a", 40, 3}, {"b", 40, 3}, {"c", 10, 1}}, g3) == 1);
  printf("32.3 ok gpus=%d\n", n);
}
