#include <algorithm>
#include <random>
#include <vector>

static double mean(const std::vector<double> &v) {
  double s = 0;
  for (double x : v) s += x;
  return v.empty() ? 0 : s / v.size();
}

struct CI { double lo, est, hi; };

// 95% bootstrap interval for mean(after) - mean(before).
CI bootstrap_diff(const std::vector<double> &before, const std::vector<double> &after,
                  int iters = 10000, unsigned seed = 42) {
  if (before.empty() || after.empty()) return {0, 0, 0};
  std::mt19937 rng(seed);
  std::uniform_int_distribution<size_t> pb(0, before.size() - 1), pa(0, after.size() - 1);
  std::vector<double> diffs;
  diffs.reserve(iters);
  std::vector<double> b(before.size()), a(after.size());
  for (int i = 0; i < iters; ++i) {
    for (double &x : b) x = before[pb(rng)];
    for (double &x : a) x = after[pa(rng)];
    diffs.push_back(mean(a) - mean(b));
  }
  std::sort(diffs.begin(), diffs.end());
  auto at = [&](double q) { return diffs[static_cast<size_t>(q * (diffs.size() - 1))]; };
  return {at(0.025), mean(after) - mean(before), at(0.975)};
}

// "Established" only if the whole interval is on the improving side.
bool improved(const CI &ci, bool lower_is_better) {
  return lower_is_better ? ci.hi < 0 : ci.lo > 0;
}
