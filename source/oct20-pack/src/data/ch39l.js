import { jobs } from "./jobs.js";
import { LNgo } from "../helpers.js";

export const L39 = [
{
  title: "Autoscaling inference fleets: queue-based targets, stabilization windows, cold starts and multi-pool placement",
  sim: "autoscale",
  snippet: "lesson_39_1.go",
  jobs: jobs(["antscale", "POSTED: 'Maximize compute efficiency and optimize cost across the fleet by autoscaling and orchestrating production, research, and experimental workloads across multiple cloud providers'; routing 'across thousands of accelerators'."], ["genesys", "POSTED: scalable, reliable cloud-native backends on Kubernetes/AWS."]),
  concept: "Serving a model costs accelerator time whether or not anyone is using it, so the fleet must grow and shrink with demand. CPU utilisation is a poor signal for inference. The better signals are **queue depth** or **in-flight requests per replica** and **latency SLOs** (time to first token, p99). **Target tracking**: if each replica handles about q requests in flight, then desired = ceil(total_in_flight / q), clamped to [min, max]. Three details decide whether this works in practice. **Asymmetry**: scale up fast, scale down slow. A **stabilization window** uses the *maximum* desired value over the last few minutes when scaling down, so a brief dip doesn't remove capacity you'll need a minute later. That is how Kubernetes' HPA behaves (its default scale-down stabilization is 300 s). **Cold starts**: a new replica must pull a large image and load tens or hundreds of GB of weights onto accelerators, which takes minutes. So scale on a **forecast** or keep **headroom**, warm pools or pre-loaded weights, and don't count replicas as capacity until they pass a readiness check. **Multi-pool placement**: capacity lives in many pools (accelerator types, regions, clouds) with different cost, availability and performance per model. Place new replicas in the cheapest pool that has capacity and meets latency, and fall back to the next pool. Keep production above research when capacity is tight (**priority and preemption**: research jobs on spare capacity are evicted first). Anthropic's posting adds **routing** on top: the router sends each request to a replica with room. Chapter 26.2 covers prefill/decode and KV-cache-aware routing, so this lesson focuses on the scaling and placement loop.",
  analogy: "A restaurant that calls in cooks when the queue at the door grows. Cooks take twenty minutes to arrive, so you call early, and you don't send anyone home the moment the queue shrinks for a minute.",
  language: "Go 1.22+ · target tracking with clamps, scale-down stabilization window, and cheapest-pool placement",
  primer: {
    text: "AI models run on expensive chips that cost money even when idle. The fleet should grow when many requests arrive and shrink when they don't, but new servers take minutes to start. This lesson builds the scaling rule, the delay that stops it from shrinking too quickly, and the choice of which pool of machines to use.",
    terms: [
      ["Autoscaler", "A control loop that changes the number of replicas based on load."],
      ["Target tracking", "Scaling so a metric per replica (such as requests in flight) stays near a target."],
      ["Stabilization window", "When scaling down, use the highest recommendation over a recent period, so brief dips don't remove capacity."],
      ["Cold start", "The time a new replica needs before it can serve: image pull, weight loading, warm-up."],
      ["Headroom", "Spare capacity kept on purpose to absorb bursts while new replicas start."],
      ["Preemption", "Evicting lower-priority work to free capacity for higher-priority work."],
    ],
  },
  lines: LNgo(`
package autoscale

import (
    "math"
    "sort"
)

type Config struct {
    TargetPerReplica float64 // in-flight requests one replica handles within SLO
    Min, Max         int
    WindowSamples    int // scale-down stabilization window, in samples
}

type Scaler struct {
    cfg     Config
    history []int // recent raw recommendations
}

func New(cfg Config) *Scaler { return &Scaler{cfg: cfg} }

func (s *Scaler) clamp(n int) int {
    if n < s.cfg.Min {
        return s.cfg.Min
    }
    if n > s.cfg.Max {
        return s.cfg.Max
    }
    return n
}

// Desired returns the replica count for this sample. Scale up immediately; scale down to the window's max.
func (s *Scaler) Desired(current int, inFlight float64) int {
    raw := s.clamp(int(math.Ceil(inFlight / s.cfg.TargetPerReplica))) //@ Target tracking: enough replicas for the load at the target per replica.
    s.history = append(s.history, raw)
    if len(s.history) > s.cfg.WindowSamples {
        s.history = s.history[1:]
    }
    if raw >= current {
        return raw //@ Up fast: being short of capacity breaks the SLO now.
    }
    best := raw
    for _, h := range s.history {
        if h > best {
            best = h //@ Down slow: the highest recent recommendation wins.
        }
    }
    if best > current {
        best = current
    }
    return best
}

type Pool struct {
    Name     string
    CostHour float64
    Free     int // replicas this pool can still host
    MeetsSLO bool
}

// Place assigns n new replicas to the cheapest pools that meet the SLO. Returns placements and any shortfall.
func Place(pools []Pool, n int) (map[string]int, int) {
    ps := append([]Pool(nil), pools...)
    sort.Slice(ps, func(i, j int) bool { return ps[i].CostHour < ps[j].CostHour })
    out := map[string]int{}
    for _, p := range ps {
        if n == 0 {
            break
        }
        if !p.MeetsSLO || p.Free == 0 {
            continue //@ A cheap pool that misses latency for this model isn't a saving.
        }
        k := p.Free
        if k > n {
            k = n
        }
        out[p.Name] += k
        n -= k
    }
    return out, n //@ A shortfall is a signal: preempt research work or alert capacity planning.
}
`),
  storyLesson: {
    scenarioTitle: "The fleet that shrank right before the morning peak",
    scenario: "Traffic dips for two minutes at 8:58 a.m. The autoscaler removes a third of the replicas. At 9:00 traffic doubles, and new replicas need eight minutes to load weights. Latency SLOs are missed for ten minutes.",
    sections: [
      { title: "1 · Why it happened", body: "The scaler used the current recommendation for both directions. A short dip looked like lower demand, and capacity that takes minutes to restore was removed in seconds." },
      { title: "2 · Stabilization", body: "Scale-down now uses the maximum recommendation over the last 10 minutes; scale-up still reacts immediately. The 8:58 dip no longer removes anything." },
      { title: "3 · Cold starts", body: "Replicas count as capacity only after readiness checks pass. A small warm pool with weights preloaded absorbs bursts while new replicas start, and a daily forecast pre-scales before known peaks." },
      { title: "4 · Placement under pressure", body: "When the cheapest pool runs out, replicas go to the next pool that meets the SLO; if every pool is full, research jobs on borrowed capacity are preempted before production misses its SLO." },
    ],
    checkpoint: { prompt: "Why scale up immediately but scale down slowly?", answer: "Missing capacity breaks the SLO right away and new replicas take minutes to start; spare capacity only costs money for a few minutes." },
    lab: { title: "Replay a traffic day", brief: "Feed a recorded traffic curve through the scaler and compare policies.", steps: ["Generate per-minute in-flight requests with a morning peak and short dips", "Run the scaler with WindowSamples = 1 and = 10", "Model an 8-minute cold start and count minutes below needed capacity", "Add a warm pool of 2 replicas and repeat", "Place 20 new replicas across three pools with different cost and SLO"], doneWhen: "You can show minutes of SLO risk and replica-hours for each policy, and justify your choice." },
  },
  exercise: "Design the autoscaling and placement system for a model served on thousands of accelerators across several clouds.",
  answerHint: "Signal, target, asymmetry, cold start, pools, priority, shortfall.",
  expected: ["queue", "target", "stabilization", "cold start", "pool", "preempt"],
  modelAnswer: "Scale on in-flight requests or queue depth per replica, against a target derived from the latency SLO, clamped to min and max. Scale up immediately and scale down with a stabilization window. Cold starts take minutes, so keep headroom or a warm pool, forecast known peaks, and count replicas only after readiness. Place new replicas in the cheapest pool that meets the SLO, then the next. When pools are full, preempt research and experimental work before production, and report any shortfall to capacity planning.",
  pitfalls: [
    "Scaling on CPU utilisation for accelerator-bound inference.",
    "Symmetric scaling that removes capacity during brief dips.",
    "Counting starting replicas as capacity.",
    "Placing in the cheapest pool even when it misses latency for that model.",
  ],
  probes: [
    ["L1 · What signal do you scale inference on?", "In-flight requests or queue depth per replica, tied to the latency SLO."],
    ["L2 · What does the stabilization window do?", "When scaling down, uses the highest recommendation over a recent period."],
    ["L3 · How do you handle a model whose replicas take 10 minutes to start?", "Headroom sized to burst × start time, a warm pool, forecast-based pre-scaling, and faster weight loading (local caches, streaming)."],
    ["L4 · Two models compete for the last accelerators. Who wins?", "Priority by tier (production over research), then by SLO risk and revenue; make the policy explicit and observable rather than first-come."],
  ],
  poly: "Camera bars adjust encoder bitrate and resolution to available bandwidth with hysteresis so the picture doesn't flap. Autoscaling is the same control loop at fleet scale.",
  why: "Anthropic's Scaling posting is about routing, autoscaling and orchestration across accelerator families and clouds. The control-loop details are what interviewers probe.",
  companies: ["Anthropic", "OpenAI", "Google", "NVIDIA", "Meta"],
  myth: { myth: "Autoscaling means 'add servers when CPU is high'.", reality: "For inference, scale on queue depth tied to the SLO, react asymmetrically, and plan for minutes-long cold starts." },
  interviewTip: "Always state the cold-start time and the headroom it implies. It turns a generic answer into a capacity plan.",
},
{
  title: "Kubernetes fleet lifecycle: version skew, upgrade waves, disruption budgets and clusters that can't just be drained",
  sim: "k8supgrade",
  snippet: "lesson_39_2.go",
  jobs: jobs(["nvsre", "POSTED (JR2013271): 'multi-cluster lifecycle strategy: version skew policy, patch cadence, node image pipelines, controlled rollouts, and safe upgrade mechanics for clusters that can't simply be drained on demand'; on-prem plus EKS/GKE/OpenShift; GitOps."], ["gdch", "POSTED: Node Platform for air-gapped deployments, kernel updates."]),
  concept: "Running one cluster is a project; running dozens across data centers and clouds is a lifecycle that never ends. Kubernetes releases a minor version about every four months and supports each for about a year, so upgrades never stop. The rules come from the official **version skew policy**. The control plane upgrades **one minor version at a time** (1.29 → 1.30 → 1.31, never skipping). The kubelet on nodes may be **up to three minor versions older** than the API server (since 1.28), but **never newer**. Upgrade order: control plane, then nodes. **Node upgrades** usually mean replacing the node image (OS, kernel, container runtime, kubelet) built in a **node image pipeline**, then **cordon → drain → replace → uncordon**. Draining respects **PodDisruptionBudgets** (PDBs): a PDB says how many replicas of an app may be down at once, and eviction is refused if it would be exceeded. Here's the hard part named in NVIDIA's posting: EDA jobs and GPU training jobs run for **days** and **can't be drained on demand**. So upgrades must be **job-aware**. Mark busy nodes, upgrade idle ones first, stop scheduling new long jobs onto nodes due for upgrade, and pick up the rest when their jobs finish or at agreed maintenance windows. Upgrades go out in **waves** by fault domain: canary cluster, then one cluster per site, then the rest, with health checks (API latency, node readiness, error rates) gating each wave. Everything is declared in Git (**GitOps**, e.g. Argo CD): the desired version lives in the repo and controllers converge to it, so a manual change is a drift alert, not a fix.",
  analogy: "Renovating a hospital without closing it. You redo one ward at a time, never more beds than the rules allow, and you wait for long-stay patients to be discharged before working on their rooms.",
  language: "Go 1.22+ · skew checks, one-minor-at-a-time upgrade paths, and a wave planner that respects disruption budgets and long jobs",
  primer: {
    text: "Kubernetes has a new version every few months, and companies run many clusters. Upgrades must follow strict version rules, never take down too many copies of an app at once, and work around jobs that run for days. This lesson writes the checks and the planner that decides which machines to upgrade now.",
    terms: [
      ["Version skew policy", "Kubernetes' rules on how far apart component versions may be."],
      ["Control plane", "The API server, scheduler, controllers and etcd that run the cluster."],
      ["Kubelet", "The agent on each node that runs pods; it may lag the API server by up to three minor versions, never lead it."],
      ["Cordon / drain", "Stop new pods from landing on a node, then evict the pods already there."],
      ["PodDisruptionBudget (PDB)", "A limit on how many replicas of an app may be voluntarily disrupted at once."],
      ["Node image pipeline", "The build that produces tested OS + kernel + runtime + kubelet images for nodes."],
      ["GitOps", "Keeping desired cluster state in Git and letting controllers apply it."],
    ],
  },
  lines: LNgo(`
package k8supgrade

import "fmt"

// Minor versions only, e.g. 30 for 1.30.

// UpgradePath returns each control-plane minor to step through. Kubernetes never skips minors.
func UpgradePath(from, to int) []int {
    var p []int
    for v := from + 1; v <= to; v++ {
        p = append(p, v) //@ 1.28 -> 1.31 means three upgrades: 29, 30, 31.
    }
    return p
}

// SkewViolations checks kubelets against the API server: at most 3 minors older, never newer.
func SkewViolations(apiserver int, kubelets map[string]int) []string {
    var bad []string
    for node, v := range kubelets {
        switch {
        case v > apiserver:
            bad = append(bad, fmt.Sprintf("%s: kubelet 1.%d newer than apiserver 1.%d", node, v, apiserver))
        case apiserver-v > 3:
            bad = append(bad, fmt.Sprintf("%s: kubelet 1.%d more than 3 minors behind", node, v)) //@ Upgrade these nodes before the next control-plane step.
        }
    }
    return bad
}

type Node struct {
    Name     string
    Apps     []string // apps with a replica on this node
    LongJob  bool     // running a job that must not be interrupted
    Upgraded bool
}

// NextWave picks nodes to drain now: skip long jobs and never exceed any app's disruption budget.
func NextWave(nodes []Node, budget map[string]int, maxWave int) []string {
    used := map[string]int{}
    var wave []string
    for _, n := range nodes {
        if len(wave) == maxWave {
            break
        }
        if n.Upgraded || n.LongJob {
            continue //@ Job-aware: wait for the job to finish or a maintenance window.
        }
        ok := true
        for _, a := range n.Apps {
            if used[a]+1 > budget[a] {
                ok = false //@ Draining this node would take too many replicas of app a down at once.
                break
            }
        }
        if !ok {
            continue
        }
        for _, a := range n.Apps {
            used[a]++
        }
        wave = append(wave, n.Name)
    }
    return wave
}
`),
  storyLesson: {
    scenarioTitle: "The upgrade that stalled for a week",
    scenario: "An SRE starts a node upgrade across a 400-node EDA cluster. Drains hang on dozens of nodes; some long simulations are killed when an operator forces the drain. Chip teams escalate.",
    sections: [
      { title: "1 · Why drains hung", body: "Some apps had PDBs allowing zero disruptions, so eviction was refused forever. Other nodes ran multi-day simulations that couldn't be checkpointed, so draining meant killing a week of work." },
      { title: "2 · Job-aware waves", body: "The planner now skips nodes running long jobs, upgrades idle ones first, and taints nodes due for upgrade so no new long job lands there. Remaining nodes are upgraded as their jobs finish." },
      { title: "3 · Budgets with owners", body: "PDBs allowing zero disruptions are flagged in review; each app owner sets a realistic budget. The planner never exceeds any budget in a wave." },
      { title: "4 · Fleet view", body: "A skew check runs before every control-plane step, blocking if any kubelet would fall more than three minors behind. Desired versions live in Git, so the whole fleet's state is reviewable." },
    ],
    checkpoint: { prompt: "The API server is 1.31. Is a kubelet at 1.27 allowed? At 1.32?", answer: "1.27 is four minors behind, so no. 1.32 is newer than the API server, so no." },
    lab: { title: "Plan a fleet upgrade", brief: "Use the functions to plan 1.28 → 1.31 for three clusters.", steps: ["List the control-plane steps for each cluster", "Run the skew check at each step with current kubelet versions", "Plan node waves with budgets and some long-job nodes", "Show a node the planner skips and why", "Write the gating health checks between waves"], doneWhen: "Every step passes the skew check, no wave breaks a budget, and long jobs are never interrupted." },
  },
  exercise: "You own 40 Kubernetes clusters (on-prem and two clouds) running long EDA jobs. Describe your upgrade strategy from one minor version to the next.",
  answerHint: "Skew policy, order, node images, waves, PDBs, long jobs, GitOps, gates.",
  expected: ["skew", "control plane", "drain", "pdb", "wave", "gitops"],
  modelAnswer: "Follow the version skew policy: upgrade the control plane one minor at a time, and keep kubelets within three minors behind and never ahead. Build and test a node image in the pipeline. Roll out in waves by fault domain (canary cluster, then one per site, then the rest), gated by API latency, node readiness and job error rates. Node upgrades cordon and drain while respecting each PDB; nodes running long jobs are tainted for upgrade and done when jobs finish or in maintenance windows. Desired versions live in Git, and GitOps controllers converge clusters to them.",
  pitfalls: [
    "Skipping minor versions on the control plane.",
    "Upgrading nodes before the control plane.",
    "PDBs that allow zero disruptions, blocking every drain.",
    "Force-draining nodes with multi-day jobs.",
  ],
  probes: [
    ["L1 · What's the order of a Kubernetes upgrade?", "Control plane first (one minor at a time), then nodes."],
    ["L2 · What does a PDB protect against?", "Voluntary disruptions taking too many replicas of an app down at once."],
    ["L3 · How do managed clusters (EKS/GKE) change this?", "The provider upgrades the control plane on its schedule and support window; you still own node groups, add-ons, and API deprecations."],
    ["L4 · An API you depend on is removed in the next minor. How do you find every user across 40 clusters?", "Audit logs and deprecated-API metrics (apiserver_requested_deprecated_apis), scan manifests in Git, fix owners before the upgrade, and block the upgrade until usage is zero."],
  ],
  poly: "Rolling firmware to conference rooms while meetings are in progress is the same problem: you wait for idle devices, respect how many rooms may be down, and gate each wave on health.",
  why: "NVIDIA's Kubernetes SRE posting names version skew, node image pipelines and clusters that can't be drained on demand. This is that exact problem.",
  companies: ["NVIDIA", "Google", "Microsoft", "Oracle", "Red Hat"],
  myth: { myth: "Draining a node is always safe because Kubernetes reschedules pods.", reality: "Long-running jobs and strict PDBs make drains fail or destroy work; upgrades must be job-aware." },
  interviewTip: "Quote the skew rule precisely (kubelet ≤ 3 minors behind, never ahead; control plane one minor at a time). Precision builds trust fast.",
},
{
  title: "OpenTelemetry pipelines: instrumentation, collectors, tail sampling and cardinality budgets",
  sim: "otel",
  snippet: "lesson_39_3.go",
  jobs: jobs(["truist", "POSTED (mirror of R0120717): 'Design and implement OpenTelemetry instrumentation, collectors, and telemetry pipelines'; 'monitoring-as-code'; 'telemetry contracts'."], ["nvsre", "POSTED: end-to-end observability (Prometheus, Grafana, OpenTelemetry, Loki)."], ["osano", "POSTED: build observability, feature flags and rollback paths into your work."]),
  concept: "Every service should report how it is doing in the same format. **OpenTelemetry (OTel)** is the open standard for that: **traces** (the path of one request through services, as a tree of **spans**), **metrics** (counters, gauges and histograms) and **logs**, all tagged with **resource attributes** (service.name, deployment.environment). Apps use an OTel **SDK** (auto-instrumentation plus manual spans) and export over **OTLP** to a **Collector**. The Collector is a pipeline of **receivers → processors → exporters**. Processors do batching, attribute redaction (strip card numbers before anything leaves a bank's network), memory limiting and sampling. Then it sends to whatever backend the company uses (Dynatrace, Splunk, Grafana, Datadog). Changing vendors means changing an exporter, not every app. Two cost problems decide whether a big rollout succeeds. **Sampling**: storing every trace is too expensive. *Head sampling* decides at the start (keep 1%), which is cheap but drops the rare slow or failed requests you most want. *Tail sampling* buffers all spans of a trace until it completes, then keeps every trace with an **error** or **high latency** and a small percentage of the rest. The decision must be **consistent per trace ID** (hash-based), and all spans of a trace must reach the same Collector, which is done with a load-balancing exporter keyed by trace ID. **Cardinality**: each unique combination of metric labels is a separate time series. Putting user_id or request_id in a label creates millions of series and huge bills. Set a **cardinality budget** per metric, and fold overflow into an \"other\" bucket. **Telemetry contracts** (required attributes, naming conventions, allowed labels) checked in CI, plus **monitoring-as-code** (dashboards and alerts in Git), keep a large enterprise consistent.",
  analogy: "A bank's mailroom. Every letter (span) gets a standard envelope (OTel). The mailroom (Collector) shreds account numbers, keeps every letter about a problem, and keeps only a sample of routine ones, so storage doesn't overflow.",
  language: "Go 1.22+ · tail-sampling decisions per trace, and a per-metric cardinality limiter with an overflow bucket",
  primer: {
    text: "Big companies collect traces, metrics and logs from thousands of services. OpenTelemetry is the standard way to do that. Storing everything costs too much, so you keep every trace that shows a problem and only a sample of normal ones. You also cap how many label combinations each metric may have. This lesson builds both decisions.",
    terms: [
      ["OpenTelemetry (OTel)", "An open standard and toolkit for traces, metrics and logs."],
      ["Span / trace", "A span is one timed operation; a trace is the tree of spans for one request."],
      ["Collector", "A service that receives telemetry, processes it (batch, redact, sample) and exports it to backends."],
      ["Tail sampling", "Deciding whether to keep a trace after seeing all its spans, so errors and slow requests are kept."],
      ["Cardinality", "The number of unique label combinations for a metric; each is a separate time series."],
      ["Telemetry contract", "Agreed rules for names, required attributes and allowed labels, checked automatically."],
      ["Monitoring-as-code", "Dashboards, alerts and maintenance windows defined in version-controlled files."],
    ],
  },
  lines: LNgo(`
package otel

import (
    "hash/fnv"
    "time"
)

type Span struct {
    TraceID  string
    Root     bool
    Error    bool
    Duration time.Duration
}

type Policy struct {
    SlowThreshold time.Duration
    KeepPercent   uint32 // of normal traces, 0..100
}

// Decide is called once a trace is complete (root ended or timeout). Errors and slow traces are always kept.
func Decide(spans []Span, p Policy) (keep bool, reason string) {
    if len(spans) == 0 {
        return false, "empty"
    }
    var root time.Duration
    for _, s := range spans {
        if s.Error {
            return true, "error" //@ Never sample away the traces people will search for during an incident.
        }
        if s.Root {
            root = s.Duration
        }
    }
    if root >= p.SlowThreshold {
        return true, "slow"
    }
    h := fnv.New32a()
    h.Write([]byte(spans[0].TraceID)) //@ Hash of the trace ID: every collector makes the same decision for the same trace.
    if h.Sum32()%100 < p.KeepPercent {
        return true, "sampled"
    }
    return false, "dropped"
}

// Limiter caps unique label sets per metric; extra combinations are folded into "other".
type Limiter struct {
    Budget int
    seen   map[string]map[string]bool
    Folded map[string]int
}

func NewLimiter(budget int) *Limiter {
    return &Limiter{Budget: budget, seen: map[string]map[string]bool{}, Folded: map[string]int{}}
}

// Labels returns the label key to record under: the original, or "other" once the budget is spent.
func (l *Limiter) Labels(metric, labels string) string {
    m := l.seen[metric]
    if m == nil {
        m = map[string]bool{}
        l.seen[metric] = m
    }
    if m[labels] {
        return labels
    }
    if len(m) >= l.Budget {
        l.Folded[metric]++ //@ Count folds: a rising count means someone put an ID in a label.
        return "other"
    }
    m[labels] = true
    return labels
}
`),
  storyLesson: {
    scenarioTitle: "The observability bill that tripled in a month",
    scenario: "A bank rolls out OpenTelemetry to 300 services. Within a month the vendor bill triples, and during an incident engineers can't find the failing requests because head sampling at 1% dropped them.",
    sections: [
      { title: "1 · Cardinality", body: "One team added customer_id as a metric label. A single histogram became four million series. The limiter now caps each metric at a budget and folds the rest into 'other', and a CI contract check rejects ID-like labels." },
      { title: "2 · Sampling", body: "Head sampling kept 1% of traces chosen at random, so most failed requests were dropped. The Collector tier now tail-samples: every error and every trace over the SLO threshold is kept, plus 2% of the rest." },
      { title: "3 · Routing traces", body: "Tail sampling needs every span of a trace in one place, so a first Collector layer uses a load-balancing exporter keyed by trace ID to send all spans of a trace to the same sampling Collector." },
      { title: "4 · Adoption", body: "Teams onboard with a template: SDK config, required resource attributes, a standard dashboard and alerts in Git. Maintenance windows are code too, so planned work doesn't page anyone." },
    ],
    checkpoint: { prompt: "Why must the keep/drop decision use a hash of the trace ID rather than a random number?", answer: "Different collectors or retries must make the same decision for the same trace; a random choice could keep some spans and drop others." },
    lab: { title: "Run a Collector locally", brief: "Use the OpenTelemetry Collector with a tail-sampling processor and a demo app.", steps: ["Run the Collector with an OTLP receiver and a debug exporter", "Instrument a small service with the OTel SDK and send traces", "Add a tail_sampling processor: keep errors, latency over 500 ms, and 5% probabilistic", "Inject errors and slow requests and confirm they're always kept", "Add an attributes processor that deletes a sensitive attribute"], doneWhen: "All error and slow traces appear, normal ones are sampled, and the sensitive attribute never reaches the exporter." },
  },
  exercise: "You're the observability engineer for a large bank. Design the OpenTelemetry rollout so it's adopted widely, finds incidents, and doesn't explode costs.",
  answerHint: "SDK, collector tiers, redaction, tail sampling, cardinality, contracts, as-code, adoption.",
  expected: ["collector", "tail", "cardinality", "redact", "contract", "dashboards"],
  modelAnswer: "Standardize on the OTel SDK with required resource attributes, exporting OTLP to a Collector tier. A first Collector layer redacts sensitive attributes and routes spans by trace ID to sampling Collectors. These tail-sample: keep all errors and slow traces plus a small hashed percentage. Enforce a cardinality budget per metric with an overflow bucket, and a telemetry contract in CI that rejects ID-like labels. Dashboards, alerts and maintenance windows are monitoring-as-code in Git, and teams onboard with templates. Exporters keep the backend vendor swappable.",
  pitfalls: [
    "Head sampling that drops the failing requests.",
    "IDs in metric labels, creating millions of series.",
    "Sensitive data leaving the network in span attributes.",
    "Spans of one trace split across tail-sampling collectors.",
  ],
  probes: [
    ["L1 · What are the three OTel signals?", "Traces, metrics and logs."],
    ["L2 · Head vs tail sampling?", "Head decides at the start (cheap, blind); tail decides after the trace completes (keeps errors and slow ones, needs buffering)."],
    ["L3 · How do you size the tail-sampling tier?", "Spans per second × decision wait × span size for memory; scale out with trace-ID-consistent routing; set memory limiters and drop counters."],
    ["L4 · An executive asks for per-customer latency metrics. How do you do it without a cardinality explosion?", "Use traces or logs (with sampling and exemplars) for per-customer views, or aggregate customers into tiers for metrics; keep IDs out of metric labels."],
  ],
  poly: "Your devices already send telemetry from the field. OTel gives you a standard envelope and pipeline for it, and the same sampling and cardinality rules apply to device fleets.",
  why: "Truist's Observability FDE posting is built around OTel instrumentation, collectors, pipelines, telemetry contracts and monitoring-as-code.",
  companies: ["Truist", "NVIDIA", "Datadog", "Google", "Microsoft"],
  myth: { myth: "Sampling means you lose the important traces.", reality: "Tail sampling keeps every error and slow trace and samples only the normal ones." },
  interviewTip: "Mention cardinality before anyone asks. It's the number-one cost problem in real OTel rollouts.",
},
];
