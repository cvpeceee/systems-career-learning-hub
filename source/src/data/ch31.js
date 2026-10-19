import { chapter } from "../helpers.js";
import { L31 } from "./ch31l.js";

export const CH31 = chapter({
  id: "frontier-training-infra", number: 31, title: "Frontier Training Infrastructure: Failure Math, Checkpointing, Gang Scheduling & Kubernetes at Extreme Scale", shortTitle: "Training Infra",
  duration: "10–12 hours", leverage: false,
  promise: "Reason with numbers about failures at thousands of accelerators, make checkpoints fast and impossible to half-load, schedule gangs fairly across teams, and keep a giant Kubernetes control plane alive.",
  diagram: "flow", flowStages: ["submit", "admit", "place", "train", "fail", "resume"],
  captions: [
    "A team submits a training job that needs many machines at once (gang, quota).",
    "The queue checks the team's guaranteed share and the job's priority (fair share, admission).",
    "All machines start together, or none do (gang scheduling, topology).",
    "Training runs and saves its progress regularly (async sharded checkpoints).",
    "A machine breaks, which happens every few hours at this size (job MTBF).",
    "Healthy spares replace it and training resumes from the last save (restart, goodput).",
  ],
  phases: [
    { label: "Reliability", title: "Failures are normal", detail: "Job MTBF, Young's interval, goodput; sharded async checkpoints with atomic manifests.", lessons: [0, 1] },
    { label: "Scheduling", title: "Sharing the fleet", detail: "Gangs, quotas, borrowing, preemption, starvation.", lessons: [2] },
    { label: "Control plane", title: "Kubernetes at the limit", detail: "etcd, watch cache, list storms, jitter, priority and fairness.", lessons: [3] },
  ],
  lessons: [...L31],
  lab: {
    title: "Capstone: a goodput review for a 30-day frontier run",
    brief: "Write the reliability and scheduling plan a staff engineer would bring to a launch review.",
    steps: [
      "Failure budget: node MTBF by hardware type, job MTBF, expected failures over 30 days",
      "Checkpoint design: size, shard layout, async snapshot time, interval from Young's formula",
      "Restart path: detection, spare pool size (binomial), image and data caching, target restart time",
      "Scheduling: gang placement within network domains, quota and preemption rules for other teams",
      "Control-plane risks: what restarts at once during the run, and the guardrails",
    ],
    doneWhen: "The plan predicts goodput with a number, names the top three risks, and says what you'd measure in week one.",
    starterLang: "Markdown · design review",
    starter: `# 30-day run: reliability review
## Fleet and job size
## Failure budget (node MTBF, job MTBF, failures expected)
## Checkpointing (size, shards, async, interval)
## Restart path and spares
## Scheduling and quotas
## Control-plane guardrails
## Goodput estimate and top risks`,
  },
  quiz: [
    { prompt: "Nodes average 40,000 h between failures. A job needs 4,000 nodes. Job MTBF is about…", options: ["40,000 h", "10 h", "100 h", "1 h"], answer: 1, explanation: "40,000 / 4,000 = 10 hours." },
    { prompt: "Young's checkpoint interval is…", options: ["MTBF / 2", "√(2 × checkpoint cost × MTBF)", "Checkpoint cost × 10", "Fixed at 1 hour"], answer: 1, explanation: "It balances saving cost against expected lost work." },
    { prompt: "Async checkpointing mainly reduces…", options: ["Storage size", "The time training is blocked", "Failure rate", "Shard count"], answer: 1, explanation: "Only the snapshot blocks; the upload runs in the background." },
    { prompt: "What marks a checkpoint step as valid?", options: ["The newest folder", "A manifest written last whose checksums match", "Any shard present", "A log line"], answer: 1, explanation: "The manifest is the commit point." },
    { prompt: "Gang scheduling means…", options: ["Many jobs per GPU", "All workers start together or none do", "Scheduling by team", "Random placement"], answer: 1, explanation: "Collectives need every rank present." },
    { prompt: "Full jitter on retries helps because…", options: ["It reduces total requests", "It spreads retries so peak load drops", "It makes requests smaller", "It skips the cache"], answer: 1, explanation: "Overload is about the peak rate." },
    { prompt: "Scenario: a 512-node job waits for days in a cluster that is 80% busy with small jobs. Fix?", options: ["Buy more nodes", "Reserve capacity after repeated skips (stop backfill)", "Lower its priority", "Disable quotas"], answer: 1, explanation: "Backfill starves big gangs; reservation fixes it.", scenario: true },
    { prompt: "Scenario: after a daemon rollout, all API servers run out of memory. First suspect?", options: ["etcd disk", "A list storm from thousands of clients restarting at once", "DNS", "A kernel bug"], answer: 1, explanation: "Synchronized full lists are the classic cause.", scenario: true },
  ],
  interviewRoom: {
    title: "Frontier training infrastructure interview room",
    intro: "Modeled on Anthropic's Staff+ Software Engineer, Infrastructure (Distributed Systems) posting and its related Node Infra and Cluster Infrastructure postings (POSTED). Anthropic states it does not run LeetCode-style interviews (POSTED); third-party guides report coding, system design, a project deep dive, a hiring-manager round and a culture round (PUBLIC, unofficial).",
    questions: [
      { prompt: "Design · Design a fault-tolerant scheduler for training jobs on 50,000 accelerators shared by research teams.", answer: "Admission queue with quotas and borrowing; gang placement within network domains; health-gated node pool with hot spares; preemption of borrowed, checkpointed work; reservation against starvation; integration with checkpoint/restart so failures resume automatically; metrics on queue wait by size, goodput and preemptions." },
      { prompt: "Estimation · A 16k-GPU run must finish in 30 days. How many failures do you expect and what goodput do you need?", answer: "Job MTBF = node MTBF / nodes; failures = 720 h / MTBF. Compute waste from Young's interval and restart time; required goodput = needed GPU-hours / available; close the gap with async checkpoints, spares and burn-in." },
      { prompt: "Deep dive · Walk me through a checkpoint from snapshot to commit, and every failure in between.", answer: "Snapshot to host memory (blocking), resume training, parallel shard uploads with bounded concurrency and checksums, manifest last; a crash before the manifest leaves the step invisible; restore verifies checksums and falls back; retention deletes the manifest first." },
      { prompt: "Kubernetes · What breaks first in a 20,000-node cluster?", answer: "API server and etcd under list/watch load: synchronized relists after restarts, large objects, chatty controllers. Fix with watch cache, selectors, jittered backoff, APF, separate etcd for events, and capping cluster size." },
      { prompt: "Behavioral · Tell me about a multi-month project you scoped from an ambiguous start.", answer: "Use the STAR bank in chapter 36: the ambiguity, how you framed options and success metrics, who you aligned, milestones, the measured result and what you'd change." },
    ],
    tasks: [
      { title: "45 minutes · Practical coding: checkpoint store", prompt: "Implement Save/Latest/Retain over an in-memory store with failure injection, and show tests for crash points.", rubric: ["Manifest-last commit", "Checksums verified", "Bounded concurrency", "Tests for each crash point"] },
      { title: "30 minutes · Gang scheduler", prompt: "Extend the scheduler with topology domains: a gang must fit inside one domain.", rubric: ["All-or-nothing preserved", "Domain-aware placement", "No starvation", "Clear tests"] },
      { title: "20 minutes · Backoff", prompt: "Implement full-jitter backoff and a test showing retries spread across the window.", rubric: ["Cap respected", "No overflow", "Uses injected RNG", "Statistical test is robust"] },
    ],
  },
});
