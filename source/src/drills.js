// Five Oct 12 staff/principal design drills, same shape as the bundle's Tesla drills.
// Deep dives are labelled "Tradeoff ·" or "Failure mode ·"; the last rubric line gives the scoring bands.
const f = (x, d = 1) => (Number.isFinite(x) ? x.toLocaleString("en-US", { maximumFractionDigits: d }) : "n/a");
const SCORE = "Scoring: count the lines met. 7–8 = staff/principal signal; 5–6 = senior; 4 or fewer = not yet.";

export const DRILLS_O12 = [
  {
    id: "trainsched",
    title: "Design a fault-tolerant training platform for a shared accelerator fleet",
    tag: "Anthropic Staff+ Infrastructure · ch31",
    minutes: 50,
    prompt: "Design the system that runs large training jobs on a fleet of 20,000 accelerator nodes shared by many research teams. Jobs range from 8 to 8,000 nodes and run for days to weeks. Cover admission and quotas, gang placement, failure detection and restart, checkpointing, and the Kubernetes-style control plane. Numbers are a generic teaching setup, not Anthropic's systems.",
    clarify: [
      ["Which accelerators?", "Ask. Assume a mix of GPU and other accelerator types in separate pools, each with its own network domains (PUBLIC: Anthropic uses Trainium, GPUs and TPUs for serving)."],
      ["Who gets priority?", "Assume each team has a guaranteed share; unused share can be borrowed and reclaimed."],
      ["What's the goodput target?", "Assume 90% for the largest runs."],
      ["How big is a checkpoint?", "Assume 10–20 TB for the largest model, written to object storage."],
      ["Is placement topology-sensitive?", "Yes: a gang should fit in one high-bandwidth network domain when possible."],
    ],
    numbers: {
      inputs: [
        { k: "nodes", label: "Nodes in the biggest job", v: 8000, min: 8, max: 20000, step: 8 },
        { k: "mtbf", label: "Node MTBF (hours)", v: 50000, min: 1000, max: 500000, step: 1000 },
        { k: "ckptTB", label: "Checkpoint size (TB)", v: 15, min: 0.1, max: 100, step: 0.1 },
        { k: "bwGBs", label: "Storage write bandwidth (GB/s)", v: 1000, min: 10, max: 10000, step: 10 },
        { k: "snapS", label: "Async snapshot blocking (s)", v: 30, min: 1, max: 600, step: 1 },
        { k: "restartMin", label: "Restart time (min)", v: 10, min: 1, max: 120, step: 1 },
      ],
      calc: (e) => {
        const M = e.mtbf / Math.max(1, e.nodes);
        const C = e.snapS / 3600, R = e.restartMin / 60;
        const tau = Math.sqrt(2 * C * M);
        const upload = (e.ckptTB * 1000) / Math.max(1, e.bwGBs) / 60;
        const g = 1 - C / tau - (tau + C) / (2 * M) - R / M;
        return [
          ["Job MTBF", `${f(M, 1)} h`],
          ["Failures in 30 days", f(720 / M, 0)],
          ["Young's interval", `${f(tau * 60, 0)} min`],
          ["Background upload time", `${f(upload, 1)} min`],
          ["Upload fits inside the interval?", upload < tau * 60 ? "yes" : "no: shard more or add bandwidth"],
          ["First-order goodput", `${f(Math.max(0, g) * 100, 1)}%`],
        ];
      },
    },
    components: [
      { name: "Admission queue with team quotas, borrowing and reclaim", need: true, why: "Fair sharing with guaranteed capacity (lesson 31.3)." },
      { name: "Gang scheduler with topology domains and reservations", need: true, why: "All-or-nothing starts inside one network domain, no starvation (31.3)." },
      { name: "Node health service with drain, burn-in and hot spares", need: true, why: "Raises node MTBF and shortens restarts (32.1, 31.1)." },
      { name: "Async sharded checkpointing with manifest commit", need: true, why: "Small blocking cost and crash-safe saves (31.2)." },
      { name: "Automatic restart controller from the last valid step", need: true, why: "Turns failures into minutes of loss, not hours." },
      { name: "Control-plane guardrails: watch cache, jittered relists, APF", need: true, why: "Survives fleet-wide restarts (31.4)." },
      { name: "Goodput and queue-wait dashboards by job size", need: true, why: "Measures what the design promises." },
      { name: "One global etcd for all 20,000 nodes and every event", need: false, why: "Becomes the bottleneck; split clusters or separate event storage." },
      { name: "Synchronous checkpoints to a single NFS server", need: false, why: "Blocks training for minutes and can't reach the bandwidth." },
    ],
    flow: ["Team submits job", "Quota + priority admission", "Gang placement in a network domain", "Health-gated nodes start", "Training + async checkpoints", "Failure detected", "Spares swapped in", "Restore last valid step"],
    deepdives: [
      ["Tradeoff · Checkpoint interval vs storage load", "Shorter intervals lose less work but keep storage busy; Young's formula sets the balance, and async upload must finish inside one interval or skip a step."],
      ["Tradeoff · Fair share vs big-job latency", "Backfill keeps utilization high but starves big gangs; reservations after N skips cost some idle capacity to bound wait time."],
      ["Failure mode · Correlated failures", "A rack or power domain fails together; place spares across domains, treat the rack as the failure unit and quarantine racks with clusters of failures."],
      ["Failure mode · Control-plane storm", "A rollout restarts every node agent; synchronized relists overload API servers. Jitter, watch cache, narrow selectors and priority and fairness protect heartbeats."],
      ["Failure mode · Silent data corruption", "A bad node produces wrong numbers without crashing; detect with loss-spike monitors and periodic cross-checks, and keep checkpoints from before the spike."],
    ],
    rubric: ["Quantifies job MTBF and failures per run", "Sizes the checkpoint interval and upload time", "Gang scheduling with quotas, borrowing and starvation control", "Health pipeline with burn-in and spares", "Crash-safe checkpoint commit and restore", "Control-plane scaling guardrails", "Names correlated and silent failures", "Defines metrics: goodput, queue wait, restart time", SCORE],
    followups: [
      ["Restart takes 30 minutes. Where does the time go and how do you cut it?", "Measure per stage: detection, node replacement, image pull, data loader warm-up, checkpoint load, collective init. Pre-cache images, keep hot spares, parallel restore, and pre-warm collectives."],
      ["Two teams both claim urgent priority. How does the system decide?", "Guaranteed shares decide by default; escalation goes to a documented human process, not ad-hoc priority bumps."],
    ],
  },
  {
    id: "gpuplatform",
    title: "Design the GPU platform for a hybrid-cloud training and inference fleet",
    tag: "Roblox Principal GPU Compute · ch32",
    minutes: 45,
    prompt: "Design the platform that runs a 5,000-GPU fleet across on-prem data centers and a cloud provider, serving both online inference and training. Cover health and lifecycle, scheduling and sharing, driver and firmware rollouts, telemetry, and how teams request capacity. Numbers are a generic teaching setup; Roblox has publicly described hybrid-cloud inference on 1,000+ GPUs (PUBLIC, 2024).",
    clarify: [
      ["What share is inference vs training?", "Assume 60% inference with daily peaks, 40% training that can be preempted."],
      ["What GPU types?", "Assume two generations; only the newer supports MIG."],
      ["Who owns models?", "Many product teams; the platform team owns GPUs, drivers and scheduling."],
      ["What's the reliability target?", "Inference availability 99.95%; training goodput 90%."],
      ["Cloud for what?", "Burst capacity for inference peaks and overflow training."],
    ],
    numbers: {
      inputs: [
        { k: "gpus", label: "GPUs in the fleet", v: 5000, min: 100, max: 50000, step: 100 },
        { k: "util", label: "Current average utilization (%)", v: 30, min: 5, max: 95, step: 1 },
        { k: "target", label: "Target utilization (%)", v: 60, min: 10, max: 95, step: 1 },
        { k: "fail", label: "GPU failures per 1,000 per month", v: 8, min: 0, max: 100, step: 1 },
        { k: "repairDays", label: "Days to repair or replace", v: 7, min: 1, max: 60, step: 1 },
        { k: "costK", label: "Yearly cost per GPU ($k)", v: 20, min: 1, max: 200, step: 1 },
      ],
      calc: (e) => {
        const freed = e.gpus * (1 - e.util / Math.max(1, e.target));
        const down = e.gpus * e.fail / 1000 * e.repairDays / 30;
        return [
          ["GPUs freed by reaching the target", f(Math.max(0, freed), 0)],
          ["Yearly saving", `$${f(Math.max(0, freed) * e.costK / 1000, 1)}M`],
          ["GPUs out for repair at any time", f(down, 0)],
          ["Share of fleet out for repair", `${f(down / Math.max(1, e.gpus) * 100, 2)}%`],
        ];
      },
    },
    components: [
      { name: "Node agents collecting XID, DCGM counters and BMC/Redfish data", need: true, why: "In-band and out-of-band health signals (32.1)." },
      { name: "Lifecycle controller: drain, reset, repair ticket, burn-in, return", need: true, why: "Turns signals into safe actions with hysteresis (32.1)." },
      { name: "Staged rollout service with control-group gates", need: true, why: "Drivers and firmware ship without fleet-wide outages (32.2)." },
      { name: "Scheduler with queues, priorities, preemption and bin packing", need: true, why: "Inference first at peak, training fills the rest (31.3)." },
      { name: "GPU sharing pools: MIG, MPS, whole-GPU", need: true, why: "Small models stop wasting whole GPUs (32.3)." },
      { name: "Capacity API and per-team usage reporting", need: true, why: "Teams request and see what they use; drives right-sizing." },
      { name: "Cloud burst integration with the same images and policies", need: true, why: "Peaks overflow without a second platform." },
      { name: "Manual spreadsheet of GPU assignments per team", need: false, why: "Can't keep up with daily changes; strands capacity." },
      { name: "Auto-repair every XID immediately", need: false, why: "App-caused XIDs would strand healthy GPUs." },
    ],
    flow: ["Team requests capacity", "Scheduler places on a pool", "Agents report health", "Classifier decides action", "Drain via scheduler", "Repair or reset + burn-in", "Return to pool", "Rollouts in waves with gates"],
    deepdives: [
      ["Tradeoff · Isolation vs utilization", "MIG isolates but fragments; MPS shares well but trusts tenants; whole GPUs are simple but wasteful. Choose per pool by trust and latency needs."],
      ["Tradeoff · On-prem vs cloud", "On-prem is cheaper at steady load; cloud covers peaks but costs more per hour and needs identical images and health checks."],
      ["Failure mode · Bad driver rollout", "A driver fails on one GPU model after hours of load; stratified canaries, long enough bakes and control-group gates catch it at 1%."],
      ["Failure mode · Flapping nodes", "Nodes return too early and kill training jobs; hysteresis, burn-in and repeat-failure tracking stop it."],
    ],
    rubric: ["Quantifies utilization gap and repair downtime", "Health pipeline with app vs hardware separation", "Lifecycle with burn-in and hysteresis", "Rollouts with stratified canaries and control groups", "Scheduling with priorities and preemption between inference and training", "Sharing modes chosen per workload", "Hybrid-cloud consistency", "Metrics and a quarter-by-quarter plan", SCORE],
    followups: [
      ["A product team says the platform is too slow to give them GPUs. What do you do?", "Measure request-to-running time, find the bottleneck (quota, fragmentation, approvals), fix the biggest, and publish the metric."],
      ["How do you decide when to buy more GPUs?", "Forecast demand by team, subtract utilization gains you can realistically make, and buy for the gap plus failure headroom."],
    ],
  },
  {
    id: "buildci",
    title: "Design CI and developer tooling for a 1,000-engineer monorepo",
    tag: "Roblox Principal Engineering Acceleration · ch33",
    minutes: 45,
    prompt: "Design the build, test, merge and code-search systems for a monorepo with 1,000 engineers, 2,000 merges per day and a 40-minute uncached CI build. Target: p75 time to land under 30 minutes and main green 99% of the time. Numbers are a teaching setup; Roblox publicly tracks P75 time to land (PUBLIC, 2025).",
    clarify: [
      ["Which languages and build system?", "Ask. Assume C++, Lua and Go; don't assume Bazel (not named publicly)."],
      ["How flaky are tests today?", "Assume 3% of runs fail for flaky reasons."],
      ["What's the failure rate of real changes?", "Assume 5% of changes break tests."],
      ["Where does CI run?", "Assume a mix of on-prem and cloud workers."],
      ["Any AI tooling goals?", "Yes: the posting mentions AI for engineering (POSTED); keep humans approving."],
    ],
    numbers: {
      inputs: [
        { k: "merges", label: "Merges per day", v: 2000, min: 10, max: 20000, step: 10 },
        { k: "ciMin", label: "Uncached CI time (min)", v: 40, min: 1, max: 240, step: 1 },
        { k: "hit", label: "Cache hit rate (%)", v: 85, min: 0, max: 99, step: 1 },
        { k: "p", label: "Changes that fail (%)", v: 5, min: 0, max: 50, step: 1 },
        { k: "B", label: "Merge-queue batch size", v: 6, min: 1, max: 32, step: 1 },
        { k: "flaky", label: "Flaky failure rate per run (%)", v: 3, min: 0, max: 30, step: 0.5 },
      ],
      calc: (e) => {
        const ci = e.ciMin * (1 - e.hit / 100) + 2;
        const pass = Math.pow(1 - e.p / 100, e.B) * Math.pow(1 - e.flaky / 100, e.B > 0 ? 1 : 0);
        const runsPerMerge = (1 + (1 - pass) * Math.log2(Math.max(2, e.B)) * 2) / Math.max(1, e.B);
        const runs = e.merges * runsPerMerge;
        return [
          ["CI time with cache", `${f(ci, 1)} min`],
          ["Batch pass chance", `${f(pass * 100, 0)}%`],
          ["CI runs per landed change", f(runsPerMerge, 2)],
          ["Queue CI runs per day", f(runs, 0)],
          ["Serial queue capacity per day (one lane)", f(24 * 60 / ci * Math.max(1, e.B) * pass, 0)],
        ];
      },
    },
    components: [
      { name: "Remote cache and execution with hermetic, sandboxed actions", need: true, why: "Cuts CI time and keeps results trustworthy (33.1)." },
      { name: "Affected-target analysis to test only what changed", need: true, why: "Avoids running the whole suite for small changes." },
      { name: "Merge queue with batching, bisection and parallel lanes", need: true, why: "Main stays green at 2,000 merges/day (33.2)." },
      { name: "Flaky-test detection, quarantine with owners", need: true, why: "Flakes poison batches and trust (33.3)." },
      { name: "Trigram code search with incremental indexing", need: true, why: "Engineers find code in seconds (33.4)." },
      { name: "Time-to-land and CI dashboards per team", need: true, why: "Measures the target and finds regressions (36.3)." },
      { name: "AI review assistant with measured acceptance rate", need: true, why: "Posting mentions AI for engineering; measure before scaling." },
      { name: "Unlimited automatic retries on any failure", need: false, why: "Hides real bugs and wastes compute." },
      { name: "Laptops writing to the shared remote cache", need: false, why: "Risks cache poisoning." },
    ],
    flow: ["Engineer searches code", "Change + review", "Affected targets computed", "Cached/remote build + tests", "Flakes filtered", "Merge queue batch", "Land on main", "Metrics updated"],
    deepdives: [
      ["Tradeoff · Batch size vs bisection cost", "Bigger batches save runs when changes pass, but (1−p)^B falls fast; size from measured failure rate."],
      ["Tradeoff · Pre-merge vs post-merge tests", "Slow tests post-merge keep landing fast but let breakages in; mitigate with fast revert and blame tooling."],
      ["Failure mode · Cache poisoning", "An undeclared input produces a wrong cached result; sandboxing, CI-only writes and periodic uncached verification."],
      ["Failure mode · Queue stalls", "A broken infrastructure dependency fails every batch; detect infra failures separately and pause the queue rather than rejecting good changes."],
    ],
    rubric: ["Quantifies CI time, hit rate and queue capacity", "Hermetic caching with trust boundaries", "Merge queue with batching tuned to failure rate", "Flaky-test policy with ownership", "Code search with freshness", "Time-to-land metrics at p50/p75", "Adoption plan for teams", "AI tooling with evaluation", SCORE],
    followups: [
      ["p75 time to land jumped 40% last week. Investigate.", "Split time into queue wait, CI duration and reruns per team; check cache hit rate, flaky rate and queue failures; find the change that caused it."],
      ["How do you get teams to adopt the merge queue?", "Pilot with a willing team, publish before/after metrics, fix their blockers, then make it default with an escape hatch."],
    ],
  },
  {
    id: "telematicsboot",
    title: "Design boot, update and security for an automotive telematics unit",
    tag: "Qualcomm Senior Staff (telematics platform) · ch34",
    minutes: 45,
    prompt: "Design the embedded Linux platform's boot chain, OTA update path, storage layout and security for a telematics control unit with an application processor and a separate modem. Requirements: critical services within 2 s of power-on, no OTA may brick a unit, 15-year life, and ISO/SAE 21434-style threat analysis. Generic teaching setup, not Qualcomm's product.",
    clarify: [
      ["Raw NAND or eMMC?", "Ask. Assume 1 GB raw NAND for cost, with a hardware ECC engine."],
      ["Which services are critical at boot?", "Assume CAN gateway, emergency call readiness and the modem link."],
      ["How are updates delivered?", "Over cellular, in deltas, possibly interrupted by power loss."],
      ["What's the threat model?", "Remote attackers via cellular, and physical access to the board."],
      ["Does the modem update separately?", "Assume a separate modem image that must stay compatible with Linux."],
    ],
    numbers: {
      inputs: [
        { k: "budget", label: "Critical-service budget (ms)", v: 2000, min: 200, max: 10000, step: 100 },
        { k: "rom", label: "ROM + first loader (ms)", v: 250, min: 10, max: 2000, step: 10 },
        { k: "boot", label: "Second-stage bootloader + verify (ms)", v: 400, min: 10, max: 3000, step: 10 },
        { k: "kernel", label: "Kernel to init (ms)", v: 700, min: 50, max: 5000, step: 10 },
        { k: "svc", label: "Critical services start (ms)", v: 500, min: 10, max: 5000, step: 10 },
        { k: "img", label: "System image size (MB)", v: 300, min: 10, max: 4000, step: 10 },
      ],
      calc: (e) => {
        const total = e.rom + e.boot + e.kernel + e.svc;
        const flash = 2 * e.img + 200;
        return [
          ["Time to critical services", `${f(total, 0)} ms`],
          ["Within budget?", total <= e.budget ? `yes (${f(e.budget - total, 0)} ms spare)` : `no: over by ${f(total - e.budget, 0)} ms`],
          ["Flash needed for A/B system + data", `${f(flash, 0)} MB`],
          ["Verity tree overhead (~1%)", `${f(e.img * 0.01, 1)} MB per slot`],
        ];
      },
    },
    components: [
      { name: "Hardware root of trust with fused key hash and signed stages", need: true, why: "Chain of trust from ROM (34.3)." },
      { name: "A/B slots with tries, health-based success and recovery image", need: true, why: "No OTA can brick a unit (34.1)." },
      { name: "Anti-rollback versions in fuses or RPMB", need: true, why: "Blocks downgrade attacks (34.1)." },
      { name: "dm-verity root filesystem with signed root hash", need: true, why: "Detects tampering at read time (34.3)." },
      { name: "Encrypted data partition with device-bound key, SELinux MAC", need: true, why: "Protects writable data and limits compromise (34.3)." },
      { name: "Redundant boot copies, ECC margins and scrubbing", need: true, why: "Survives 15 years of heat (34.2)." },
      { name: "AP–modem link with ordered rings, sequence numbers and recovery", need: true, why: "Reliable control path (34.4)." },
      { name: "Single system partition updated in place", need: false, why: "Power loss mid-update bricks the unit." },
      { name: "Read-only mount as the only integrity control", need: false, why: "Physical attackers can rewrite flash." },
    ],
    flow: ["Power on", "ROM verifies loader", "Loader picks slot, verifies kernel", "Kernel + verity rootfs", "Critical services", "Health check marks slot good", "OTA writes inactive slot", "Reboot into new slot with tries"],
    deepdives: [
      ["Tradeoff · Security checks vs boot time", "Every verification costs milliseconds; verify the kernel at boot, verify the root filesystem lazily with verity, and defer non-critical checks."],
      ["Tradeoff · Raw NAND vs eMMC", "Raw NAND is cheaper and controllable but needs ECC, bad-block and scrubbing software; eMMC hides that but limits visibility."],
      ["Failure mode · Boots but doesn't work", "A new slot reaches Linux but the modem can't register; health-based mark-successful catches it and tries roll back."],
      ["Failure mode · Power loss during metadata write", "Redundant boot-control copies with checksums and sequence numbers leave one valid copy."],
      ["Failure mode · Key compromise", "Multiple key slots and signed revocation allow rotation by OTA without bricking."],
    ],
    rubric: ["Boot chain with timing budget that adds up", "A/B with tries, health-based success and recovery", "Anti-rollback raised only after success", "Verity with signed root, encryption, MAC", "Flash aging addressed with numbers", "AP–modem link reliability and recovery", "TARA linking threats to controls", "Test plan covering power loss and aging", SCORE],
    followups: [
      ["Boot time is 2.6 s. Get it under 2 s.", "Measure each stage, trim kernel config and drivers, defer non-critical services, parallelize init, and use lazy verity checks."],
      ["How do you update the modem and Linux together safely?", "Version them as one bundle with a compatibility check, and roll both back if either health check fails."],
    ],
  },
  {
    id: "robotplatform",
    title: "Design the platform that takes robot policies from training to real robots",
    tag: "Microsoft Robotics MTS · ch35",
    minutes: 45,
    prompt: "Design the platform that serves a vision-language-action policy to 30 lab robots, keeps them safe near people, and decides when a new policy version is ready. The model takes 150 ms per inference; arms need commands at 100 Hz. Cover serving, control, safety, evaluation and rollout. Generic teaching setup; Microsoft Research publicly described its Rho-alpha model (PUBLIC, 2026).",
    clarify: [
      ["Where does inference run?", "Ask. Assume on-robot GPUs for some robots and an edge server for others."],
      ["Which tasks?", "Bimanual manipulation and short mobile moves in shared lab spaces."],
      ["Who operates the robots?", "Researchers and technicians, with human-in-the-loop fallback (POSTED)."],
      ["How often do new policies arrive?", "Weekly checkpoints; urgent fixes sometimes."],
      ["Middleware?", "ROS 2 for sensors and navigation (POSTED)."],
    ],
    numbers: {
      inputs: [
        { k: "lat", label: "Inference latency (ms)", v: 150, min: 10, max: 1000, step: 10 },
        { k: "hz", label: "Control rate (Hz)", v: 100, min: 10, max: 1000, step: 10 },
        { k: "chunk", label: "Chunk length (steps)", v: 100, min: 1, max: 500, step: 1 },
        { k: "v", label: "Max speed near people (m/s)", v: 0.5, min: 0.1, max: 2, step: 0.1 },
        { k: "a", label: "Braking (m/s²)", v: 2, min: 0.5, max: 10, step: 0.5 },
        { k: "trials", label: "Real trials per evaluation", v: 50, min: 5, max: 1000, step: 5 },
      ],
      calc: (e) => {
        const covered = e.chunk / e.hz * 1000;
        const stop = e.v * 0.1 + e.v * e.v / (2 * e.a);
        const z2 = 3.8416, p = 0.9, n = e.trials, d = 1 + z2 / n, c = (p + z2 / (2 * n)) / d, hw = 1.96 * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / d;
        return [
          ["Time covered by one chunk", `${f(covered, 0)} ms`],
          ["Chunks overlap inference?", covered > e.lat ? "yes" : "no: robot would run out of plan"],
          ["Ticks to skip per chunk", f(e.lat / 1000 * e.hz, 0)],
          ["Stopping distance (0.1 s reaction)", `${f(stop, 2)} m`],
          ["95% interval at 90% observed success", `${f((c - hw) * 100, 0)}–${f((c + hw) * 100, 0)}%`],
        ];
      },
    },
    components: [
      { name: "Inference service with timestamps per observation", need: true, why: "Lets the controller skip stale actions (35.1)." },
      { name: "Real-time chunk executor with ensembling and staleness hold", need: true, why: "Smooth, safe motion from a slow model (35.1)." },
      { name: "Simplex safety supervisor with verified fallback", need: true, why: "Bounds what the policy can do (35.2)." },
      { name: "Intervention logging and teleoperation takeover", need: true, why: "Human-in-the-loop fallback and safety metrics (POSTED)." },
      { name: "Evaluation service: task suites, paired trials, Wilson intervals", need: true, why: "Evidence before release (35.3)." },
      { name: "Sim screening farm with tracked sim–real correlation", need: true, why: "Cheap filtering before real trials." },
      { name: "Staged rollout to robots with instant rollback", need: true, why: "Limits blast radius of a bad policy." },
      { name: "Run the policy directly at 100 Hz with no chunking", need: false, why: "Inference is slower than the control period." },
      { name: "Ship whenever the average success rate goes up", need: false, why: "Ignores uncertainty and per-task regressions." },
    ],
    flow: ["Sensors + instruction", "Inference (edge or on-robot)", "Chunk with timestamp", "Executor at 100 Hz", "Safety supervisor", "Motors", "Logs + interventions", "Evaluation gate for next version"],
    deepdives: [
      ["Tradeoff · On-robot vs edge inference", "On-robot avoids network loss but limits model size; edge allows bigger models but needs latency monitoring and a fallback policy."],
      ["Tradeoff · Smoothness vs reaction", "More ensembling smooths motion but slows response to new instructions; tune k per task."],
      ["Failure mode · Inference stall", "The executor runs out of plan; it holds position and alerts, and the supervisor stays active."],
      ["Failure mode · Sim looked great, real didn't", "Track sim–real correlation per task; never release on sim alone."],
    ],
    rubric: ["Separates model rate from control rate with numbers", "Latency compensation and staleness handling", "Simplex envelope with stopping distance", "Human-in-the-loop fallback and intervention metrics", "Statistical evaluation gate with per-task checks", "Sim-to-real strategy", "Staged rollout and rollback to robots", "Real-time engineering: no blocking in the loop", SCORE],
    followups: [
      ["The network to the edge server drops for 2 seconds. What happens?", "Chunks run out; the executor holds; the supervisor keeps the envelope; an on-robot fallback policy can take over for simple holds or retreats."],
      ["Researchers want daily releases. How do you allow that safely?", "Automate the gate so it runs overnight, use restricted envelopes for experimental policies, and keep production robots on gated versions."],
    ],
  },
];

