#include <algorithm>
#include <cmath>

struct Cmd { double v; };                      // forward speed, m/s
struct State { double v; double dist; };       // current speed, distance to nearest obstacle (m)

struct Limits {
  double a_brake = 2.0;      // m/s^2 the fallback can always achieve
  double t_react = 0.1;      // s from decision to braking
  double margin = 0.3;       // m kept free at all times
  double v_max = 1.5;        // m/s cap near people
};

double stopping_distance(double v, const Limits &L) {
  v = std::max(0.0, v);
  return v * L.t_react + v * v / (2 * L.a_brake);
}

bool safe(const State &s, const Cmd &c, const Limits &L) {
  if (c.v > L.v_max) return false;
  return stopping_distance(c.v, L) + L.margin <= s.dist;
}

class Supervisor {
  Limits L_;
  int calm_ = 0, need_;
  bool fallback_ = false;
 public:
  long interventions = 0;
  Supervisor(Limits L, int need) : L_(L), need_(need) {}
  Cmd step(const State &s, const Cmd &learned) {
    bool ok = safe(s, learned, L_);
    if (!ok) {
      if (!fallback_) ++interventions;
      fallback_ = true;
      calm_ = 0;
    } else if (fallback_ && ++calm_ >= need_) {
      fallback_ = false;
    }
    if (!fallback_) return learned;
    double v = std::max(0.0, s.v - L_.a_brake * 0.01);
    return Cmd{v};
  }
  bool in_fallback() const { return fallback_; }
};
