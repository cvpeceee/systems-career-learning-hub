#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

struct Interval { double lo, mid, hi; };

// Wilson score interval for k successes in n trials (z = 1.96 for ~95%).
Interval wilson(int k, int n, double z = 1.96) {
  if (n == 0) return {0, 0, 1};
  double p = static_cast<double>(k) / n, z2 = z * z;
  double den = 1 + z2 / n;
  double c = (p + z2 / (2 * n)) / den;
  double half = z * std::sqrt(p * (1 - p) / n + z2 / (4.0 * n * n)) / den;
  return {std::max(0.0, c - half), p, std::min(1.0, c + half)};
}

struct TaskResult { std::string task; int k_new, n_new, k_old, n_old; bool critical; };

struct Gate {
  bool pass; std::string why;
};

Gate release_gate(const std::vector<TaskResult> &tasks, double interv_new, double interv_old,
                  double p95_ms, double budget_ms) {
  int kn = 0, nn = 0, ko = 0, no = 0;
  for (const auto &t : tasks) {
    Interval a = wilson(t.k_new, t.n_new), b = wilson(t.k_old, t.n_old);
    if (t.critical && a.hi < b.mid) return {false, "regression on critical task " + t.task};
    kn += t.k_new; nn += t.n_new; ko += t.k_old; no += t.n_old;
  }
  Interval all_new = wilson(kn, nn), all_old = wilson(ko, no);
  if (all_new.lo <= all_old.mid) return {false, "improvement not yet significant: run more trials"};
  if (interv_new > interv_old) return {false, "more safety interventions than current policy"};
  if (p95_ms > budget_ms) return {false, "inference latency over budget"};
  return {true, "promote"};
}