export const PLAIN_DRILLS_O12 = {
  "drill:trainsched": { a: "Running a giant shared workshop where big projects need every bench at once, machines break every few hours, and work must be saved often enough to lose little.", t: "Change the job size and how often machines break, see how often to save and how much useful time is left, then pick only the parts the design truly needs." },
  "drill:gpuplatform": { a: "Managing a fleet of expensive delivery vans: keeping them repaired, sharing them between teams, and updating them without grounding the whole fleet.", t: "Change how busy the cards are and how fast repairs happen, see the money saved, then pick only the parts the design truly needs." },
  "drill:buildci": { a: "A busy post office for code: sort fast, reuse work already done, and never let a bad parcel stop the line.", t: "Change the cache reuse rate and group size, watch how many test runs are needed, then pick only the parts the design truly needs." },
  "drill:telematicsboot": { a: "A car's control box that must always start, check that nobody tampered with it, and update itself without ever getting stuck.", t: "Change the time each start-up step takes and the image size, check the time limit and space, then pick only the parts the design truly needs." },
  "drill:robotplatform": { a: "A robot that follows a slow planner's instructions smoothly, with a safety guard watching, and only gets a new planner after fair tests.", t: "Change how slow the planner is, how fast the robot moves and how many tests you run, then pick only the parts the design truly needs." },
};
