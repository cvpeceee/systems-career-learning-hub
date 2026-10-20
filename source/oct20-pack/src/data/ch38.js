import { chapter } from "../helpers.js";
import { L38 } from "./ch38l.js";

export const CH38 = chapter({
  id: "linux-platform-networking", number: 38, title: "Linux Platform Engineering: Distribution & Kernel Config Management, SDN Overlays and Endpoint Sensors", shortTitle: "Linux Platform",
  duration: "8–10 hours", leverage: false,
  promise: "Ship a curated Linux to sites with no internet, build and debug the overlay networks clouds run on, and design security sensors that can't take the machine down.",
  diagram: "flow", flowStages: ["resolve", "configure", "sign", "encapsulate", "observe", "update"],
  captions: [
    "Pick compatible package versions and an install order (resolution).",
    "Merge kernel option files and check nothing was dropped (config fragments).",
    "Ship updates as signed bundles to sites with no internet (air-gapped).",
    "Wrap customer packets inside server-to-server packets (VXLAN overlay).",
    "Watch processes, files and connections, and link them into a tree (sensor).",
    "Change detection rules daily, safely (validated, staged content).",
  ],
  phases: [
    { label: "Distribution", title: "Your own Linux", detail: "Resolution, kernel fragments, signed air-gapped updates.", lessons: [0] },
    { label: "Networking", title: "Overlays and the fast path", detail: "VXLAN, FDB, MTU, netlink, SmartNICs.", lessons: [1] },
    { label: "Security", title: "Sensors that stay safe", detail: "Event pipelines, process trees, content validation and rings.", lessons: [2] },
  ],
  lessons: [...L38],
  lab: {
    title: "Capstone: the node platform for an air-gapped region",
    brief: "Write the design for the base OS, the overlay network and the host security agent of a sovereign cloud region.",
    steps: [
      "Distribution: package set, LTS kernel, config fragments and the requested-vs-final check",
      "Update path: signed bundles, rollback protection, internal mirror, A/B canary rollout",
      "Network: VXLAN overlay, MTU plan, FDB programming from the controller, drop counters",
      "Host agent: collectors, bounded event ring, process tree, content validation and staged rings",
      "Operations: what pages someone at 3 a.m., and the first command they run",
    ],
    doneWhen: "Each part names its failure mode and the guard that prevents it.",
    starterLang: "Markdown · design doc",
    starter: `# Air-gapped node platform
## Distribution and kernel
## Update and rollback path
## Overlay network and MTU
## Host security agent
## Operations and alerts`,
  },
  quiz: [
    { prompt: "Kahn's algorithm leaves some packages unprocessed. That means…", options: ["Missing packages", "A dependency cycle", "A version conflict", "Nothing"], answer: 1, explanation: "Nodes stuck with nonzero in-degree are in a cycle." },
    { prompt: "A requested CONFIG_ option is missing from the final .config after olddefconfig. Most likely…", options: ["Typo in Makefile", "Its dependencies aren't met, so Kconfig dropped it", "Compiler bug", "Fragment order doesn't matter"], answer: 1, explanation: "Kconfig drops options silently." },
    { prompt: "VXLAN over IPv4 adds how many bytes to an Ethernet frame?", options: ["8", "28", "50", "100"], answer: 2, explanation: "14 + 20 + 8 + 8." },
    { prompt: "The VXLAN VNI is how many bits?", options: ["12", "16", "24", "32"], answer: 2, explanation: "About 16 million networks." },
    { prompt: "Why key processes by (pid, start time)?", options: ["Faster lookups", "PIDs are reused", "Kernel requirement", "Sorting"], answer: 1, explanation: "Otherwise a new process inherits the wrong ancestry." },
    { prompt: "When the sensor's event ring is full, it should…", options: ["Block the kernel hook", "Drop and count", "Crash", "Grow without limit"], answer: 1, explanation: "Never block the hook; report drops." },
    { prompt: "Scenario: SSH connects but freezes on large output over a new overlay. First suspect?", options: ["DNS", "MTU: 50-byte overhead with don't-fragment", "CPU", "TLS"], answer: 1, explanation: "Small works, big fails.", scenario: true },
    { prompt: "Scenario: a new detection template references a field older sensors don't supply. Best guard?", options: ["Ship faster", "Validate field references per sensor version and stage the rollout", "Only test on the newest sensor", "Disable bounds checks"], answer: 1, explanation: "Validation plus staged rings.", scenario: true },
  ],
  interviewRoom: {
    title: "Linux platform, networking and sensor interview room",
    intro: "Modelled on Google's Senior SWE, GDCH Infrastructure (POSTED), Oracle's Senior Software Developer, Linux Networking (MIRROR summary) and CrowdStrike's Sr. SWE II, Sensor (POSTED). Loop formats aren't confirmed here; see the 06 company pages for REPORTED and INFERRED notes.",
    questions: [
      { prompt: "Distribution · How do you deliver a kernel security fix to an air-gapped region?", answer: "LTS patch, same fragments with requested-vs-final check, reproducible signed bundle with higher version, site-side verification against pre-installed keys, internal mirror, A/B canary waves with automatic fallback." },
      { prompt: "Networking · Walk me through what happens to a packet from VM A to VM B on another host in the same VCN.", answer: "VM sends frame; host VTEP looks up (dst MAC, VNI) in FDB to get remote VTEP IP; adds VXLAN/UDP/IP/Ethernet; underlay routes; remote VTEP checks VNI, strips headers, delivers to the bridge/port for VM B. Unknown MAC: controller lookup or flood." },
      { prompt: "Networking · Large file transfers hang on a new overlay. Diagnose.", answer: "MTU: 50-byte overhead, DF set, ICMP not reaching the guest; prove with full-size DF ping and capture; fix with inner MTU 1450 or jumbo underlay; add probes." },
      { prompt: "Sensor · How do you make sure the sensor never hangs a machine under heavy file activity?", answer: "Bounded work per event in the hook, ring buffer with drop counts, async user-space processing, bounded ancestry walks, stress tests with sanitizers and kernel debug options." },
      { prompt: "Sensor · Design the content update pipeline.", answer: "Schema and field-count validation per sensor version, interpreter bounds checks, testing on real builds, staged rings gated by crash/heartbeat telemetry, customer-selectable rings, last-known-good fallback." },
    ],
    tasks: [
      { title: "30 minutes · Dependency resolver", prompt: "Given packages with versions and min-version deps, return an install order or a precise error.", rubric: ["Highest satisfying version", "Topological order", "Cycle detection", "Clear conflict messages"] },
      { title: "25 minutes · VXLAN header", prompt: "Build and parse the VXLAN header; compute the inner MTU; write an aging FDB.", rubric: ["Correct byte order", "Length and flag checks", "Bounded table", "Aging"] },
      { title: "30 minutes · Process tree rule", prompt: "Build a process tree from exec events and detect 'office app → shell → outbound connect'.", rubric: ["PID reuse handled", "Bounded walk", "Rule order respected", "Tests"] },
    ],
  },
});
