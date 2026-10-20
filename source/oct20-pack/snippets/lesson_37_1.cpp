#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

// Memory of N one-bit cells with optional injected faults.
struct Mem {
  std::vector<uint8_t> cell;
  long stuck_addr = -1; int stuck_val = 0;
  long trans_addr = -1;
  long aggr = -1, victim = -1;
  explicit Mem(size_t n) : cell(n, 0) {}
  int read(size_t a) const { return (long)a == stuck_addr ? stuck_val : cell[a]; }
  void write(size_t a, int v) {
    if ((long)a == trans_addr && cell[a] == 1 && v == 0) return;
    if ((long)a == aggr && v == 1 && cell[a] == 0 && victim >= 0) cell[(size_t)victim] ^= 1;
    cell[a] = (uint8_t)v;
  }
};

struct Failure { bool failed = false; int element = -1; long addr = -1; int expected = 0, got = 0; };

// One march element: direction + a recipe of ops. 'r0' = read expect 0, 'w1' = write 1.
struct Element { bool up; std::string ops; };

Failure march(Mem &m, const std::vector<Element> &alg) {
  const long n = (long)m.cell.size();
  for (size_t e = 0; e < alg.size(); e++) {
    for (long i = 0; i < n; i++) {
      long a = alg[e].up ? i : n - 1 - i;
      const std::string &ops = alg[e].ops;
      for (size_t k = 0; k + 1 < ops.size(); k += 2) {
        int v = ops[k + 1] - '0';
        if (ops[k] == 'w') { m.write((size_t)a, v); continue; }
        int got = m.read((size_t)a);
        if (got != v) return {true, (int)e, a, v, got};
      }
    }
  }
  return {};
}

// March C-: 10N operations, catches stuck-at, transition and unlinked coupling faults.
const std::vector<Element> MARCH_C_MINUS = {
  {true, "w0"}, {true, "r0w1"}, {true, "r1w0"}, {false, "r0w1"}, {false, "r1w0"}, {true, "r0"}};
