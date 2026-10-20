import { chapter } from "../helpers.js";
import { L39 } from "./ch39l.js";

export const CH39 = chapter({
  id: "fleet-reliability-observability", number: 39, title: "Fleet Reliability & Observability: Inference Autoscaling, Kubernetes Fleet Upgrades & OpenTelemetry Pipelines", shortTitle: "Fleet Reliability",
  duration: "7–9 hours", leverage: false,
  promise: "Scale an accelerator fleet without SLO misses or waste, upgrade dozens of clusters without killing long jobs, and build telemetry that finds incidents without exploding costs.",
  diagram: "flow", flowStages: ["measure", "scale", "place", "upgrade", "observe", "sample"],
  captions: [
    "Watch requests waiting per replica, not CPU (queue depth).",
    "Add replicas fast, remove them slowly (stabilization).",
    "Pick the cheapest pool that meets latency (placement).",
    "Step clusters one minor version at a time, in waves (lifecycle).",
    "Send traces, metrics and logs in one standard format (OpenTelemetry).",
    "Keep every problem trace and a sample of the rest (tail sampling).",
  ],
  phases: [
    { label: "Scaling", title: "Right-size the fleet", detail: "Targets, stabilization, cold starts, pools.", lessons: [0] },
    { label: "Lifecycle", title: "Upgrade without outages", detail: "Skew policy, waves, PDBs, long jobs, GitOps.", lessons: [1] },
    { label: "Observability", title: "See everything, pay sensibly", detail: "OTel, collectors, tail sampling, cardinality.", lessons: [2] },
  ],
  lessons: [...L39],
  lab: {
    title: "Capstone: an SRE review for a multi-cloud inference platform",
    brief: "Write the reliability plan for a platform that serves models on several clouds and runs on 40 Kubernetes clusters.",
    steps: [
      "Autoscaling signal, targets, stabilization, cold start time and headroom",
      "Placement rules across pools and the preemption order when capacity runs out",
      "Upgrade lifecycle: skew checks, node images, waves, budgets, long-job handling",
      "Telemetry: OTel SDK, collector tiers, tail sampling, cardinality budgets, redaction",
      "Top three alerts and the runbook first step for each",
    ],
    doneWhen: "Each section has a number (seconds, percent, budget) and a failure it prevents.",
    starterLang: "Markdown · SRE review",
    starter: `# Inference platform SRE review
## Autoscaling
## Placement and preemption
## Cluster lifecycle
## Telemetry
## Alerts and runbooks`,
  },
  quiz: [
    { prompt: "Best scaling signal for LLM inference replicas?", options: ["CPU utilisation", "In-flight requests or queue depth per replica", "Disk I/O", "Pod count"], answer: 1, explanation: "Tied to the latency SLO." },
    { prompt: "A scale-down stabilization window uses…", options: ["The minimum recent recommendation", "The maximum recent recommendation", "The average", "The current value"], answer: 1, explanation: "Brief dips don't remove capacity." },
    { prompt: "Kubernetes control planes upgrade…", options: ["Any number of minors at once", "One minor at a time", "Only patch versions", "Nodes first"], answer: 1, explanation: "Never skip minors." },
    { prompt: "A kubelet may be how far behind the API server (1.28+)?", options: ["0", "1", "3 minors", "Any"], answer: 2, explanation: "And never newer." },
    { prompt: "Tail sampling keeps…", options: ["The first 1% of traces", "Errors and slow traces plus a sample of the rest", "Only root spans", "Nothing"], answer: 1, explanation: "Decided after the trace completes." },
    { prompt: "Putting request_id in a metric label causes…", options: ["Faster queries", "A cardinality explosion", "Better sampling", "Nothing"], answer: 1, explanation: "One series per unique value." },
    { prompt: "Scenario: drains hang during a node upgrade on an EDA cluster. Likely causes?", options: ["DNS", "PDBs allowing zero disruptions and multi-day jobs", "etcd size", "Image pull"], answer: 1, explanation: "Budgets and long jobs.", scenario: true },
    { prompt: "Scenario: during an incident nobody can find failing traces; sampling is 1% head-based. Fix?", options: ["Raise to 2%", "Tail sampling that keeps all errors and slow traces", "Stop tracing", "Log everything"], answer: 1, explanation: "Head sampling is blind to outcome.", scenario: true },
  ],
  interviewRoom: {
    title: "Fleet reliability and observability interview room",
    intro: "Modelled on Anthropic's Staff + Sr. SWE, Scaling (POSTED), NVIDIA's Senior SRE, Kubernetes Platform (POSTED, JR2013271) and Truist's Observability Forward Deployed Engineer (POSTED via mirror). Interview formats: Anthropic's are in the 06 Anthropic page (REPORTED). NVIDIA SRE and Truist loops are INFERRED from the postings.",
    questions: [
      { prompt: "Scaling · Design autoscaling for a model whose replicas take 8 minutes to start.", answer: "Queue-depth target from SLO; fast up, slow down with stabilization; headroom ≈ burst rate × 8 min; warm pool; forecast pre-scaling; readiness gating; cheapest SLO-meeting pool; preempt research first." },
      { prompt: "Routing · How does routing interact with autoscaling?", answer: "Router uses per-replica load and cache locality (26.2); new replicas get ramped traffic; scaler reads router queue metrics; avoid herding onto new replicas during warm-up." },
      { prompt: "Kubernetes · Walk through upgrading 40 clusters from 1.30 to 1.31.", answer: "Deprecated-API audit, control plane one minor, skew check, node image build, canary cluster, waves by site, PDB-respecting drains, long-job-aware scheduling, health gates, GitOps desired state." },
      { prompt: "Debug · API server latency spikes after an upgrade wave. What do you check?", answer: "Watch/list storms from restarted controllers, APF queues, etcd latency and DB size, webhook latency, new deprecated API retries; roll back the wave if gates fail." },
      { prompt: "Observability · Design the telemetry pipeline for 300 services at a bank.", answer: "OTel SDK + required attributes; collector tiers with redaction and trace-ID routing; tail sampling; cardinality budgets; contracts in CI; monitoring-as-code; vendor-neutral exporters." },
    ],
    tasks: [
      { title: "30 minutes · Autoscaler", prompt: "Implement target tracking with min/max and a scale-down stabilization window; test a dip and a spike.", rubric: ["Ceil of load/target", "Clamps", "Asymmetric behaviour", "Tests with a traffic trace"] },
      { title: "25 minutes · Upgrade planner", prompt: "Given nodes, apps and PDB budgets, choose the next drain wave; skip long jobs.", rubric: ["Never exceeds a budget", "Skips long jobs", "Respects wave size", "Explains ordering"] },
      { title: "25 minutes · Tail sampler", prompt: "Decide keep/drop per completed trace: errors, slow, hashed percent.", rubric: ["Errors always kept", "Consistent by trace ID", "Threshold on root span", "Tests"] },
    ],
  },
});
