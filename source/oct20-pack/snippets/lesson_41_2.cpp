#include <cstdint>
#include <functional>
#include <vector>

using Vec = std::vector<bool>;                        // one value per condition
using Decision = std::function<bool(const Vec &)>;

struct Pair { int cond; size_t a, b; };

// For each condition, find a pair of tests that differ ONLY in that condition and flip the outcome (unique-cause MC/DC).
std::vector<Pair> mcdc_pairs(const Decision &d, const std::vector<Vec> &tests, int n) {
  std::vector<Pair> out;
  for (int c = 0; c < n; c++) {
    bool found = false;
    for (size_t i = 0; i < tests.size() && !found; i++)
      for (size_t j = i + 1; j < tests.size() && !found; j++) {
        int diffs = 0, where = -1;
        for (int k = 0; k < n; k++) if (tests[i][(size_t)k] != tests[j][(size_t)k]) { diffs++; where = k; }
        if (diffs == 1 && where == c && d(tests[i]) != d(tests[j])) {
          out.push_back({c, i, j}); found = true;
        }
      }
  }
  return out;
}

bool has_mcdc(const Decision &d, const std::vector<Vec> &tests, int n) {
  return (int)mcdc_pairs(d, tests, n).size() == n;
}

// Partition schedule check (ARINC 653 style): windows inside one major frame must not overlap and must fit.
struct Window { int partition; uint32_t start_us, len_us; };
bool schedule_ok(const std::vector<Window> &w, uint32_t major_us) {
  for (size_t i = 0; i < w.size(); i++) {
    if (w[i].start_us + w[i].len_us > major_us) return false;
    for (size_t j = i + 1; j < w.size(); j++) {
      bool disjoint = w[i].start_us + w[i].len_us <= w[j].start_us || w[j].start_us + w[j].len_us <= w[i].start_us;
      if (!disjoint) return false;
    }
  }
  return true;
}
