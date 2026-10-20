#include <cstdint>
#include <vector>

struct Result { uint64_t cycles = 0, issued = 0; double util() const { return cycles ? (double)issued / (double)cycles : 0; } };

// W warps, each runs 'iters' rounds of: m compute instructions, then one load of latency L.
Result simulate(int W, int m, int L, int iters) {
  struct Warp { int pc = 0, round = 0; uint64_t ready_at = 0; };
  std::vector<Warp> w((size_t)W);
  Result r; int done = 0, rr = 0;
  const int per_round = m + 1;
  while (done < W) {
    bool issued = false;
    for (int k = 0; k < W && !issued; k++) {
      Warp &x = w[(size_t)((rr + k) % W)];
      if (x.round >= iters || x.ready_at > r.cycles) continue;
      issued = true; r.issued++; rr = (rr + k) % W;
      if (++x.pc == per_round) {
        x.pc = 0; x.ready_at = r.cycles + (uint64_t)L;
        if (++x.round == iters) done++;
      } else {
        x.ready_at = r.cycles + 1;
      }
    }
    r.cycles++;
  }
  return r;
}

// Analytic bound for comparison: each warp is busy (m+1) of every (m+L) cycles.
double bound(int W, int m, int L) {
  double one = (double)(m + 1) / (double)(m + L);
  double b = W * one;
  return b > 1 ? 1 : b;
}
