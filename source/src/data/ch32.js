import { chapter } from "../helpers.js";
import { L32 } from "./ch32l.js";

export const CH32 = chapter({
  id: "gpu-fleet-platform", number: 32, title: "GPU Fleet Platform: Health Triage, Safe Rollouts & Sharing GPUs", shortTitle: "GPU Fleet",
  duration: "7–9 hours", leverage: false,
  promise: "Run a GPU fleet like a platform owner: turn raw hardware errors into drain and repair decisions, ship drivers without outages, and pack workloads so expensive GPUs aren't idle.",
  diagram: "flow", flowStages: ["signals", "triage", "drain", "burn-in", "rollout", "pack"],
  captions: [
    "Each GPU reports errors, counters and temperatures (XID, ECC, NVLink, BMC).",
    "Each signal is sorted into keep, watch, take out or repair (triage rules).",
    "Broken nodes stop taking new work and their work moves away (drain).",
    "Machines are stress tested before they rejoin (burn-in, hysteresis).",
    "New drivers reach a few machines first, then more (waves, health gates).",
    "Small models share cards so less money sits idle (MIG, MPS, packing).",
  ],
  phases: [
    { label: "Health", title: "Know what's broken", detail: "XID triage, ECC and row remapping, NVLink, BMC, hysteresis and burn-in.", lessons: [0] },
    { label: "Change", title: "Change the fleet safely", detail: "Waves, canaries, control groups, blast radius, rollback.", lessons: [1] },
    { label: "Efficiency", title: "Use every GPU", detail: "MIG, MPS, time-slicing, packing and fragmentation.", lessons: [2] },
  ],
  lessons: [...L32],
  lab: {
    title: "Capstone: a GPU platform one-pager",
    brief: "Write the operating plan a principal engineer would present for a 5,000-GPU fleet serving training and inference.",
    steps: [
      "Health pipeline: signals, rules, actions, return-to-service gate",
      "Change management: waves, bake times, gates, rollback for drivers and firmware",
      "Capacity: sharing modes per workload, packing policy, target utilization",
      "Metrics: repeat-failure rate, stranded capacity, GPU utilization, jobs killed by hardware",
      "A quarter's roadmap with the first three milestones",
    ],
    doneWhen: "Each section has a measurable target and the top risk is named with its mitigation.",
    starterLang: "Markdown · platform plan",
    starter: `# GPU platform plan
## Fleet and workloads
## Health and triage
## Rollouts
## Sharing and packing
## Metrics and targets
## Roadmap`,
  },
  quiz: [
    { prompt: "XID 79 usually means…", options: ["An app bug", "The GPU fell off the bus", "A normal reset", "Low memory"], answer: 1, explanation: "It's a hardware or link-level fault; repair path." },
    { prompt: "A pending row remap needs…", options: ["A new GPU", "A GPU reset", "Nothing", "A driver downgrade"], answer: 1, explanation: "The remap takes effect after reset." },
    { prompt: "XID 31 on one GPU across five different jobs suggests…", options: ["Five buggy apps", "A hardware problem", "Network loss", "Normal noise"], answer: 1, explanation: "The common factor is the GPU." },
    { prompt: "Why use a control group in a rollout gate?", options: ["It's faster", "It cancels normal drift in fleet error rates", "It saves money", "It's required by NVIDIA"], answer: 1, explanation: "Compare like with like in the same window." },
    { prompt: "Which gives hardware isolation between tenants?", options: ["Time-slicing", "MPS", "MIG", "CUDA streams"], answer: 2, explanation: "MIG partitions compute and memory." },
    { prompt: "First-fit decreasing places…", options: ["Smallest first", "Largest first", "Random order", "Newest first"], answer: 1, explanation: "Large items are hardest to fit later." },
    { prompt: "Scenario: a driver wave passes after 1 hour, then fails at 6 hours fleet-wide. Main fix?", options: ["More testing in the lab", "Bake times set from past failure onset times", "Skip canaries", "Roll out at night"], answer: 1, explanation: "The bake was shorter than the failure's onset.", scenario: true },
    { prompt: "Scenario: repaired nodes keep failing within days of return. Best fix?", options: ["Repair faster", "Hysteresis plus burn-in before return", "Disable XID logging", "Buy spares"], answer: 1, explanation: "Gate the return path.", scenario: true },
  ],
  interviewRoom: {
    title: "GPU Compute principal interview room",
    intro: "Modeled on Roblox's Principal Software Engineer, GPU Compute posting (POSTED: XID/ECC/NVLink, BMC/Redfish, Go, GPU scheduling, fleet reliability). Interview format for this role is not published; the playbook in chapter 36 lists what public sources report (PUBLIC, unofficial).",
    questions: [
      { prompt: "Design · Build the health and lifecycle system for 10,000 GPUs across on-prem and cloud.", answer: "Agents collect XID, DCGM counters and BMC data; a classifier assigns keep/watch/drain/repair; a lifecycle controller drains through the scheduler, resets or tickets, runs burn-in and returns with hysteresis; metrics track repeat failures and stranded capacity; cloud nodes get replaced rather than repaired." },
      { prompt: "Rollouts · How do you ship a CUDA upgrade to a mixed fleet?", answer: "Compatibility matrix per model and framework; stratified canaries per hardware type; comparative gates; per-pool caps; drain at checkpoint; tested rollback; communication plan with model owners." },
      { prompt: "Efficiency · Utilization is 25%. Where do you look first?", answer: "Break waste down: idle allocations, oversized requests, fragmentation, stragglers, queueing. Fix the biggest bucket first: right-size requests, share small models with MIG or MPS, autoscale replicas, pack." },
      { prompt: "Out-of-band · When is BMC data essential?", answer: "When the OS is hung or the GPU fell off the bus: power draw, temperature and fan status still come through Redfish, and power cycling can be done remotely." },
      { prompt: "Leadership · How would you set the 12-month direction for the GPU platform?", answer: "Start from business goals (model launches, cost), measure current waste and reliability, pick three bets with metrics, get buy-in from ML teams, and review quarterly." },
    ],
    tasks: [
      { title: "45 minutes · Telemetry triage (Go or C++)", prompt: "Parse a CSV of per-GPU samples and XID events and output actions with reasons.", rubric: ["Correct classification", "App vs hardware separation", "Hysteresis", "Tests"] },
      { title: "30 minutes · Rollout planner", prompt: "Given pools and a max-unavailable fraction, produce batches and a gate decision.", rubric: ["Per-pool caps honored", "Stable ordering", "Min-sample handling"] },
      { title: "20 minutes · Packing", prompt: "Pack models into MIG profiles and report GPUs used and stranded slices.", rubric: ["Alignment rules", "Sort order", "Edge cases"] },
    ],
  },
});
