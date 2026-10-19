#include <algorithm>
#include <cmath>

// A job that needs all n nodes fails when any node fails.
double job_mtbf_hours(double node_mtbf_hours, int nodes) {
  return nodes > 0 ? node_mtbf_hours / nodes : 0.0;
}

// Young: checkpoint every sqrt(2 * C * M) hours of training.
double young_interval_hours(double ckpt_hours, double mtbf_hours) {
  if (ckpt_hours <= 0 || mtbf_hours <= 0) return 0.0;
  return std::sqrt(2.0 * ckpt_hours * mtbf_hours);
}

struct Plan {
  double ckpt_hours;     // time training is blocked per checkpoint
  double restart_hours;  // detect, replace nodes, reload, warm up
  double mtbf_hours;     // whole-job MTBF
};

// Share of wall time spent on training that is kept (first-order model).
double goodput(const Plan &p, double interval_hours) {
  if (interval_hours <= 0 || p.mtbf_hours <= 0) return 0.0;
  double waste = p.ckpt_hours / interval_hours
               + (interval_hours + p.ckpt_hours) / (2 * p.mtbf_hours)
               + p.restart_hours / p.mtbf_hours;
  return std::clamp(1.0 - waste, 0.0, 1.0);
}

// P(at most k of n nodes are down) when each is down with probability p.
double binom_cdf(int k, int n, double p) {
  if (p <= 0) return 1.0;
  if (p >= 1) return k >= n ? 1.0 : 0.0;
  double s = 0;
  for (int i = 0; i <= k && i <= n; ++i) {
    double logc = std::lgamma(n + 1.0) - std::lgamma(i + 1.0) - std::lgamma(n - i + 1.0);
    s += std::exp(logc + i * std::log(p) + (n - i) * std::log1p(-p));
  }
  return std::min(s, 1.0);
}

// Fewest spares so a job needing "need" nodes can start with probability >= target.
int spares_needed(int need, double p_down, double target) {
  for (int s = 0; s <= need; ++s)
    if (binom_cdf(s, need + s, p_down) >= target) return s;
  return -1;
}
