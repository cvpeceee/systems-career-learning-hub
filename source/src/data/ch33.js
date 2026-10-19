import { chapter } from "../helpers.js";
import { L33 } from "./ch33l.js";

export const CH33 = chapter({
  id: "engineering-acceleration", number: 33, title: "Engineering Acceleration: Build Caches, Merge Queues, Flaky Tests & Code Search", shortTitle: "Eng Acceleration",
  duration: "8–10 hours", leverage: false,
  promise: "Make a large engineering organization faster with numbers: cache builds correctly, keep main green without slowing merges, kill flaky tests, and make code search instant.",
  diagram: "flow", flowStages: ["search", "change", "build", "test", "queue", "land"],
  captions: [
    "An engineer finds the code to change in seconds (trigram index).",
    "They make and review the change (code review).",
    "Build steps reuse earlier results when nothing changed (remote cache, hermetic).",
    "Tests run, and unreliable ones are set aside (flake rate, quarantine).",
    "Approved changes are tested in order on the newest code (merge queue, batching).",
    "The change lands, and the time it took is tracked (time to land, p75).",
  ],
  phases: [
    { label: "Build", title: "Don't redo work", detail: "Action keys, hermeticity, cache trust, hit rate.", lessons: [0] },
    { label: "Land", title: "Green main, fast merges", detail: "Merge queues, batching, bisection; flaky-test policy.", lessons: [1, 2] },
    { label: "Find", title: "Instant code search", detail: "Trigram indexes, candidates, verification, freshness.", lessons: [3] },
  ],
  lessons: [...L33],
  lab: {
    title: "Capstone: a developer-velocity strategy memo",
    brief: "Write the memo a principal engineer would bring to engineering leadership after one month in the role.",
    steps: [
      "Baseline: p50/p75 time to land, CI duration, rerun rate, search latency, survey results",
      "Top three bottlenecks with evidence",
      "Proposed bets (cache, queue, flakes, search, AI tooling) with expected impact",
      "Rollout and adoption plan, including what teams must change",
      "How you'll measure success each quarter",
    ],
    doneWhen: "Every bet has a metric, an owner and an expected size of impact.",
    starterLang: "Markdown · strategy memo",
    starter: `# Developer velocity: proposal
## Where time goes today
## Top bottlenecks
## Bets and expected impact
## Adoption plan
## Metrics and review cadence`,
  },
  quiz: [
    { prompt: "An action key must include…", options: ["Only the command", "Command, environment, toolchain and input digests", "The time of day", "The developer's name"], answer: 1, explanation: "Everything the output depends on." },
    { prompt: "Which is worse for a build cache?", options: ["A miss", "A false hit", "A slow upload", "A large entry"], answer: 1, explanation: "False hits return wrong output silently." },
    { prompt: "A merge queue tests each change on top of…", options: ["Its original base", "Main plus changes ahead of it", "The previous release", "Nothing"], answer: 1, explanation: "That's what keeps main green." },
    { prompt: "Batch pass probability with failure rate p and size B is about…", options: ["p·B", "(1−p)^B", "1−p", "B/p"], answer: 1, explanation: "Every change must pass." },
    { prompt: "The cleanest flaky-test signal is…", options: ["Slow runtime", "Pass and fail on the same commit", "Recent edits", "Many assertions"], answer: 1, explanation: "Same code, different result." },
    { prompt: "Trigram search must verify candidates because…", options: ["Indexes are stale", "Trigrams can appear in different places", "Lists aren't sorted", "Files are compressed"], answer: 1, explanation: "Containment isn't adjacency." },
    { prompt: "Scenario: cache hit rate dropped from 85% to 30% overnight. First step?", options: ["Buy a bigger cache", "Diff action keys for the same commit across two runs", "Disable the cache", "Retry builds"], answer: 1, explanation: "Find the changing input.", scenario: true },
    { prompt: "Scenario: the merge queue rejects 1 in 10 batches for failures that vanish on retry. Fix?", options: ["Bigger batches", "Detect and quarantine flaky tests", "Remove the queue", "Unlimited retries"], answer: 1, explanation: "Flakes poison batches.", scenario: true },
  ],
  interviewRoom: {
    title: "Engineering Acceleration principal interview room",
    intro: "Modeled on Roblox's Principal Software Engineer, Engineering Acceleration posting (POSTED: source search, storage, review, CI, productivity metrics, AI tooling). Roblox's 2025 tools blog describes time-to-land metrics (PUBLIC). No official description of this role's interview loop was found.",
    questions: [
      { prompt: "Design · Design CI for a 1,000-engineer monorepo with a 20-minute p50 target from approval to merge.", answer: "Affected-target analysis, remote cache and execution, hermetic actions, merge queue with batching and speculation, flaky-test quarantine, tiered tests (fast blocking, slow post-merge), metrics on time to land." },
      { prompt: "Metrics · How do you measure developer productivity without gaming?", answer: "Combine system metrics (time to land, CI duration, reruns) with surveys; use them for finding bottlenecks, not ranking people; watch for counter-metrics like quality and incidents." },
      { prompt: "Search · How would you make code search reflect a commit within a minute?", answer: "Incremental delta shards from commit hooks, merged at query time and compacted in the background, with versioning for consistency." },
      { prompt: "AI tooling · Where would you apply AI in developer tools first?", answer: "Places with clear evaluation: code review suggestions, flaky-test triage, test selection, search. Measure acceptance rates and time saved; keep humans approving." },
      { prompt: "Leadership · Teams resist adopting the merge queue. What do you do?", answer: "Find the pain they feel, pilot with a willing team, publish before/after metrics, fix their blockers first, then make it default with an escape hatch." },
    ],
    tasks: [
      { title: "45 minutes · Time-to-land metrics (Go)", prompt: "From PR event logs, compute p50/p75 time to land per team and flag regressions.", rubric: ["Correct percentiles", "Handles missing events", "Clear output", "Tests"] },
      { title: "30 minutes · Merge queue", prompt: "Implement batching with bisection and report CI runs per landed change.", rubric: ["Correct ordering", "Bisection correctness", "Edge cases"] },
      { title: "20 minutes · Cache keys", prompt: "Compute deterministic action keys and explain a cache miss from two records.", rubric: ["Sorted maps", "Separators", "Diff output"] },
    ],
  },
});
