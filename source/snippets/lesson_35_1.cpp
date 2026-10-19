#include <array>
#include <cmath>
#include <optional>

constexpr int H = 50;          // actions per chunk
constexpr int MAXC = 4;        // chunks kept for ensembling
constexpr int DOF = 7;         // joints

using Act = std::array<double, DOF>;
struct Chunk { long t0 = 0; std::array<Act, H> a{}; bool used = false; };

class Executor {
  std::array<Chunk, MAXC> ring_{};
  int next_ = 0;
  double k_;
 public:
  explicit Executor(double k) : k_(k) {}
  void push(const Chunk &c) { ring_[next_] = c; ring_[next_].used = true; next_ = (next_ + 1) % MAXC; }

  // Command for control tick t, or nullopt to hold position safely.
  std::optional<Act> act(long t) const {
    Act sum{}; double wsum = 0;
    for (const Chunk &c : ring_) {
      if (!c.used) continue;
      long i = t - c.t0;
      if (i < 0 || i >= H) continue;
      double w = std::exp(-k_ * i);
      for (int j = 0; j < DOF; ++j) sum[j] += w * c.a[i][j];
      wsum += w;
    }
    if (wsum == 0) return std::nullopt;
    for (double &x : sum) x /= wsum;
    return sum;
  }
};
