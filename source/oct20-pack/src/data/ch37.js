import { chapter } from "../helpers.js";
import { L37 } from "./ch37l.js";

export const CH37 = chapter({
  id: "silicon-systems-software", number: 37, title: "Silicon Systems Software: SoC Diagnostics, GPU Performance Models & Computational Geometry at Scale", shortTitle: "Silicon SW",
  duration: "8–10 hours", leverage: false,
  promise: "Write diagnostics that find real hardware defects, predict GPU performance with a model you can validate, and split huge geometry jobs across a cluster without changing the answer.",
  diagram: "flow", flowStages: ["model", "stress", "measure", "simulate", "partition", "verify"],
  captions: [
    "Start from how hardware actually breaks (fault models).",
    "Push the chip to its limits of heat, power and bandwidth (stress).",
    "Record exactly where and how a test failed (first-failure logs).",
    "Predict speed before silicon exists (performance model).",
    "Cut an enormous layout into tiles with borders (halos).",
    "Check the distributed answer equals the single-run answer (exactness).",
  ],
  phases: [
    { label: "Diagnostics", title: "Find the broken part", detail: "Fault models, March C-, stress and screening.", lessons: [0] },
    { label: "Architecture", title: "Predict before silicon", detail: "Warps, latency hiding, occupancy, cycle models.", lessons: [1] },
    { label: "Scale", title: "Geometry across a cluster", detail: "Sweep lines, tiling with halos, stragglers.", lessons: [2] },
  ],
  lessons: [...L37],
  lab: {
    title: "Capstone: a bring-up and screening plan for a new SoC module",
    brief: "Write the plan a senior diagnostics engineer would bring to a bring-up review.",
    steps: [
      "Fault models for memory, interconnect and power delivery",
      "Tests per fault model, with runtime per unit and which run on every unit vs a sample",
      "Stress conditions: temperature, voltage, power-virus and bandwidth loads",
      "First-failure log format and how field returns are matched to factory data",
      "One performance-model check that predicts the bandwidth test's expected result",
    ],
    doneWhen: "Every test names the fault it targets, the screen fits a time budget, and failures produce records that point to a cause.",
    starterLang: "Markdown · bring-up plan",
    starter: `# SoC module screening plan
## Fault models
## Tests (per unit / sampled) and time budget
## Stress conditions
## Failure records and field-return matching
## Expected results from the model`,
  },
  quiz: [
    { prompt: "A memory bit always reads 1, whatever you write. This is a…", options: ["Coupling fault", "Stuck-at fault", "Transition fault", "Decoder fault"], answer: 1, explanation: "Stuck-at-1." },
    { prompt: "March C- needs how many operations per cell?", options: ["2", "4", "10", "N²"], answer: 2, explanation: "1+2+2+2+2+1 = 10." },
    { prompt: "Why do march tests walk addresses down as well as up?", options: ["Speed", "To catch coupling faults whose aggressor is above the victim", "To cool the chip", "Cache effects"], answer: 1, explanation: "Direction decides which coupling faults are caught." },
    { prompt: "Each warp computes 9 instructions then waits 50 cycles. About how many warps keep the SM busy?", options: ["1", "6", "32", "50"], answer: 1, explanation: "Busy fraction 10/59 per warp, so about 6." },
    { prompt: "Doubling registers per thread can slow a kernel because…", options: ["Registers are slow", "Fewer warps fit, so less latency hiding", "It disables caches", "Warps get bigger"], answer: 1, explanation: "Occupancy drops." },
    { prompt: "A tiled geometry job with interaction radius r needs a halo of at least…", options: ["0", "r", "T", "r/2"], answer: 1, explanation: "Edge results must see neighbours within r." },
    { prompt: "Scenario: field modules corrupt data after hours under load but pass the bench test. First step?", options: ["Replace the test with random data", "Reproduce under field conditions (heat, load) with targeted march tests and first-failure logs", "Ship a firmware update", "Ignore it"], answer: 1, explanation: "Marginal parts fail at the edges; reproduce them there.", scenario: true },
    { prompt: "Scenario: a tiled lithography job shows seams at tile edges. Likely cause?", options: ["GPU bug", "Halo smaller than the interaction radius, or halo results kept", "Too many tiles", "Network latency"], answer: 1, explanation: "Classic halo error.", scenario: true },
  ],
  interviewRoom: {
    title: "NVIDIA silicon systems software interview room",
    intro: "Modelled on three NVIDIA postings (POSTED): Senior System Software Engineer, Tegra (JR2011805 Diagnostics; also JR2011616 and JR2011818 ATF), Senior GPU Architect (JR2015492) and Senior Systems Software Engineer, Advanced Technology Group (JR2014995). The coding and C/OS question style is in the 06 NVIDIA company page (REPORTED with sources). The design prompts here are INFERRED from the posting duties.",
    questions: [
      { prompt: "Diagnostics · Design a memory screen for a new SoC that fits in 30 seconds per unit.", answer: "Fault models first; March C- on every unit at hot and cold corners if time allows, longer tests on a sample; parallelize across memory controllers; stop on first failure; log element, address, expected/actual; bin by results; tune with field-return data." },
      { prompt: "Debug · A rack of modules shows rare correctable ECC errors that cluster on one memory channel. What do you do?", answer: "Correlate by channel, rank, row and temperature; run targeted march and signal-integrity margin tests on that channel; check board layout and power on that rail; compare lots; decide screen vs replace." },
      { prompt: "Architecture · How would you model the benefit of a new hardware feature before RTL exists?", answer: "Representative workload traces; a performance model that includes the feature as a parameter; validate the baseline on silicon; sweep the parameter; report speedup per area and power, plus confidence." },
      { prompt: "Scale · How do you run a geometry operation on a layout too big for any one machine?", answer: "Tile with halos ≥ interaction radius, keep-core rule, adaptive splitting for dense regions, idempotent retries, verify tiled = untiled on samples." },
      { prompt: "C/C++ · Implement memmove and explain when memcpy is undefined.", answer: "Copy backward when dst > src and the ranges overlap; memcpy on overlapping ranges is undefined behaviour. See 06 problem p87." },
    ],
    tasks: [
      { title: "30 minutes · March test", prompt: "Implement March C- over a memory model and a fault injector; show which element catches each fault type.", rubric: ["Correct element order and directions", "Reports element, address, expected, got", "Tests for stuck-at, transition, coupling both directions", "Explains 10N"] },
      { title: "30 minutes · Warp model", prompt: "Write a cycle simulator for W warps with compute bursts and fixed memory latency; compare with the analytic bound.", rubric: ["One issue per cycle", "Latency modelled correctly", "Matches bound within a few percent", "Explains occupancy limits"] },
      { title: "30 minutes · Rectangle union", prompt: "Compute the area of the union of rectangles; then show a tiled computation matches it.", rubric: ["Sweep with compressed y", "Handles overlaps and touching edges", "Tiling keeps core only", "Randomized equality test"] },
    ],
  },
});
