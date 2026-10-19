#include <set>
#include <string>
#include <vector>

enum class Action { Keep = 0, Watch = 1, Drain = 2, Repair = 3 };

struct Xid { int code; std::string job; };

struct Counters {
  unsigned long long dbe = 0;        // double-bit ECC errors since last reset
  bool remap_pending = false;        // row remap needs a GPU reset
  bool remap_failed = false;         // no spare rows left
  double nvlink_crc_per_min = 0;     // replay/CRC error rate across links
  int temp_c = 0;
};

struct Verdict { Action act; std::string why; };

static void raise(Verdict &v, Action a, const char *why) {
  if (a > v.act) { v.act = a; v.why = why; }
}

Verdict classify(const std::vector<Xid> &xids, const Counters &c) {
  Verdict v{Action::Keep, "healthy"};
  std::set<std::string> app_fault_jobs;
  for (const Xid &x : xids) {
    switch (x.code) {
      case 13: case 31: case 43:
        app_fault_jobs.insert(x.job); break;
      case 48: case 95: raise(v, Action::Drain, "uncorrectable memory error"); break;
      case 63: raise(v, Action::Drain, "row remap pending: reset needed"); break;
      case 64: case 79: raise(v, Action::Repair, "remap failure or GPU fell off bus"); break;
      case 74: raise(v, Action::Watch, "NVLink error logged"); break;
      default: raise(v, Action::Watch, "unrecognised XID: check NVIDIA docs"); break;
    }
  }
  if (app_fault_jobs.size() >= 3) raise(v, Action::Drain, "same fault across 3+ jobs: likely hardware");
  else if (!app_fault_jobs.empty()) raise(v, Action::Watch, "app-type fault: watch for repeats");
  if (c.remap_failed) raise(v, Action::Repair, "no spare memory rows left");
  if (c.remap_pending) raise(v, Action::Drain, "row remap pending: reset needed");
  if (c.dbe > 0) raise(v, Action::Drain, "double-bit ECC errors");
  if (c.nvlink_crc_per_min > 100) raise(v, Action::Drain, "NVLink error rate high");
  else if (c.nvlink_crc_per_min > 5) raise(v, Action::Watch, "NVLink errors rising");
  if (c.temp_c >= 90) raise(v, Action::Drain, "overheating: check BMC fans and power");
  return v;
}

// Return to service only after "need" clean windows in a row, then burn-in.
struct Gate {
  int need = 6, clean = 0;
  bool burned_in = false;
  bool ready(Action latest) {
    clean = (latest == Action::Keep) ? clean + 1 : 0;
    return clean >= need && burned_in;
  }
};
