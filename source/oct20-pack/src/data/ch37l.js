import { jobs } from "./jobs.js";
import { LN } from "../helpers.js";

export const L37 = [
{
  title: "SoC diagnostics and manufacturing screens: march memory tests, fault models and failure triage",
  sim: "march",
  snippet: "lesson_37_1.cpp",
  jobs: jobs(["tegra", "POSTED (JR2011805, Tegra Diagnostics): 'develop drivers/tests and frameworks that can most efficiently stress the SOC/System … design validation, thermal & power characterization, manufacturing screening'; root-cause 'data center module/rack level failures'."], ["gpuarch", "POSTED: develop tests, testplans and testing infrastructure for new architectures."]),
  concept: "A diagnostic test answers a narrow question quickly: **is this part good enough to ship, and if not, where is it broken?** Memory is the classic example. Real defects follow a few **fault models**. A **stuck-at fault** is a bit that always reads 0 or 1. A **transition fault** is a bit that can't change in one direction (it can go 0→1 but not 1→0). A **coupling fault** is when writing one cell (the *aggressor*) flips another (the *victim*). Address-decoder faults make two addresses hit the same cell. Writing random data and reading it back misses many of these. **March tests** do better: a fixed sequence of *march elements*, each walking every address up (⇑) or down (⇓) and doing a short read/write recipe at each one. **March C-** is ⇕(w0); ⇑(r0,w1); ⇑(r1,w0); ⇓(r0,w1); ⇓(r1,w0); ⇕(r0). That is 10 operations per cell (10N), and it detects all stuck-at, transition and unlinked coupling faults. The **direction matters**: a coupling fault where a low address disturbs a high one is caught going up, and the reverse going down. In production the same idea scales to a whole SoC. **Stress tests** push power, temperature and bandwidth to the edges (power-virus kernels, DMA storms, all cores at max frequency). **Screening** decides pass/fail/bin from the results. A good framework logs the **first failing address, the element and the expected vs actual value**, because that pattern (one bit in every word, one row, one bank) points to the root cause: a bad cell, a bad row driver, or a signal-integrity problem on one data line.",
  analogy: "Checking every seat in a stadium by having a usher walk each row forwards, then backwards, asking each seat to stand up and sit down. Walking both ways catches the seat that only collapses when its neighbour on one particular side stands up.",
  language: "C++17 · March C- over a fault-injectable memory model, reporting the first failure",
  primer: {
    text: "Chips are tested before they ship and when they come back broken. Memory tests follow a fixed walk through every address, writing and reading patterns in both directions. This lesson builds that walk, injects realistic defects, and shows which ones each step catches.",
    terms: [
      ["Fault model", "A precise description of how hardware can be broken, such as a bit stuck at 1."],
      ["Stuck-at fault", "A memory bit that always reads the same value, whatever is written."],
      ["Transition fault", "A bit that can't change in one direction, for example from 1 back to 0."],
      ["Coupling fault", "Writing one cell (the aggressor) changes a different cell (the victim)."],
      ["March test", "A sequence of passes over all addresses, each doing a small read/write recipe at every address, in a set direction."],
      ["Manufacturing screen", "A fast test run on every unit to decide whether it ships, and in which bin."],
    ],
  },
  lines: LN(`
#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

// Memory of N one-bit cells with optional injected faults.
struct Mem {
  std::vector<uint8_t> cell;
  long stuck_addr = -1; int stuck_val = 0;        //@ Stuck-at: this cell always reads stuck_val.
  long trans_addr = -1;                           //@ Transition fault: this cell can't go 1 -> 0.
  long aggr = -1, victim = -1;                    //@ Coupling: writing 1 to aggr flips victim.
  explicit Mem(size_t n) : cell(n, 0) {}
  int read(size_t a) const { return (long)a == stuck_addr ? stuck_val : cell[a]; }
  void write(size_t a, int v) {
    if ((long)a == trans_addr && cell[a] == 1 && v == 0) return;   //@ The write silently fails.
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
      long a = alg[e].up ? i : n - 1 - i;         //@ Direction is the whole point: some coupling faults only show one way.
      const std::string &ops = alg[e].ops;
      for (size_t k = 0; k + 1 < ops.size(); k += 2) {
        int v = ops[k + 1] - '0';
        if (ops[k] == 'w') { m.write((size_t)a, v); continue; }
        int got = m.read((size_t)a);
        if (got != v) return {true, (int)e, a, v, got};   //@ Log element, address, expected and actual: the pattern points at the root cause.
      }
    }
  }
  return {};
}

// March C-: 10N operations, catches stuck-at, transition and unlinked coupling faults.
const std::vector<Element> MARCH_C_MINUS = {
  {true, "w0"}, {true, "r0w1"}, {true, "r1w0"}, {false, "r0w1"}, {false, "r1w0"}, {true, "r0"}};
`),
  storyLesson: {
    scenarioTitle: "The module that failed only when it was hot",
    scenario: "A batch of SoC modules passes the factory memory test, but a data-center customer reports rare corrupted results after a few hours under load. Returned modules pass the same test on the bench.",
    sections: [
      { title: "1 · Why the old test passed", body: "The factory test wrote every cell, then read every cell back, once, at room temperature. If writing a lower cell flips a higher one, the victim is rewritten afterwards and the flip is hidden." },
      { title: "2 · Reproducing the failure", body: "Run March C- in both directions inside a thermal chamber while a power-virus kernel loads the cores. March C- reads each cell before writing it, so the disturbed value is seen: the test fails in element 1 at addresses that share one row, with one bit wrong." },
      { title: "3 · Root cause from the pattern", body: "One row, one bit, only when hot: a weak cell coupled to its neighbour, made worse by temperature. That points at the memory vendor's lot, not the board design." },
      { title: "4 · Changing the screen", body: "Add March C- at hot temperature to the manufacturing screen, bin marginal parts, and log first-failure records so field returns can be matched to factory data." },
    ],
    checkpoint: { prompt: "Why does March C- walk the addresses in both directions?", answer: "A coupling fault can be caught only when the aggressor is written after the victim was written and before it is read. Going up catches aggressors below the victim; going down catches aggressors above it." },
    lab: { title: "Fault injection campaign", brief: "Inject each fault type at many addresses and record which march element catches it.", steps: ["Run March C- on a clean memory and confirm it passes", "Inject a stuck-at 0 and a stuck-at 1 and record the element that fails", "Inject a transition fault and show the read that catches it", "Inject coupling faults with the aggressor above and below the victim", "Replace March C- with write-all-then-read-all and show the coupling fault it misses"], doneWhen: "You have a table of fault type × element that caught it, and write-all/read-all misses at least one coupling fault." },
  },
  exercise: "You own the diagnostic suite for a new SoC. Design the memory and stress screen that runs on every unit, and what it logs when it fails.",
  answerHint: "Fault models, march algorithm, directions, stress conditions, what to log, how to bin.",
  expected: ["stuck", "coupling", "march", "direction", "temperature", "log"],
  modelAnswer: "Start from fault models: stuck-at, transition, coupling and address-decoder faults. Use a march algorithm such as March C-, which walks every address in both directions, so coupling faults with the aggressor on either side are caught. Run it under stress conditions: high and low temperature, voltage margins and a power-virus load, because marginal parts fail only at the edges. On failure, log the march element, address, expected and actual value, so the pattern (one bit, one row, one bank) points at the root cause. Bin parts by results and keep the logs to match field returns.",
  pitfalls: [
    "Testing with random data once and calling it coverage.",
    "Writing everything before reading anything, or walking in only one direction.",
    "Testing only at room temperature and nominal voltage.",
    "Logging pass/fail only, so field failures can't be traced to a pattern.",
  ],
  probes: [
    ["L1 · What does a stuck-at fault look like in a test?", "A cell reads the same value regardless of what was written; any read expecting the other value fails."],
    ["L2 · Why is March C- 10N?", "Six elements with 1+2+2+2+2+1 = 10 operations per cell."],
    ["L3 · How do you keep a full-SoC stress screen under a factory time budget?", "Run the long tests on a sample, the short targeted ones on every unit; parallelize across cores and DMA engines; stop on first failure; tune coverage using field-return data."],
    ["L4 · Field failures don't reproduce on the bench. What next?", "Recreate the field conditions (temperature, load, firmware version), add logging of first-failure records in production firmware, and correlate with manufacturing lot data."],
  ],
  poly: "At Poly you have brought up boards where a peripheral works on the bench and fails in the customer's room. Diagnostics engineering makes that experience systematic: named fault models, tests that target them, and logs that point to the cause.",
  why: "NVIDIA's Tegra Diagnostics posting is about stress tests, manufacturing screening and rack-level failure analysis. March tests and fault models are the vocabulary for that work.",
  companies: ["NVIDIA", "Qualcomm", "Apple", "AMD", "Tesla"],
  myth: { myth: "Writing random data and reading it back is a good memory test.", reality: "It misses coupling and transition faults; targeted march algorithms catch them in a fixed 10N operations." },
  interviewTip: "Name the fault models before the algorithm. It shows you design the test from the failure, not from habit.",
},
{
  title: "GPU performance models: a cycle simulator for warps, memory latency and latency hiding",
  sim: "warpsim",
  snippet: "lesson_37_2.cpp",
  jobs: jobs(["gpuarch", "POSTED (JR2015492): 'Develop software for various hardware simulators … validate, and verify functional or performance models'; 'design new hardware features'."], ["nvatg", "POSTED: exploit the GPU to accelerate computational methods; understanding why a kernel is slow is part of that."]),
  concept: "GPU architects test ideas in **simulators** long before silicon exists. A **functional model** says *what* the hardware computes; a **performance model** says *how long* it takes. The core idea of a GPU is **latency hiding**. A streaming multiprocessor (SM) holds many **warps** (groups of 32 threads that run one instruction together). When one warp waits for memory, the **warp scheduler** issues an instruction from another ready warp, so the pipeline stays busy. Suppose each warp does m compute instructions and then a memory load that takes L cycles. One warp keeps the issue slot busy only m/(m+L) of the time. With W warps the best case is about min(1, W·m/(m+L)). So you need roughly (m+L)/m warps to keep it busy. **Occupancy** (resident warps / maximum warps) is limited by registers and shared memory per thread block, so using more registers per thread can *lower* performance by reducing warps. A cycle-level simulator makes this concrete: every cycle, pick one ready warp, issue its next instruction, and if it is a load, mark it busy until cycle + L. Count issued cycles / total cycles. Real simulators add many more details: several schedulers per SM, a scoreboard for register dependencies, cache hit rates, memory bandwidth limits and bank conflicts. The method doesn't change: model the simple thing exactly, check it against the analytic formula, then add one effect at a time and **validate against silicon** or RTL.",
  analogy: "A single chef with several pots. While one pot simmers for ten minutes, the chef stirs the others. With enough pots the chef is never idle; with one pot, the chef mostly waits.",
  language: "C++17 · cycle-level warp scheduler with fixed memory latency, checked against the analytic bound",
  primer: {
    text: "GPU designers predict speed with simulators before any chip exists. The key effect is that the GPU switches to another group of threads whenever one is waiting for memory. This lesson builds a tiny cycle-by-cycle simulator and checks it against a simple formula.",
    terms: [
      ["Warp", "A group of 32 GPU threads that execute the same instruction together."],
      ["SM (streaming multiprocessor)", "One GPU core block with its own schedulers, registers and shared memory."],
      ["Latency hiding", "Keeping the hardware busy by running other warps while one waits."],
      ["Occupancy", "Resident warps divided by the maximum the SM can hold."],
      ["Performance model", "A program that predicts how many cycles hardware takes, not just what it computes."],
      ["Scoreboard", "Hardware that tracks which registers are still waiting for results, so dependent instructions stall."],
    ],
  },
  lines: LN(`
#include <cstdint>
#include <vector>

struct Result { uint64_t cycles = 0, issued = 0; double util() const { return cycles ? (double)issued / (double)cycles : 0; } };

// W warps, each runs 'iters' rounds of: m compute instructions, then one load of latency L.
Result simulate(int W, int m, int L, int iters) {
  struct Warp { int pc = 0, round = 0; uint64_t ready_at = 0; };
  std::vector<Warp> w((size_t)W);
  Result r; int done = 0, rr = 0;
  const int per_round = m + 1;                     //@ m compute instructions plus the load itself.
  while (done < W) {
    bool issued = false;
    for (int k = 0; k < W && !issued; k++) {       //@ Greedy-then-oldest: keep issuing from the same warp until it stalls, then move on. Plain round-robin makes warps stall in lockstep.
      Warp &x = w[(size_t)((rr + k) % W)];
      if (x.round >= iters || x.ready_at > r.cycles) continue;
      issued = true; r.issued++; rr = (rr + k) % W;
      if (++x.pc == per_round) {                   //@ That instruction was the load: the warp sleeps for L cycles.
        x.pc = 0; x.ready_at = r.cycles + (uint64_t)L;
        if (++x.round == iters) done++;
      } else {
        x.ready_at = r.cycles + 1;                 //@ A compute instruction: ready again next cycle (no dependency stalls in this model).
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
`),
  storyLesson: {
    scenarioTitle: "The kernel that got slower with more registers",
    scenario: "An engineer unrolls a loop so each thread keeps more values in registers. The kernel does fewer instructions but runs 30% slower on the target GPU.",
    sections: [
      { title: "1 · The occupancy drop", body: "Registers per thread went from 64 to 128. The SM's register file is fixed, so the number of resident warps halved. Each warp still waits about 400 cycles per memory load." },
      { title: "2 · Modelling it", body: "With m = 20 compute instructions per load and L = 400, one warp is busy about 5% of the time. 32 warps reach full use; 16 warps reach only about 80%. The simulator shows the same drop the profiler does." },
      { title: "3 · The fix", body: "Limit registers with launch bounds so occupancy returns, or increase the work per load (larger m) by reusing data from shared memory. Measure both in the model before rewriting the kernel." },
      { title: "4 · Architect's view", body: "The same model answers hardware questions: how much would a bigger register file help, or a cache that cuts L to 200 for this workload? That is what performance models are for." },
    ],
    checkpoint: { prompt: "With m = 9 and L = 50, roughly how many warps do you need to keep the SM busy?", answer: "One warp is busy (m+1)/(m+L) = 10/59 ≈ 17% of the time, so about 6 warps." },
    lab: { title: "Validate the model", brief: "Sweep warps and latency, compare the simulator to the formula, then add one effect.", steps: ["Run W = 1..32 for m = 9, L = 50 and plot utilization", "Overlay the analytic bound and explain any gap", "Add a second scheduler per SM and see what changes", "Add a bandwidth limit (at most one load issued every k cycles)", "Write down which effect you'd validate against real hardware first"], doneWhen: "The simulator matches the bound within a few percent before you add effects, and you can explain each change after." },
  },
  exercise: "A team proposes doubling the L2 cache for the next GPU. How would you use a performance model to decide whether it's worth the area?",
  answerHint: "Workloads, what the cache changes (latency, hit rate), the model, validation, the decision.",
  expected: ["simulator", "workload", "latency", "occupancy", "validate", "trace"],
  modelAnswer: "Pick representative workloads and capture memory traces. In the performance model and simulator, a bigger L2 raises the hit rate, which lowers average memory latency and DRAM bandwidth use. Run the traces with both cache sizes and see how much the reduced latency matters given each kernel's occupancy and latency hiding: kernels that already hide latency gain little. Validate the baseline model against current silicon first so the predicted gain is trusted. Compare the speedup per mm² with other uses of the same area.",
  pitfalls: [
    "Trusting a model that was never checked against real hardware.",
    "Assuming more registers per thread is always faster.",
    "Modelling every effect at once, so you can't tell which one matters.",
    "Using one benchmark instead of a representative workload set.",
  ],
  probes: [
    ["L1 · What is a warp?", "32 threads that execute one instruction together on an SM."],
    ["L2 · Why can higher occupancy help?", "More resident warps means more candidates to issue while others wait for memory."],
    ["L3 · When does higher occupancy stop helping?", "When the pipeline is already full, or when the limit is memory bandwidth rather than latency; then extra warps just queue."],
    ["L4 · How do you validate a cycle model?", "Microbenchmarks that isolate one effect (latency, bandwidth, bank conflicts), compared with silicon counters; then correlation across a workload suite with an error budget."],
  ],
  poly: "You have tuned firmware loops against cycle counts and DMA latency on SoCs. GPU performance modelling uses the same reasoning (what's waiting on what) at the scale of thousands of threads.",
  why: "The GPU Architect posting asks for simulator and performance-model software. A tiny, correct model that you can extend one effect at a time is how architects reason.",
  companies: ["NVIDIA", "AMD", "Apple", "Qualcomm", "Google"],
  myth: { myth: "GPU code is fast because GPUs have more cores.", reality: "GPUs are fast because they hide memory latency by switching between many warps; without enough ready warps they stall like any processor." },
  interviewTip: "Write the one-line formula (W·(m+1)/(m+L), capped at 1) before drawing pipelines. It shows you can reason from first principles and then refine.",
},
{
  title: "Computational geometry for chip layouts: rectangle-union sweeps and tiling with halos for distributed processing",
  sim: "tiling",
  snippet: "lesson_37_3.cpp",
  jobs: jobs(["nvatg", "POSTED (JR2014995): 'computational methods for semiconductor manufacturing and design', 'massively distributed computing, computational geometry', scaling to 'millions of compute hours' and 'petabytes of data'."], ["orapmts", "INFERRED: distributed data-parallel processing at OCI scale uses the same partition-with-overlap pattern."]),
  concept: "A modern chip layout is billions of polygons, mostly **rectilinear** (all edges horizontal or vertical). Manufacturing steps such as optical proximity correction, design-rule checks and lithography simulation are geometry computations over these shapes. **Computational lithography** is the NVIDIA cuLitho area. Two ideas carry most of the weight. **Sweep lines**: to compute the area covered by a set of overlapping rectangles, sort the x-edges and sweep left to right. Between two consecutive x values, the covered length on the y-axis is constant, so area = Σ covered_y × Δx. With **coordinate compression** and a counter per y-interval, this is O(n²) simply or O(n log n) with a segment tree. **Tiling with halos**: one layout is far too big for one machine, so cut it into tiles and process tiles in parallel (on GPUs, across a cluster). An operation that looks at neighbours within distance r (an optical kernel's radius, a spacing rule) needs shapes from just outside the tile. So each worker reads its tile plus a **halo** of width r, computes, and **keeps only results inside its core tile**. That gives exactly the same answer as a single huge run, which you can test. The trade-offs are classic distributed-systems ones. Smaller tiles mean more parallelism but more halo overhead: the ratio is about 4r/T for tile side T. Uneven density causes **stragglers**, so split dense tiles further. And because jobs run for millions of compute hours, tiles must be **idempotent** and restartable.",
  analogy: "Painting a huge mural with a team. Each painter owns one square but needs to see a strip of the neighbours' squares to blend the edges, and only paints inside their own square.",
  language: "C++17 · sweep-line union area, and a tiled run with halos that must match the single-run answer",
  primer: {
    text: "Chip designs are huge collections of rectangles. Many calculations, like how much area is covered, need careful sweeping across the shapes. To run on many machines, the design is cut into tiles, and each tile also reads a thin border from its neighbours. This lesson checks that the tiled answer matches the single-run answer.",
    terms: [
      ["Rectilinear polygon", "A shape whose edges are all horizontal or vertical, typical in chip layouts."],
      ["Sweep line", "An algorithm that moves an imaginary line across the plane and updates a running state at each event."],
      ["Coordinate compression", "Replacing coordinates by their rank among all distinct values, so arrays can be indexed by them."],
      ["Tile", "One rectangular piece of a large layout processed independently."],
      ["Halo", "An extra border around a tile, copied from neighbours, so local operations near the edge see everything they need."],
      ["Computational lithography", "Simulating and correcting how patterns print on silicon, a huge geometry and optics workload."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <cstdint>
#include <vector>

struct Rect { int64_t x1, y1, x2, y2; };            //@ Half-open: covers [x1,x2) × [y1,y2).

// Area covered by the union of rectangles: sweep in x, count coverage per compressed y-interval.
int64_t union_area(const std::vector<Rect> &rs) {
  std::vector<int64_t> ys;
  struct Ev { int64_t x; int d; int64_t y1, y2; };
  std::vector<Ev> ev;
  for (const Rect &r : rs) {
    if (r.x1 >= r.x2 || r.y1 >= r.y2) continue;
    ys.push_back(r.y1); ys.push_back(r.y2);
    ev.push_back({r.x1, +1, r.y1, r.y2}); ev.push_back({r.x2, -1, r.y1, r.y2});
  }
  std::sort(ys.begin(), ys.end()); ys.erase(std::unique(ys.begin(), ys.end()), ys.end());
  std::sort(ev.begin(), ev.end(), [](const Ev &a, const Ev &b) { return a.x < b.x; });
  std::vector<int> cover(ys.size(), 0);             //@ cover[i] = how many rectangles cover the y-interval [ys[i], ys[i+1]).
  int64_t area = 0, prev_x = ev.empty() ? 0 : ev[0].x;
  for (const Ev &e : ev) {
    int64_t len = 0;
    for (size_t i = 0; i + 1 < ys.size(); i++) if (cover[i] > 0) len += ys[i + 1] - ys[i];
    area += len * (e.x - prev_x);                   //@ Covered length is constant between consecutive x events.
    prev_x = e.x;
    size_t a = (size_t)(std::lower_bound(ys.begin(), ys.end(), e.y1) - ys.begin());
    size_t b = (size_t)(std::lower_bound(ys.begin(), ys.end(), e.y2) - ys.begin());
    for (size_t i = a; i < b; i++) cover[i] += e.d;
  }
  return area;
}

static Rect clip(const Rect &r, const Rect &w) {
  return {std::max(r.x1, w.x1), std::max(r.y1, w.y1), std::min(r.x2, w.x2), std::min(r.y2, w.y2)};
}

// Tiled run: each worker gets the shapes touching its tile + halo, computes, and keeps only its core.
int64_t tiled_union_area(const std::vector<Rect> &rs, int64_t W, int64_t H, int64_t T, int64_t halo) {
  int64_t total = 0;
  for (int64_t tx = 0; tx < W; tx += T)
    for (int64_t ty = 0; ty < H; ty += T) {
      Rect core{tx, ty, std::min(tx + T, W), std::min(ty + T, H)};
      Rect ext{core.x1 - halo, core.y1 - halo, core.x2 + halo, core.y2 + halo};
      std::vector<Rect> local;
      for (const Rect &r : rs) {
        Rect c = clip(r, ext);
        if (c.x1 < c.x2 && c.y1 < c.y2) local.push_back(c);   //@ The worker only sees what's inside its extended window.
      }
      std::vector<Rect> kept;
      for (const Rect &r : local) kept.push_back(clip(r, core));  //@ Keep results only inside the core, so nothing is counted twice.
      total += union_area(kept);
    }
  return total;
}
`),
  storyLesson: {
    scenarioTitle: "The tile seams that showed up on the wafer",
    scenario: "A distributed lithography-correction job splits a layout into tiles across a GPU cluster. Results look right in each tile, but checks find mismatched corrections along tile boundaries.",
    sections: [
      { title: "1 · The cause", body: "The correction at a point depends on all shapes within the optical radius r. Workers read only their own tile, so shapes just across the boundary were invisible and edge corrections were computed from incomplete data." },
      { title: "2 · The fix: halos", body: "Each worker now reads its tile plus a halo of width r, computes, and writes only results inside its core. The seams disappear, and a regression test checks that the tiled output equals a single-tile run on small layouts." },
      { title: "3 · The cost", body: "With tile side T and halo r, extra work is about 4r/T. Tiles that are too small waste time on halos; tiles that are too large reduce parallelism and make stragglers worse. Dense regions get split further." },
      { title: "4 · At scale", body: "Tiles are idempotent tasks with content-addressed inputs, so a failed task is just rerun. Progress, retries and straggler detection are what keep a million-GPU-hour job on schedule." },
    ],
    checkpoint: { prompt: "Why must each worker keep only results inside its core tile, even though it computed results in the halo too?", answer: "Halo results are computed with incomplete neighbourhoods and would also be produced by the neighbour; keeping only the core avoids both wrong values and double counting." },
    lab: { title: "Prove the tiling is exact", brief: "Generate random rectangles and check that tiled and single runs agree.", steps: ["Generate 200 random rectangles in a 1000×1000 window", "Compute union_area directly", "Compute tiled_union_area for T = 100, 250, 1000 and halo 0 and 50", "Show they all match (union area is local, so halo 0 works here)", "Explain why an operation with radius r would need halo ≥ r"], doneWhen: "All tiled results equal the direct result, and you can state the halo rule for neighbourhood operations." },
  },
  exercise: "Design a system that runs a geometry operation with interaction radius r over a 10-petabyte layout database on a GPU cluster.",
  answerHint: "Partitioning, halo, keep-core rule, load balance, retries, verification.",
  expected: ["tile", "halo", "core", "straggler", "idempotent", "verify"],
  modelAnswer: "Partition the layout into tiles sized so each fits GPU memory, and give each task its tile plus a halo of width at least r so edge results see all neighbours. Each task writes only results inside its core tile, so nothing is double counted. Balance load by splitting dense tiles, and detect stragglers and rerun them speculatively. Tasks are idempotent with content-addressed inputs and outputs, so retries are safe. Verify by comparing tiled and single-run results on sample regions, and track halo overhead (about 4r/T).",
  pitfalls: [
    "Halo smaller than the interaction radius, creating seams.",
    "Keeping halo results, which double counts or uses incomplete data.",
    "Uniform tiles on very uneven layouts, creating stragglers.",
    "No exactness test comparing tiled and untiled results.",
  ],
  probes: [
    ["L1 · What does a sweep line keep track of?", "The active intervals crossing the line, updated at each event."],
    ["L2 · Why compress coordinates?", "So intervals can be indexed by rank in arrays or trees instead of by raw coordinates."],
    ["L3 · How do you choose tile size?", "Balance GPU memory, parallelism and halo overhead (≈4r/T); split dense areas adaptively."],
    ["L4 · How would you make the per-tile union faster on a GPU?", "Rasterize to bitmaps at the needed resolution, or sort events in parallel and use a segment tree per tile; batch many small tiles per kernel launch."],
  ],
  poly: "Splitting a video frame into tiles for parallel encoding, with overlap for motion search, is the same pattern. You already think about seams at tile boundaries.",
  why: "NVIDIA's ATG posting names computational geometry and massively distributed computing at petabyte scale. Sweep lines and halo tiling are the building blocks.",
  companies: ["NVIDIA", "Synopsys", "Cadence", "Google", "Oracle"],
  myth: { myth: "Splitting a big geometry problem into tiles always changes the answer at the edges.", reality: "With a halo at least as wide as the interaction radius and a keep-core rule, the tiled answer is exact." },
  interviewTip: "State the exactness test (tiled equals untiled) out loud. It shows you design distributed systems you can verify.",
},
];
