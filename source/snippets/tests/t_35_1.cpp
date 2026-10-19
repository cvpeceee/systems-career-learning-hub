#include "../lesson_35_1.cpp"
#include <cassert>
#include <cstdio>
int main() {
  Executor ex(0.0);
  assert(!ex.act(0));
  Chunk c; c.t0 = 100;
  for (int i = 0; i < H; ++i) c.a[i].fill(i);
  ex.push(c);
  assert(!ex.act(99));
  assert(ex.act(109)->at(0) == 9);           // latency skip: tick 109 -> index 9
  Chunk d; d.t0 = 110;
  for (int i = 0; i < H; ++i) d.a[i].fill(100 + i);
  ex.push(d);
  double v = ex.act(120)->at(0);             // avg of c[20]=20 and d[10]=110 = 65
  assert(std::fabs(v - 65) < 1e-9);
  Executor ek(0.1); ek.push(c); ek.push(d);
  double w = ek.act(120)->at(0);
  assert(w > 65);                            // newer chunk weighted more
  assert(!ex.act(100 + H + 10 + 5));         // both used up
  printf("35.1 ok ens=%.1f weighted=%.1f\n", v, w);
}
