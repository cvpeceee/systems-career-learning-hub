import { chapter } from "../helpers.js";
import { L41 } from "./ch41l.js";

export const CH41 = chapter({
  id: "embedded-nav-avionics", number: 41, title: "Embedded Navigation & Safety-Critical Avionics: Map Search on Constrained Devices, DO-178C/MC/DC & MIL-STD-1553", shortTitle: "Nav & Avionics",
  duration: "7–9 hours", leverage: false,
  promise: "Make map search fast and exact on a watch-sized budget, explain and check MC/DC like a certification engineer, and build a 1553 bus schedule that provably fits.",
  diagram: "flow", flowStages: ["index", "search", "trace", "cover", "schedule", "verify"],
  captions: [
    "Bucket places into grid cells so searches stay local (spatial index).",
    "Search nearby cells first and stop as soon as nothing closer can exist (ring search).",
    "Link every requirement to code and tests (traceability).",
    "Prove each condition matters on its own (MC/DC).",
    "Fit every bus message into a repeating timetable (minor frames).",
    "Check on the wire and in the numbers (analyser, timing analysis).",
  ],
  phases: [
    { label: "Navigation", title: "Search on a small device", detail: "Grids, rings, prefix search, memory budgets.", lessons: [0] },
    { label: "Certification", title: "Evidence for flight", detail: "DO-178C, traceability, MC/DC, ARINC 653.", lessons: [1] },
    { label: "Buses", title: "Deterministic data", detail: "1553 words, timing, cyclic schedules.", lessons: [2] },
  ],
  lessons: [...L41],
  lab: {
    title: "Capstone: a certifiable navigation function",
    brief: "Design a 'nearest airport' function for an avionics display: index, requirements, MC/DC evidence and bus data.",
    steps: [
      "Index design and RAM/flash budget for 40,000 airports",
      "High-level and low-level requirements for the search, with trace IDs",
      "One decision in the code with an MC/DC test set (n+1 tests)",
      "The partition window and WCET evidence for the function",
      "The 1553 messages it consumes (position, heading) with rates and schedule slots",
    ],
    doneWhen: "Every requirement traces to code and tests, MC/DC is shown for the decision, and the timing fits with margin.",
    starterLang: "Markdown · design + certification notes",
    starter: `# Nearest-airport function
## Index and memory budget
## Requirements (HLR / LLR) with trace IDs
## MC/DC test set
## Partition window and WCET
## 1553 inputs and schedule`,
  },
  quiz: [
    { prompt: "A ring search for the nearest POI can stop when…", options: ["The first POI is found", "The best distance is smaller than the next ring's minimum distance", "Ten cells are checked", "Never"], answer: 1, explanation: "Nothing further can be closer." },
    { prompt: "Why compare squared distances?", options: ["More accurate", "Avoids square roots with the same ordering", "Required by Garmin", "Uses less memory"], answer: 1, explanation: "Monotonic, cheap." },
    { prompt: "MC/DC is required at DO-178C level…", options: ["E", "C", "B", "A"], answer: 3, explanation: "Level A." },
    { prompt: "Minimum tests for MC/DC with 4 conditions?", options: ["4", "5", "8", "16"], answer: 1, explanation: "n + 1." },
    { prompt: "ARINC 653 partitions get…", options: ["Shared memory", "Fixed memory and time windows", "Priority inheritance only", "Unlimited CPU"], answer: 1, explanation: "Space and time partitioning." },
    { prompt: "A 1553 command word with word count 0 means…", options: ["No data", "32 data words", "Error", "Mode code always"], answer: 1, explanation: "0 encodes 32." },
    { prompt: "Scenario: the coverage tool shows a condition lacks MC/DC. Best response?", options: ["Add a test just for coverage", "Find the requirement behind that behaviour and add a requirement-based test", "Delete the condition", "Ignore it"], answer: 1, explanation: "Coverage gaps point to requirements or tests.", scenario: true },
    { prompt: "Scenario: adding a 10 Hz message makes one minor frame overrun. Fix?", options: ["Faster bus", "Use offsets to spread slow messages across minor frames", "Drop the message", "Increase word size"], answer: 1, explanation: "Balance the load.", scenario: true },
  ],
  interviewRoom: {
    title: "Embedded navigation and avionics interview room",
    intro: "Modelled on Garmin's Senior C++ SWE, Map Navigation (POSTED via mirror), Garmin's Senior SWE, C++/C (INFERRED likely match) and RTX's Senior Software Engineer, Indianapolis (POSTED via mirror). Interview formats aren't confirmed here; see the 06 Garmin and Raytheon pages for REPORTED and INFERRED notes.",
    questions: [
      { prompt: "Garmin · Design nearby search for 4 million POIs on a wearable.", answer: "Grid/quadtree index, Z-order on flash, RAM directory only, ring search with exact stop rule, integer distances, k-NN heap, exactness test vs brute force, energy per query." },
      { prompt: "Garmin · Implement autocomplete for place names with tight memory.", answer: "Sorted, front-coded string table with lower_bound prefix search; optionally a small top-level trie or skip index in RAM; rank by distance or popularity after matching." },
      { prompt: "C++ · How do you find a memory leak or fragmentation problem on a device without a full OS?", answer: "Instrumented allocator with tags and high-water marks, static pools for fixed-size objects, periodic heap dumps over debug UART, and host-side unit tests under ASan." },
      { prompt: "RTX · Explain MC/DC and build a test set for (a && b) || c.", answer: "Each condition independently flips the outcome; four tests TTF, FTF, TFF and TFT give pairs for a (TTF/FTF), b (TTF/TFF) and c (TFF/TFT)." },
      { prompt: "RTX · Design a 1553 schedule and prove it fits.", answer: "Message list with rates and words; minor rate divisible by all rates; per-message time 20·(n+2)+response+gap; offsets to balance; per-frame load ≤ capacity with margin for bus-B retries; verify on an analyser." },
    ],
    tasks: [
      { title: "35 minutes · Nearest POI", prompt: "Build a grid index and an exact nearest-neighbour query; prove it against brute force.", rubric: ["Correct cell assignment incl. negatives", "Correct stop rule", "Integer math", "Randomized equality test"] },
      { title: "25 minutes · MC/DC checker", prompt: "Given a decision and test vectors, report which conditions have independence pairs.", rubric: ["Unique-cause pairs", "Correct for all conditions", "n+1 example", "Clear output"] },
      { title: "25 minutes · 1553 words and schedule", prompt: "Encode/decode command words and build a per-minor-frame load table.", rubric: ["Bit layout correct", "WC 0 = 32", "Mode codes handled", "Load check with offsets"] },
    ],
  },
});
