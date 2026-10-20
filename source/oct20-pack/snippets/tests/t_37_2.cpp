#include "../lesson_37_2.cpp"
#include <cassert>
#include <cmath>
#include <cstdio>
int main() {
  for (int W : {1, 2, 4, 6, 8, 16}) {
    Result r = simulate(W, 9, 50, 200);
    double b = bound(W, 9, 50);
    assert(std::fabs(r.util() - b) < 0.05);
  }
  assert(simulate(1, 9, 50, 100).util() < 0.2);
  assert(simulate(8, 9, 50, 100).util() > 0.95);
  assert(simulate(4, 1, 1, 10).issued == 4u * 2u * 10u);
  printf("37.2 ok\n");
}
