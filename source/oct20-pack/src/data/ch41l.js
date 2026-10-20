import { jobs } from "./jobs.js";
import { LN } from "../helpers.js";

export const L41 = [
{
  title: "Map search on constrained devices: grid spatial indexes, nearest-neighbour rings and compact prefix search",
  sim: "mapsearch",
  snippet: "lesson_41_1.cpp",
  jobs: jobs(["garminmap", "POSTED (mirror of careers.garmin.com/jobs/19608): 'map search performance and capability across millions of embedded devices from wearables to cycling computers'; 'memory optimization'; desired 'data compression, tiling, indexing, or spatial data systems'."], ["garmin", "INFERRED likely match: embedded C/C++ for outdoor navigation products; algorithmic solutions and performance."]),
  concept: "A watch has little memory, slow storage and a small battery. Map search must still answer \"nearest water fountain\" or \"cafés starting with *Ber*\" in well under a second. Two ideas do most of the work. **Spatial indexing**: a naive search checks every point of interest (POI): O(n) per query and far too many flash reads. A **uniform grid** buckets POIs by cell (cell = floor(x / size), floor(y / size)). A nearest-neighbour query searches the query's cell, then **rings** of cells around it, and stops once the best distance found is smaller than the distance to the next ring. That's exact and usually touches a handful of cells. **Quadtrees** adapt cells to density (dense cities, empty deserts). **R-trees** index rectangles such as roads and areas. **Geohash** or **Z-order (Morton) codes** turn 2-D cells into 1-D keys, so nearby places sort near each other on flash, and that's how map data is **tiled**. **Compact prefix search**: name lookup over sorted strings uses binary search (lower_bound on the prefix) and needs no extra memory. Tries are faster but use more memory unless compressed. Front coding (store only the suffix that differs from the previous word) shrinks sorted name lists a lot. **Memory budget thinking** separates senior answers: estimate bytes per POI (coordinates as 32-bit integers in fixed units instead of doubles, an index into a string table instead of a pointer), count the flash pages a query reads, and keep the hot index in RAM while records stay on flash. Integer squared distances avoid floating point and square roots on small cores.",
  analogy: "Finding the nearest café in a city laid out in blocks. Check your own block, then the ring of blocks around it, then the next ring, and stop once the closest café you've found is nearer than any block you haven't checked.",
  language: "C++17 · uniform grid index with exact ring-expanding nearest neighbour, and prefix search on a sorted name table",
  primer: {
    text: "Garmin devices search maps with very little memory and power. Instead of checking every place, the map is cut into a grid; a search looks at nearby squares first and spreads outward only as needed. Names are kept sorted so a prefix search is a quick binary search. This lesson builds both.",
    terms: [
      ["POI (point of interest)", "A place on a map, such as a café or water fountain, with coordinates and a name."],
      ["Spatial index", "A structure that finds things by location without checking every item."],
      ["Uniform grid", "Dividing the map into equal squares and listing which POIs fall in each."],
      ["Nearest neighbour (k-NN)", "Finding the closest item, or k closest items, to a point."],
      ["Quadtree / R-tree", "Tree indexes that split space unevenly (quadtree) or group rectangles (R-tree)."],
      ["Z-order / geohash", "Ways to turn a 2-D cell into one number so nearby cells are near each other in storage."],
      ["Front coding", "Compressing a sorted word list by storing only what differs from the previous word."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <cstdint>
#include <cstdlib>
#include <map>
#include <string>
#include <utility>
#include <vector>

struct Poi { int32_t x, y; uint32_t name; };          //@ Integer coordinates (e.g. metres in a local frame): no doubles on a small core.

struct Grid {
  int32_t cell;
  std::map<std::pair<int32_t, int32_t>, std::vector<uint32_t>> cells;   //@ On a device this is a flat sorted array on flash; a map keeps the demo short.
  const std::vector<Poi> *pois;
  Grid(const std::vector<Poi> &p, int32_t c) : cell(c), pois(&p) {
    for (uint32_t i = 0; i < p.size(); i++) cells[{fdiv(p[i].x), fdiv(p[i].y)}].push_back(i);
  }
  int32_t fdiv(int32_t v) const { return v >= 0 ? v / cell : -((-v + cell - 1) / cell); }   //@ Floor division, so negative coordinates land in the right cell.

  // Exact nearest POI to (qx, qy); returns index or -1. 'visited' counts cells probed.
  long nearest(int32_t qx, int32_t qy, int &visited) const {
    visited = 0;
    if (cells.empty()) return -1;
    const int32_t cx = fdiv(qx), cy = fdiv(qy);
    int32_t maxr = 0;                                 //@ Furthest ring that can hold any cell: bounds the loop.
    for (const auto &kv : cells)
      maxr = std::max(maxr, std::max(std::abs(kv.first.first - cx), std::abs(kv.first.second - cy)));
    long best = -1; int64_t bestd = INT64_MAX;
    for (int32_t r = 0; r <= maxr; r++) {
      int64_t ring_min = (int64_t)(r > 0 ? r - 1 : 0) * cell;          //@ Every point in ring r is at least (r-1) cells away.
      if (best >= 0 && ring_min * ring_min > bestd) break;            //@ Stop: nothing in further rings can beat the best found.
      for (int32_t dx = -r; dx <= r; dx++)
        for (int32_t dy = -r; dy <= r; dy++) {
          if (std::max(std::abs(dx), std::abs(dy)) != r) continue;   //@ Only the ring's border cells; inner ones were done.
          auto it = cells.find({cx + dx, cy + dy});
          visited++;
          if (it == cells.end()) continue;
          for (uint32_t i : it->second) {
            int64_t ddx = (int64_t)(*pois)[i].x - qx, ddy = (int64_t)(*pois)[i].y - qy;
            int64_t d = ddx * ddx + ddy * ddy;                         //@ Squared distance: no square root needed to compare.
            if (d < bestd) { bestd = d; best = i; }
          }
        }
    }
    return best;
  }
};

// Prefix search on a sorted name table: binary search, zero extra memory.
std::vector<std::string> prefix(const std::vector<std::string> &sorted, const std::string &p, size_t limit) {
  std::vector<std::string> out;
  auto it = std::lower_bound(sorted.begin(), sorted.end(), p);
  for (; it != sorted.end() && out.size() < limit && it->compare(0, p.size(), p) == 0; ++it) out.push_back(*it);
  return out;
}
`),
  storyLesson: {
    scenarioTitle: "The 'nearest' search that drained the battery",
    scenario: "A new cycling computer firmware adds 'nearest water' search across a whole country's POIs. Searches take three seconds and visibly drain the battery on long rides.",
    sections: [
      { title: "1 · Measuring", body: "Each query scanned all 400,000 POIs from flash, reading thousands of pages. CPU time was small; flash reads and wake time dominated energy." },
      { title: "2 · A grid index", body: "POIs are bucketed into 1 km cells sorted by Z-order on flash. A query reads its cell and expands rings until the best distance beats the next ring. Typical queries touch fewer than 10 cells." },
      { title: "3 · Memory", body: "The cell directory (cell key → flash offset) stays in RAM: a few bytes per non-empty cell. Records stay on flash. Coordinates are 32-bit integers; names are offsets into a front-coded string table." },
      { title: "4 · Result", body: "Median query time drops to under 50 ms and flash reads by about 100×. A test compares the grid answer with a brute-force scan on random queries, so the index is proven exact." },
    ],
    checkpoint: { prompt: "Why can the ring search stop before checking every cell?", answer: "Every POI in a further ring is at least that ring's minimum distance away; once the best found is closer than that, no further POI can win." },
    lab: { title: "Prove it's exact and measure it", brief: "Compare the grid with brute force and tune cell size.", steps: ["Generate 50,000 random POIs and 1,000 random queries", "Check grid nearest equals brute-force nearest for every query", "Record average cells visited for cell sizes 100, 1,000 and 10,000", "Cluster half the POIs in one 'city' and repeat", "Estimate RAM for the cell directory and bytes per POI on flash"], doneWhen: "Grid and brute force agree on every query, and you can justify a cell size with numbers." },
  },
  exercise: "Design 'search nearby' and 'search by name' for a wearable with 256 KB of RAM for the app and 4 million POIs on flash.",
  answerHint: "Index type, cell sizing, layout on flash, RAM budget, name index, exactness test, energy.",
  expected: ["grid", "ring", "flash", "memory", "prefix", "z-order"],
  modelAnswer: "Use a spatial index: a uniform grid or a quadtree for uneven density, with cells laid out in Z-order on flash so nearby cells are near each other. Keep only the cell directory in RAM within the memory budget, and read records from flash on demand. Nearest search expands rings of cells and stops when the best distance beats the next ring, using integer squared distances. Name search is a prefix binary search over a sorted, front-coded string table. Prove exactness against brute force on random queries, and measure flash reads and energy per query, not just time.",
  pitfalls: [
    "Scanning all POIs per query.",
    "Stopping the ring search too early (inexact) or never (slow).",
    "Doubles and square roots on a small core.",
    "Pointer-heavy structures that blow the RAM budget.",
  ],
  probes: [
    ["L1 · Why bucket POIs into cells?", "So a query only reads POIs near it."],
    ["L2 · Grid vs quadtree?", "A grid is simple and fast for even density; a quadtree adapts to dense cities and empty areas."],
    ["L3 · How do you return the k nearest instead of one?", "Keep a max-heap of size k and stop when the k-th best distance beats the next ring's minimum."],
    ["L4 · How do you update map data on millions of devices?", "Versioned tiles with deltas, signed packages, A/B storage for the map region, and index rebuilds done offline so devices only swap files."],
  ],
  poly: "Your firmware already works within tight RAM and flash budgets. Map search adds a spatial algorithm on top of the same 'count the bytes and the reads' habit.",
  why: "Garmin's Map Navigation posting asks for search algorithms on structured datasets, memory optimization, and tiling, indexing and spatial data systems.",
  companies: ["Garmin", "Apple", "Google", "Uber", "Tesla"],
  myth: { myth: "On small devices you can't do clever search, so you scan.", reality: "A grid or quadtree index with a small RAM directory makes queries touch a handful of cells." },
  interviewTip: "State the stopping rule precisely and offer the brute-force equality test. Exactness plus a memory estimate is what a senior answer looks like.",
},
{
  title: "Safety-critical avionics software: DO-178C objectives, MC/DC coverage and partitioned RTOS scheduling",
  sim: "mcdc",
  snippet: "lesson_41_2.cpp",
  jobs: jobs(["rtx", "POSTED (mirror of the RTX posting): 'aircraft embedded software applications'; preferred 'embedded high-criticality Real-Time Operating Systems (RTOS) such as Green Hills Software (GHS) INTEGRITY or WindRiver VxWorks'; 'safety critical programs … DO-178, DO-254, DO-330, DO-331, DO-332'; 'timing analysis'."], ["tegra", "POSTED (JR2011818): ISO 26262, CERT-C and MISRA-C a plus."]),
  concept: "Aircraft software is certified under **DO-178C**, *Software Considerations in Airborne Systems and Equipment Certification*. Each function is assigned a **Design Assurance Level (DAL)** from A to E by how bad a failure would be: A is catastrophic, E is no safety effect. Higher levels require more **objectives**, many satisfied with **independence** (someone else verifies). The process is **requirements-driven**: high-level requirements → low-level requirements → code, with **bidirectional traceability**. Every requirement has tests, every line of code traces to a requirement, and nothing is untraced (no dead or extra code). **Structural coverage** proves the requirement-based tests exercised the code: statement coverage for Level C, plus decision coverage for B, plus **MC/DC (modified condition/decision coverage)** for A. MC/DC means every condition in a decision has been shown to **independently affect the outcome**: there is a pair of tests that differ only in that condition and give different results. For a decision with n conditions, MC/DC needs at least n+1 tests (versus 2ⁿ for all combinations). Supplements cover tools (**DO-330** tool qualification), model-based development (**DO-331**) and object-oriented technology (**DO-332**). **Partitioning**: avionics often runs several applications of different DALs on one processor, under an **ARINC 653** RTOS such as INTEGRITY-178 or VxWorks 653. Each partition gets fixed memory and fixed **time windows** in a repeating **major frame**, so a fault or overrun in one can't starve another. **Timing analysis** shows each task's worst-case execution time (WCET) fits its window. Coding standards such as MISRA C/C++ remove undefined behaviour. In interviews for these roles, explaining MC/DC precisely and showing traceability habits stands out more than any algorithm.",
  analogy: "Proving each switch on a cockpit panel actually matters: for every switch, show two flights identical except for that switch, where the outcome changes. If you can't, either the switch is useless or your tests are.",
  language: "C++17 · find MC/DC independence pairs for each condition of a decision from a test set",
  primer: {
    text: "Aircraft software must be certified. Every requirement is tested and every line traces back to a requirement. For the most critical code, you must prove each condition in a decision can change the result on its own. This lesson writes the checker for that last rule (MC/DC) and explains how flight software shares a processor safely.",
    terms: [
      ["DO-178C", "The standard used to certify airborne software."],
      ["DAL (Design Assurance Level)", "A to E: how severe a failure would be, which sets how much evidence is required."],
      ["Traceability", "Links from requirements to code to tests, in both directions."],
      ["MC/DC", "Modified condition/decision coverage: each condition shown to independently change a decision's outcome."],
      ["Independence pair", "Two tests that differ only in one condition and give different decision results."],
      ["ARINC 653", "A standard for partitioned RTOSes: fixed memory and time windows per application."],
      ["WCET", "Worst-case execution time: the longest a task can take, proven by analysis or measurement."],
    ],
  },
  lines: LN(`
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
        if (diffs == 1 && where == c && d(tests[i]) != d(tests[j])) {   //@ Only condition c changed, and the outcome changed: c independently matters.
          out.push_back({c, i, j}); found = true;
        }
      }
  }
  return out;
}

bool has_mcdc(const Decision &d, const std::vector<Vec> &tests, int n) {
  return (int)mcdc_pairs(d, tests, n).size() == n;    //@ Every condition needs its own independence pair.
}

// Partition schedule check (ARINC 653 style): windows inside one major frame must not overlap and must fit.
struct Window { int partition; uint32_t start_us, len_us; };
bool schedule_ok(const std::vector<Window> &w, uint32_t major_us) {
  for (size_t i = 0; i < w.size(); i++) {
    if (w[i].start_us + w[i].len_us > major_us) return false;
    for (size_t j = i + 1; j < w.size(); j++) {
      bool disjoint = w[i].start_us + w[i].len_us <= w[j].start_us || w[j].start_us + w[j].len_us <= w[i].start_us;
      if (!disjoint) return false;                    //@ Overlapping windows would let one partition steal another's time.
    }
  }
  return true;
}
`),
  storyLesson: {
    scenarioTitle: "The condition nobody could prove mattered",
    scenario: "A Level A display function has the decision (weight_on_wheels && !override) || maintenance_mode. Requirement-based tests pass, but the coverage tool reports MC/DC is missing for one condition.",
    sections: [
      { title: "1 · Finding the gap", body: "The tests never had a pair that differed only in override and changed the outcome, because every test with weight_on_wheels true also had maintenance_mode true, masking the effect." },
      { title: "2 · Back to requirements", body: "Instead of writing a test just to hit coverage, the team asks which requirement describes override's behaviour when not in maintenance mode. The requirement existed, but its test case was incomplete; a new requirement-based test closes the gap." },
      { title: "3 · Why not 2ⁿ tests", body: "Three conditions need at least four tests for MC/DC, not eight. Choosing the pairs deliberately keeps the test set small and every test traceable." },
      { title: "4 · Partitioning and timing", body: "The display partition runs in a fixed 5 ms window of a 25 ms major frame. WCET analysis shows the function fits with margin, so an overrun elsewhere can't delay it." },
    ],
    checkpoint: { prompt: "What's the minimum number of tests for MC/DC on a decision with n independent conditions?", answer: "n + 1 (versus 2ⁿ for all combinations)." },
    lab: { title: "Build an MC/DC test set", brief: "Design minimal MC/DC tests for real decisions and check them with the code.", steps: ["Write the truth table for (a && !b) || c", "Pick four tests that give an independence pair for a, b and c", "Run has_mcdc on them, then remove one test and see which condition loses its pair", "Repeat for a 4-condition decision", "Write a partition schedule for three partitions in a 25 ms major frame and check it"], doneWhen: "Each decision reaches MC/DC with n+1 tests, and the schedule passes the overlap check." },
  },
  exercise: "You join an avionics team writing Level A software. Explain how you'd develop and verify one new function from requirement to certification evidence.",
  answerHint: "DAL, requirements, traceability, reviews, tests, structural coverage, MC/DC, independence, tools, partitioning, WCET.",
  expected: ["requirements", "traceability", "mc/dc", "independence", "partition", "wcet"],
  modelAnswer: "Start from high-level requirements derived from the system safety assessment; at DAL A, write low-level requirements and code with bidirectional traceability, under a coding standard. Reviews and verification activities are done with independence. Requirement-based tests come first, then structural coverage analysis: statement, decision and MC/DC at Level A, where each condition has an independence pair. Gaps lead back to requirements, not to tests written only for coverage. Use qualified tools (DO-330). The function runs in an ARINC 653 partition with fixed memory and time windows, and WCET analysis shows it fits its window.",
  pitfalls: [
    "Writing tests only to hit coverage without a requirement behind them.",
    "Confusing decision coverage with MC/DC.",
    "Untraced code (dead or extra) left in the build.",
    "Assuming average execution time proves timing.",
  ],
  probes: [
    ["L1 · What does DAL A mean?", "A failure could be catastrophic; it requires the most objectives, with independence."],
    ["L2 · What does MC/DC require?", "Each condition shown to independently affect the decision outcome."],
    ["L3 · What does an ARINC 653 partition guarantee?", "Fixed memory and fixed time windows, so faults and overruns don't propagate between applications."],
    ["L4 · How do you qualify a code generator or coverage tool?", "Under DO-330 by its Tool Qualification Level: tool requirements, verification of the tool, and configuration management, or verify its output independently instead."],
  ],
  poly: "You've shipped firmware with code reviews and test plans; DO-178C makes those formal and traceable, and adds MC/DC as the proof that your tests reached every condition.",
  why: "RTX's posting prefers DO-178/DO-254 experience, high-criticality RTOSes (INTEGRITY, VxWorks) and timing analysis. MC/DC and partitioning are the concepts behind those words.",
  companies: ["RTX", "Lockheed Martin", "Boeing", "Honeywell", "Garmin"],
  myth: { myth: "100% decision coverage is the strictest coverage there is.", reality: "MC/DC is stricter: every condition must be shown to independently change the outcome." },
  interviewTip: "Give the n+1 rule and walk one independence pair on a whiteboard. It's the clearest signal you've done DO-178C work or understand it.",
},
{
  title: "MIL-STD-1553 data buses: command and status words, bus timing and building a cyclic message schedule",
  sim: "bus1553",
  snippet: "lesson_41_3.c",
  jobs: jobs(["rtx", "POSTED (mirror): preferred 'Experience with Ethernet and MIL-STD-1553 protocols and associated analysis tools (e.g., Wireshark and AltaView)'; 'software optimization techniques and timing analysis to ensure real-time operation'; 'driver development … TCP/IP, UDP, serial, USB and PCI'."]),
  concept: "**MIL-STD-1553B** is the command/response data bus used on military aircraft since the 1970s, still everywhere for its determinism. It runs at **1 Mbit/s** over a dual-redundant twisted pair (buses A and B). One **bus controller (BC)** commands up to **31 remote terminals (RTs)**; no RT speaks unless asked. There are three 20-bit word types (3-bit sync, 16 data bits, 1 parity bit), so each word takes **20 µs**. The **command word** packs RT address (5 bits), transmit/receive (1), subaddress or mode (5) and word count or mode code (5). A word count of 0 means 32 words, and subaddress 0 or 31 means a **mode code** (e.g. synchronize, transmit status). The **status word** carries the RT address and flags: message error, service request, busy, subsystem flag, terminal flag. **Data words** carry up to 32 × 16-bit values. A BC→RT transfer is command + data words, then after a short **response time** (4–12 µs) the RT's status word, then an **intermessage gap**. So message time is about 20·(n+2) µs plus gaps. Bus software is a **cyclic schedule**. Messages repeat at fixed rates (e.g. 50 Hz attitude, 10 Hz fuel). The BC runs a **major frame** (often 1 s or the least common multiple of the periods) made of **minor frames** (e.g. 20 ms at 50 Hz). A message at rate r appears every (minor-rate / r) minor frames, and each minor frame's total bus time must fit with margin, which is a direct timing analysis. **Offsets** spread slow messages across minor frames to balance load. Engineers check traffic with analysers (AltaView, as the posting mentions) the way Ethernet engineers use Wireshark.",
  analogy: "A strict classroom teacher who calls on students by number. A student speaks only when called, says exactly how many sentences were asked for, then confirms with a fixed reply. The lesson plan repeats every period, and the teacher spreads the long questions across the week so no period runs over.",
  language: "C11 · encode/decode command and status words, estimate message time, and build a rate-based minor-frame schedule",
  primer: {
    text: "Military aircraft connect their computers with a bus where one controller asks and each device only answers when asked. Every message takes a precise time, so the controller follows a fixed timetable that repeats. This lesson encodes the bus words and builds that timetable, checking that nothing runs over.",
    terms: [
      ["MIL-STD-1553B", "A 1 Mbit/s, dual-redundant command/response data bus used in military aircraft."],
      ["Bus controller (BC)", "The one device that starts every message on the bus."],
      ["Remote terminal (RT)", "A device on the bus (up to 31) that answers the BC."],
      ["Command / status / data word", "The three 20-bit word types: what to do, how it went, and the values."],
      ["Subaddress", "A 5-bit field choosing which buffer or function inside the RT a message is for."],
      ["Major / minor frame", "The repeating schedule period (major) made of fixed slots (minor)."],
      ["Mode code", "A special command for bus management, such as synchronize or transmit status."],
    ],
  },
  lines: LN(`
#include <stdint.h>

/* Command word, 16 data bits (MSB first on the wire): RT(5) T/R(1) SA(5) WC(5). WC 0 means 32 words. */
uint16_t cmd_encode(unsigned rt, int transmit, unsigned sa, unsigned wc) {
  return (uint16_t)(((rt & 31u) << 11) | ((transmit ? 1u : 0u) << 10) | ((sa & 31u) << 5) | (wc & 31u));
}
typedef struct { unsigned rt, transmit, sa, words, mode; } Cmd;
Cmd cmd_decode(uint16_t w) {
  Cmd c;
  c.rt = (w >> 11) & 31u; c.transmit = (w >> 10) & 1u; c.sa = (w >> 5) & 31u;
  c.mode = (c.sa == 0 || c.sa == 31);              //@ Subaddress 0 or 31 means the low 5 bits are a mode code, not a word count.
  c.words = c.mode ? 0 : ((w & 31u) ? (w & 31u) : 32u);   //@ Word count 0 encodes 32 data words.
  return c;
}

/* Status word flags (bit 1 = MSB in the standard's numbering). */
enum { ST_MSG_ERROR = 1 << 10, ST_SERVICE_REQ = 1 << 8, ST_BUSY = 1 << 3, ST_SUBSYS = 1 << 2, ST_TERMINAL = 1 << 0 };
int status_ok(uint16_t st, unsigned expect_rt) {
  if (((st >> 11) & 31u) != expect_rt) return 0;   //@ Wrong RT answered: treat as a bus error and retry on the other bus.
  return (st & (ST_MSG_ERROR | ST_BUSY | ST_SUBSYS | ST_TERMINAL)) == 0;
}

/* Approximate BC->RT message time: command + n data + status, 20 us each, plus response time and gap. */
unsigned msg_time_us(unsigned n_words, unsigned response_us, unsigned gap_us) { return 20u * (n_words + 2u) + response_us + gap_us; }

typedef struct { unsigned rate_hz, words, offset; } Msg;

/* Fill per-minor-frame bus time. minor_hz is the minor frame rate; each rate must divide it.
   Returns 0 if any frame exceeds capacity_us, else 1. load[] has minor_hz entries (one major frame = 1 s). */
int build_schedule(const Msg *m, int n, unsigned minor_hz, unsigned capacity_us, unsigned *load) {
  for (unsigned f = 0; f < minor_hz; f++) load[f] = 0;
  for (int i = 0; i < n; i++) {
    if (m[i].rate_hz == 0 || minor_hz % m[i].rate_hz) return 0;   //@ Rates that don't divide the minor rate can't be scheduled cyclically.
    unsigned every = minor_hz / m[i].rate_hz;
    for (unsigned f = m[i].offset % every; f < minor_hz; f += every) load[f] += msg_time_us(m[i].words, 12, 4);
  }
  for (unsigned f = 0; f < minor_hz; f++) if (load[f] > capacity_us) return 0;   //@ The timing analysis: every minor frame must fit.
  return 1;
}
`),
  storyLesson: {
    scenarioTitle: "The minor frame that ran long",
    scenario: "After adding a new 10 Hz sensor message, a bus analyser shows the BC occasionally starting the next minor frame late, and a 50 Hz attitude message jitters.",
    sections: [
      { title: "1 · The load table", body: "All 10 Hz and 5 Hz messages had offset 0, so they landed in the same minor frame as every 50 Hz message. That frame needed 19.2 ms of a 20 ms slot, and the new message pushed it over." },
      { title: "2 · Spreading with offsets", body: "Giving the slow messages different offsets spreads them across the five or ten minor frames in their period. The worst frame drops to 11 ms, and the schedule check passes with margin." },
      { title: "3 · Checking on the wire", body: "The analyser capture now shows every 50 Hz message starting at the same offset within its minor frame, so the jitter is gone." },
      { title: "4 · Evidence", body: "The schedule table and worst-case frame time become part of the timing analysis record, re-run whenever a message is added." },
    ],
    checkpoint: { prompt: "A BC→RT message has 16 data words, 12 µs response time and a 4 µs gap. About how long does it take?", answer: "20 × (16 + 2) + 12 + 4 = 376 µs." },
    lab: { title: "Schedule a bus", brief: "Build a 50 Hz minor-frame schedule for a realistic message list.", steps: ["List 10 messages at 50, 25, 10 and 5 Hz with 2–32 words", "Run build_schedule with all offsets 0 and record the worst frame", "Assign offsets to balance load and rerun", "Encode the command word for RT 5, receive, subaddress 3, 32 words and decode it", "Check a status word with the busy bit set"], doneWhen: "The schedule passes with at least 20% margin in every minor frame and you can explain your offsets." },
  },
  exercise: "You're the bus controller software lead for a new avionics integration. How do you design and verify the 1553 schedule?",
  answerHint: "Message list, rates, minor/major frames, timing per message, offsets, margins, redundancy, verification on the wire.",
  expected: ["minor frame", "major frame", "rate", "offset", "margin", "analyzer"],
  modelAnswer: "Collect every message with its rate, word count and direction. Pick a minor frame rate that all rates divide (e.g. 50 Hz) and a major frame (1 s or the least common multiple of the periods). Compute each message's bus time (20 µs per word plus response time and gap), place each message in the minor frames its rate requires, and use offsets to balance load. Check every minor frame against capacity with a margin, and handle retries on the redundant bus within the margin. Verify on the wire with a bus analyzer, and re-run the timing analysis whenever a message is added.",
  pitfalls: [
    "Putting all slow messages at offset 0.",
    "Forgetting response time and gaps in timing.",
    "No margin for retries on the redundant bus.",
    "Treating word count 0 as zero words instead of 32.",
  ],
  probes: [
    ["L1 · How long is one 1553 word on the wire?", "20 µs: 20 bits at 1 Mbit/s."],
    ["L2 · What does a subaddress of 0 or 31 mean?", "The command is a mode code; the low 5 bits are the mode code, not a word count."],
    ["L3 · How should the BC react to a missing status word?", "Retry on the alternate bus, log the error, and after repeated failures mark the RT degraded per the system's fault-handling requirements."],
    ["L4 · How would you bridge 1553 data to an Ethernet/DDS mission system?", "A gateway that maps subaddresses to typed topics with timestamps, preserves rates and freshness, validates data, and is partitioned so a fault on one side can't stall the other."],
  ],
  poly: "You've written drivers for serial and USB protocols with strict framing and timing. 1553 is a slower, older bus with stricter determinism, and the driver and scheduling skills transfer directly.",
  why: "RTX's posting prefers MIL-STD-1553 and timing analysis experience. Command/status words and cyclic schedules are what that means in practice.",
  companies: ["RTX", "Lockheed Martin", "Northrop Grumman", "BAE Systems", "General Dynamics"],
  myth: { myth: "Old buses are simple, so scheduling them is trivial.", reality: "Every word takes 20 µs and every frame must fit; balancing rates with offsets is real timing analysis." },
  interviewTip: "Do the message-time arithmetic out loud (20 µs per word, plus response and gap). It shows you can reason about determinism, which is the point of the bus.",
},
];
