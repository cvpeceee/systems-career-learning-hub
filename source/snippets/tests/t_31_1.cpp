#include "../lesson_31_1.cpp"
#include <cassert>
#include <cstdio>
int main() {
  assert(std::fabs(job_mtbf_hours(50000, 4096) - 12.207) < 0.01);
  double M = job_mtbf_hours(40000, 4000);
  assert(std::fabs(M - 10) < 1e-9);
  double tau = young_interval_hours(0.1, 12);
  assert(std::fabs(tau - std::sqrt(2.4)) < 1e-9);
  Plan p{0.1, 20.0 / 60, 12};
  double g = goodput(p, tau);
  assert(g > 0.8 && g < 0.95);
  // optimum near Young
  double best = 0, bt = 0;
  for (double t = 0.1; t < 6; t += 0.01) { double x = goodput(p, t); if (x > best) { best = x; bt = t; } }
  assert(std::fabs(bt - tau) < 0.15);
  assert(binom_cdf(0, 10, 0.0) == 1.0);
  assert(std::fabs(binom_cdf(10, 10, 0.3) - 1.0) < 1e-9);
  int s = spares_needed(4096, 0.005, 0.999);
  assert(s > 20 && s < 60);
  assert(spares_needed(10, 0.0, 0.99) == 0);
  printf("31.1 ok goodput=%.3f young=%.2fh spares=%d\n", g, tau, s);
}
