import { jobs } from "./jobs.js";
import { LN, LNgo } from "../helpers.js";

export const L32 = [
{
  title: "GPU health at fleet scale: XID triage, ECC, NVLink and drain decisions",
  sim: "gpuhealth",
  snippet: "lesson_32_1.cpp",
  jobs: jobs(["gpu", "POSTED: GPU hardware/driver failure modes (XID, ECC, NVLink) and out-of-band management (BMC/Redfish); preferred NVIDIA tooling and GPU telemetry."], ["ant", "RELATED Node Infra posting (POSTED): node health, fleet MTBI and stranded capacity."]),
  concept: "A large group of GPUs reports errors all day long. The job is to turn each signal into one of four steps: **keep**, **watch**, **drain** (stop new work, let jobs finish or move) and **repair** (send to a technician or vendor). The NVIDIA driver logs **XID** errors to the kernel log. Each XID number has a meaning in NVIDIA's XID documentation; check it for your driver version. Some XIDs usually mean the application did something wrong, such as XID 13 (graphics engine exception) or XID 31 (GPU memory page fault). Others point at hardware: XID 48 (double-bit **ECC** error), XID 79 (GPU has fallen off the bus), XID 64 (row-remapper failure) and XID 95 (uncontained ECC error). On recent data-center GPUs, memory with a bad row is fixed by **row remapping**. A pending remap needs a GPU reset, so the right action is drain and reset, not repair. **NVLink** errors show up as rising CRC or replay counters; a slow rise means a flaky link, and a jump means a failing one. Good triage has three habits. Separate app-caused errors from hardware by checking whether the same GPU fails across **different jobs**. Use **hysteresis**, so a node needs a clean period before it returns. Send drained nodes through a **burn-in** test before rejoining, so a bad GPU never re-enters a 4,000-node training job. Tools like **DCGM** expose these signals as metrics; out-of-band **BMC** data (power, fans, temperatures via **Redfish**) catches failures the OS can't see.",
  analogy: "A hospital triage desk. A cough after one bad meal is the food's fault; the same cough every day, whatever the meal, means the patient needs a doctor. Nobody is sent home until they've been fine for a while.",
  language: "C++17 · classify XID and counter signals into keep/watch/drain/repair with hysteresis",
  primer: {
    text: "Graphics cards in a big fleet report errors all day. Some errors are the program's fault and some mean the card is breaking. This lesson sorts each signal into keep, watch, take out of service, or send for repair.",
    terms: [
      ["XID error", "A numbered error message the NVIDIA driver writes to the kernel log; NVIDIA documents what each number means."],
      ["ECC (error-correcting code)", "Extra bits in memory that fix single-bit errors and detect double-bit errors."],
      ["Row remapping", "Replacing a bad memory row with a spare row; takes effect after a GPU reset."],
      ["Drain", "Stop placing new work on a node and move or finish the work already there."],
      ["Hysteresis", "Requiring a clean period before going back to normal, so a node doesn't flap in and out."],
      ["Burn-in", "Stress tests run on a node before it rejoins production work."],
      ["BMC / Redfish", "The baseboard management controller and its standard web API for power, fans and temperature, reachable even if the OS is down."],
    ],
  },
  lines: LN(`
#include <set>
#include <string>
#include <vector>

enum class Action { Keep = 0, Watch = 1, Drain = 2, Repair = 3 };

struct Xid { int code; std::string job; };   //@ One XID log line, tagged with the job running at the time.

struct Counters {
  unsigned long long dbe = 0;        // double-bit ECC errors since last reset
  bool remap_pending = false;        // row remap needs a GPU reset
  bool remap_failed = false;         // no spare rows left
  double nvlink_crc_per_min = 0;     // replay/CRC error rate across links
  int temp_c = 0;
};

struct Verdict { Action act; std::string why; };

static void raise(Verdict &v, Action a, const char *why) {
  if (a > v.act) { v.act = a; v.why = why; }   //@ The most severe signal wins; keep its reason for the operator.
}

Verdict classify(const std::vector<Xid> &xids, const Counters &c) {
  Verdict v{Action::Keep, "healthy"};
  std::set<std::string> app_fault_jobs;
  for (const Xid &x : xids) {
    switch (x.code) {
      case 13: case 31: case 43:
        app_fault_jobs.insert(x.job); break;    //@ Usually the program's fault. Only suspicious if many different jobs hit it here.
      case 48: case 95: raise(v, Action::Drain, "uncorrectable memory error"); break;
      case 63: raise(v, Action::Drain, "row remap pending: reset needed"); break;
      case 64: case 79: raise(v, Action::Repair, "remap failure or GPU fell off bus"); break;
      case 74: raise(v, Action::Watch, "NVLink error logged"); break;
      default: raise(v, Action::Watch, "unrecognised XID: check NVIDIA docs"); break;  //@ Unknown codes get attention, not silence.
    }
  }
  if (app_fault_jobs.size() >= 3) raise(v, Action::Drain, "same fault across 3+ jobs: likely hardware");
  else if (!app_fault_jobs.empty()) raise(v, Action::Watch, "app-type fault: watch for repeats");
  if (c.remap_failed) raise(v, Action::Repair, "no spare memory rows left");
  if (c.remap_pending) raise(v, Action::Drain, "row remap pending: reset needed");
  if (c.dbe > 0) raise(v, Action::Drain, "double-bit ECC errors");
  if (c.nvlink_crc_per_min > 100) raise(v, Action::Drain, "NVLink error rate high");     //@ Teaching thresholds: tune from your fleet's history.
  else if (c.nvlink_crc_per_min > 5) raise(v, Action::Watch, "NVLink errors rising");
  if (c.temp_c >= 90) raise(v, Action::Drain, "overheating: check BMC fans and power");
  return v;
}

// Return to service only after "need" clean windows in a row, then burn-in.
struct Gate {
  int need = 6, clean = 0;
  bool burned_in = false;
  bool ready(Action latest) {
    clean = (latest == Action::Keep) ? clean + 1 : 0;   //@ Any bad window restarts the count: that's the hysteresis.
    return clean >= need && burned_in;
  }
};
`),
  storyLesson: {
    scenarioTitle: "The node that kept coming back",
    scenario: "A 1,000-node GPU cluster runs inference and training. One node is drained after a double-bit ECC error, auto-reset, and returned within minutes. It fails again two days later, killing a 512-GPU training job.",
    sections: [
      { title: "1 · What the logs show", body: "The node logged XID 48, then XID 63 (remap pending). The reset applied the remap, which is correct, but it also logged XID 31 three times in the past week, each from a different job. Nobody linked them." },
      { title: "2 · Better triage", body: "The classifier now treats the same app-type XID across three different jobs as a hardware hint and drains the node. A pending remap triggers drain and reset, not a repair ticket." },
      { title: "3 · Hysteresis and burn-in", body: "Nodes return only after six clean windows and a burn-in run: memory stress, an NCCL all-reduce test across NVLink, and a thermal soak. The flapping node fails burn-in and goes to the vendor." },
      { title: "4 · Measuring it", body: "Track drains per day, repeat-failure rate within 7 days of return, and training jobs killed by hardware. The repeat rate is the number that shows the gate is working." },
    ],
    checkpoint: { prompt: "Why is XID 31 alone not a reason to drain a GPU, and when does it become one?", answer: "It is usually a program bug (a bad memory access). If it appears across many different jobs on the same GPU, the common factor is the hardware, so drain and test it." },
    lab: { title: "Replay a week of logs", brief: "Feed recorded XID lines and counter samples through the classifier and tune thresholds.", steps: ["Write 20 synthetic log events covering each XID branch", "Add counters with slowly rising NVLink CRC errors", "Print the action and reason per node", "Add the gate and show a node that flaps without hysteresis", "Count how many training jobs each policy would have protected"], doneWhen: "Every branch is exercised and you can explain each threshold choice." },
  },
  exercise: "Your fleet's training jobs keep dying on nodes that were recently 'fixed'. Design the health pipeline from raw GPU signals to drain, repair and return to service.",
  answerHint: "Signals, classification, app vs hardware, hysteresis, burn-in, metrics.",
  expected: ["xid", "ecc", "nvlink", "drain", "burn-in", "hysteresis"],
  modelAnswer: "Collect XID lines from the kernel log, ECC and row-remap counters and NVLink CRC rates through DCGM, and BMC data through Redfish. Classify each node: hardware XIDs such as 48, 79 and 95 drain or repair; a pending row remap means drain and reset; app-type XIDs only drain when they repeat across different jobs. Rising NVLink errors go to watch, then drain. Returning nodes need hysteresis, several clean windows, plus a burn-in test before rejoining. Measure repeat failures within a week of return.",
  pitfalls: [
    "Sending every XID to repair, which strands healthy GPUs for app bugs.",
    "Auto-returning nodes the moment errors stop.",
    "Ignoring slow NVLink error growth until a training job dies.",
    "Relying only on in-band data, so a node with a dead OS looks silent rather than broken.",
  ],
  probes: [
    ["L1 · What's the difference between drain and repair?", "Drain stops new work and can end in a reset and return; repair takes the node out for hardware work."],
    ["L2 · How do you tell an app bug from a bad GPU?", "Correlate by GPU across jobs and by job across GPUs: one job failing everywhere is a bug; one GPU failing for every job is hardware."],
    ["L3 · How do you avoid draining half a training job's nodes at once?", "Rate-limit drains per network domain, prefer drain-at-checkpoint, and coordinate with the scheduler to move work to spares first."],
    ["L4 · A new driver version raises XID 79 rates by 3× on one SKU. What do you do?", "Halt the rollout by SKU, compare against a control group, gather BMC power data, roll back the affected wave, and open a vendor case with logs."],
  ],
  poly: "Your driver work on Poly devices meant reading hardware error registers and deciding when to reset a peripheral versus report a fault. Fleet GPU triage is the same decision tree, applied across thousands of devices with logs instead of a debugger.",
  why: "Roblox's GPU Compute posting names XID, ECC, NVLink and BMC/Redfish explicitly; this is the daily language of the role.",
  companies: ["Roblox", "Anthropic", "NVIDIA", "Meta", "CoreWeave"],
  myth: { myth: "Every GPU error means the GPU is broken.", reality: "Many XIDs are caused by the application; the pattern across jobs tells you which." },
  interviewTip: "Name the four actions (keep, watch, drain, repair) and the return-to-service gate. It shows you think about the whole lifecycle, not just detection.",
},
{
  title: "Safe fleet rollouts: driver and firmware waves, health gates and blast radius",
  sim: "rollout",
  snippet: "lesson_32_2.go",
  jobs: jobs(["gpu", "POSTED: operate the GPU platform at scale including drivers and firmware; reliability at fleet scale."], ["ea", "POSTED: CI and developer infrastructure reliability; same staged-rollout discipline."]),
  concept: "Changing the GPU driver or firmware on thousands of machines is one of the most dangerous jobs a GPU platform team does. The same goes for the **CUDA** version. A bad version can break every node at once. Safe rollouts have four parts. **Waves**: update a small **canary** set first (say 1%), then 10%, 50% and 100%, with a **bake time** at each step. **Health gates**: compare the updated nodes against similar untouched nodes on the metrics that matter (error rate, XID rate, job failures, throughput). Don't compare against a fixed threshold, because the fleet's normal level drifts. **Blast-radius limits**: never take more than a set share of any pool out of service at once, so a pool keeps serving traffic and no training job loses too many nodes. **Automatic halt and rollback**: a failed gate stops the rollout and, if the old version is still available, reverts the affected wave. Pick nodes for each wave in a stable order (a hash of the node ID), so reruns are predictable and canaries cover every hardware type. A gate needs enough data to be meaningful; with few events, use a minimum sample size or a longer bake.",
  analogy: "A restaurant chain changing its recipe: try it in one kitchen, then ten, then everywhere, comparing complaints against kitchens still on the old recipe, and never closing more than a few kitchens in one city on the same day.",
  language: "Go 1.22+ · stable wave assignment, per-pool unavailability batches and a comparative health gate",
  primer: {
    text: "Updating software on thousands of machines at once is risky. Update a few first, wait, compare them with machines you haven't updated, and only then go wider. Never take too many machines from one group at the same time.",
    terms: [
      ["Canary", "A small first group that gets a change before everyone else."],
      ["Wave", "One stage of a rollout, covering a set share of the fleet."],
      ["Bake time", "How long to wait and watch after a wave before starting the next."],
      ["Health gate", "A check that must pass before the rollout continues."],
      ["Blast radius", "How much of the system a bad change can hurt at once."],
      ["Control group", "Untouched nodes used as the comparison for the updated ones."],
    ],
  },
  lines: LNgo(`
package rollout

import (
    "fmt"
    "hash/fnv"
    "math"
    "sort"
)

type Node struct {
    ID   string
    Pool string
}

// Waves splits nodes into cumulative fractions, e.g. 0.01, 0.1, 0.5, 1.0.
func Waves(nodes []Node, fracs []float64) [][]Node {
    sorted := append([]Node(nil), nodes...)
    key := func(n Node) uint64 { //@ Stable pseudo-random order: reruns give the same waves.
        h := fnv.New64a()
        h.Write([]byte(n.ID))
        return h.Sum64()
    }
    sort.Slice(sorted, func(i, j int) bool { return key(sorted[i]) < key(sorted[j]) })
    var out [][]Node
    done := 0
    for _, f := range fracs {
        upto := int(math.Ceil(f * float64(len(sorted))))
        if upto > len(sorted) {
            upto = len(sorted)
        }
        if upto > done {
            out = append(out, sorted[done:upto])
            done = upto
        }
    }
    return out
}

// Batches splits a wave so no pool has more than maxFrac of its nodes down at once.
func Batches(wave []Node, poolSize map[string]int, maxFrac float64) [][]Node {
    limit := map[string]int{}
    for p, n := range poolSize {
        l := int(math.Floor(maxFrac * float64(n)))
        if l < 1 {
            l = 1 //@ Small pools still make progress, one node at a time.
        }
        limit[p] = l
    }
    var out [][]Node
    left := append([]Node(nil), wave...)
    for len(left) > 0 {
        used := map[string]int{}
        var batch, rest []Node
        for _, n := range left {
            if used[n.Pool] < limit[n.Pool] {
                used[n.Pool]++
                batch = append(batch, n)
            } else {
                rest = append(rest, n)
            }
        }
        out = append(out, batch)
        left = rest
    }
    return out
}

type Stats struct {
    Jobs, Failures int
}

// Gate compares updated nodes with untouched control nodes.
func Gate(control, canary Stats, minJobs int, maxRatio float64) (bool, string) {
    if canary.Jobs < minJobs {
        return false, fmt.Sprintf("wait: %d/%d jobs observed", canary.Jobs, minJobs) //@ Too little data: keep baking, don't pass.
    }
    rate := func(s Stats) float64 { return (float64(s.Failures) + 1) / (float64(s.Jobs) + 2) } //@ Add-one smoothing so zero failures don't divide by zero.
    r := rate(canary) / rate(control)
    if r > maxRatio {
        return false, fmt.Sprintf("halt: failure rate %.1fx control", r)
    }
    return true, fmt.Sprintf("pass: %.2fx control", r)
}
`),
  storyLesson: {
    scenarioTitle: "The driver update that passed every test",
    scenario: "A new GPU driver passes the test lab. Rolled to 10% of a 2,000-node fleet, it looks fine for an hour, so the team goes to 100%. Six hours later, XID 79 errors spike on one GPU model under sustained load.",
    sections: [
      { title: "1 · What went wrong", body: "The canary was only 10 nodes, all the same GPU model, and the bake was shorter than the failure's onset time. There was no control group, so the slow rise looked like noise." },
      { title: "2 · Stratified waves", body: "Waves now come from a stable hash within each hardware model, so every model has canaries. Bake time is set from past failure onset data: 24 hours for drivers." },
      { title: "3 · Comparative gates", body: "Each wave's failure rate is compared with untouched nodes of the same model over the same window. A ratio above 1.5× halts the rollout; too few jobs means keep baking." },
      { title: "4 · Blast radius", body: "No pool loses more than 5% of its nodes to updates at once, and training jobs are drained at checkpoint boundaries. The next bad driver is caught at the 1% wave on 20 nodes." },
    ],
    checkpoint: { prompt: "Why compare canaries against control nodes instead of a fixed error threshold?", answer: "Fleet error levels drift with workload and time. A control group from the same window and hardware cancels that drift, so the gate measures only the change." },
    lab: { title: "Rollout simulator", brief: "Use the three functions to plan and simulate a rollout over a synthetic fleet.", steps: ["Make 2,000 nodes in 6 pools and 3 hardware models", "Generate waves at 1/10/50/100% and check the model mix in each", "Batch each wave at 5% per pool and count batches", "Inject a bad version that doubles failures on one model and find the wave that halts", "Change minJobs and see false passes and false halts"], doneWhen: "The bad version is halted before 10% of its hardware model is updated." },
  },
  exercise: "Design how you would roll a new GPU driver to 20,000 nodes that run both training and inference, without causing an outage.",
  answerHint: "Waves, canaries per hardware type, bake time, comparative gates, blast radius, rollback.",
  expected: ["canary", "wave", "bake", "control", "blast radius", "rollback"],
  modelAnswer: "Roll out in waves, 1%, 10%, 50%, 100%, with canary nodes covering every hardware model and pool. Each wave has a bake time based on how long failures took to appear in past incidents. A health gate compares updated nodes against a control group of untouched nodes on XID rate, job failures and throughput, with a minimum sample size. Blast radius is capped per pool and per training job, draining at checkpoints. A failed gate halts automatically and triggers rollback of the affected wave.",
  pitfalls: [
    "Canaries that all share one hardware type or one pool.",
    "Bake times shorter than the failure's onset.",
    "Fixed thresholds that pass or fail with the fleet's daily rhythm.",
    "No tested rollback path, because the old driver package was already removed.",
  ],
  probes: [
    ["L1 · What is a canary?", "A small first group that receives a change before everyone else, so problems hit few users."],
    ["L2 · How long should a wave bake?", "Long enough to cover the onset time of the failures you fear, from past incident data, and long enough to reach a minimum number of jobs."],
    ["L3 · Firmware can't be rolled back. What changes?", "Smaller canaries, longer bakes, a dual-bank or vendor-supported fallback, and an explicit sign-off for each wave."],
    ["L4 · Two teams roll out a driver and a kernel at the same time. How do you keep gates meaningful?", "Serialize changes per node, or tag every node with its full version tuple and compare cohorts that differ by exactly one change."],
  ],
  poly: "Shipping firmware to Poly devices in the field taught you staged releases and the fear of bricking units. The same instinct, with control groups and automatic halts, is what a staff-level fleet rollout needs.",
  why: "The GPU Compute role operates drivers and firmware on a large fleet (POSTED); staged rollouts are how platform teams avoid fleet-wide outages.",
  companies: ["Roblox", "Anthropic", "Google", "Meta", "Microsoft"],
  myth: { myth: "If it passes the test lab, it's safe to ship everywhere.", reality: "Rare and slow failures only show up at fleet scale under real load." },
  interviewTip: "Mention control groups. Most candidates describe canaries; fewer explain how they decide the canary is actually healthy.",
},
{
  title: "Sharing GPUs: MIG partitions, MPS, time-slicing and bin-packing inference",
  sim: "migpack",
  snippet: "lesson_32_3.cpp",
  jobs: jobs(["gpu", "POSTED: GPU scheduling and resource management for training and inference; utilization and efficiency of the fleet."], ["ms", "POSTED: ML serving infrastructure for robot models; GPU efficiency."]),
  concept: "Many inference models are far smaller than one GPU, so running one model per GPU wastes most of it. There are three ways to share. **Time-slicing** lets processes take turns; it's simple but gives no memory isolation and adds context-switch delay. **MPS** (Multi-Process Service) runs kernels from several processes at the same time on one GPU; throughput is good, but a fault in one client can affect the others and memory isn't hard-partitioned. **MIG** (Multi-Instance GPU, on A100, H100 and later) splits a GPU into hardware-isolated **instances**, each with its own compute slices and memory. On an H100 80GB, profiles include 1g.10gb, 2g.20gb, 3g.40gb and 7g.80gb. Instances must sit at allowed start positions, so the order you create them in matters: the wrong mix leaves slices you can't use (**fragmentation**). Then the **scheduler** packs models into instances. A standard approach is **first-fit decreasing**: sort models by size, largest first, and place each into the first GPU with a valid free spot. Good packing can cut GPU count by half or more for small models. It also changes failure blast radius: one bad GPU takes down every model packed on it.",
  analogy: "An apartment building. Time-slicing is one flat with a rota for the kitchen; MPS is flatmates cooking at once in one kitchen; MIG is splitting the floor into separate flats with their own doors. Fitting tenants well means placing the large families first.",
  language: "C++17 · simplified MIG-style slice placement with alignment rules and first-fit-decreasing packing",
  primer: {
    text: "Small AI models don't need a whole graphics card. A card can be shared by taking turns, by running together, or by splitting it into walled-off parts. This lesson packs many small models onto as few cards as possible.",
    terms: [
      ["MIG (Multi-Instance GPU)", "Splitting one GPU into isolated instances, each with its own compute and memory."],
      ["MPS (Multi-Process Service)", "NVIDIA service that lets several processes run kernels on one GPU at the same time."],
      ["Time-slicing", "Processes take turns on the whole GPU."],
      ["Profile", "A fixed MIG instance size, such as 1g.10gb or 3g.40gb."],
      ["Fragmentation", "Free capacity split into pieces too small or badly placed to use."],
      ["First-fit decreasing", "Packing method: sort items largest first, place each into the first bin where it fits."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <string>
#include <vector>

// Simplified model of a 7-slice GPU. Real placement rules: nvidia-smi mig -lgipp.
struct Profile { std::string name; int slices; int mem_gb; std::vector<int> starts; };
const std::vector<Profile> kProfiles = {
  {"1g.10gb", 1, 10, {0, 1, 2, 3, 4, 5, 6}},
  {"2g.20gb", 2, 20, {0, 2, 4}},
  {"3g.40gb", 3, 40, {0, 4}},                     //@ Alignment: a 3g instance can only start at slice 0 or 4.
  {"7g.80gb", 7, 80, {0}},
};

struct Model { std::string name; int mem_gb; int slices; };
struct Gpu { std::vector<bool> used = std::vector<bool>(7, false); std::vector<std::string> placed; };

// Smallest profile with enough memory and compute.
const Profile *fit(const Model &m) {
  for (const Profile &p : kProfiles)
    if (p.mem_gb >= m.mem_gb && p.slices >= m.slices) return &p;   //@ Profiles are listed smallest first.
  return nullptr;
}

bool place(Gpu &g, const Profile &p, const std::string &who) {
  for (int s : p.starts) {
    bool free = s + p.slices <= 7;
    for (int i = s; free && i < s + p.slices; ++i) free = !g.used[i];
    if (!free) continue;
    for (int i = s; i < s + p.slices; ++i) g.used[i] = true;
    g.placed.push_back(who + "@" + p.name);
    return true;
  }
  return false;
}

// First-fit decreasing; returns GPUs used, or -1 if a model fits no profile.
int pack(std::vector<Model> ms, std::vector<Gpu> &gpus) {
  for (const Model &m : ms) if (!fit(m)) return -1;
  std::sort(ms.begin(), ms.end(), [](const Model &a, const Model &b) {
    return fit(a)->slices > fit(b)->slices;         //@ Largest first: big pieces are hardest to place later.
  });
  for (const Model &m : ms) {
    const Profile &p = *fit(m);
    bool ok = false;
    for (Gpu &g : gpus) if ((ok = place(g, p, m.name))) break;
    if (!ok) { gpus.emplace_back(); place(gpus.back(), p, m.name); }   //@ Open a new GPU only when no existing one has a valid spot.
  }
  return static_cast<int>(gpus.size());
}
`),
  storyLesson: {
    scenarioTitle: "Forty small models on two hundred GPUs",
    scenario: "An inference platform hosts 40 models: a few large language models and many small vision, safety and embedding models. Each runs on its own GPUs, and average GPU use is 18%.",
    sections: [
      { title: "1 · Measure first", body: "Profile each model's memory and its throughput at the latency target. Most small models need under 10 GB and a fraction of the compute." },
      { title: "2 · Choose the sharing mode", body: "Latency-critical, multi-tenant models get MIG for hard isolation. A team's own batch jobs use MPS for throughput. Dev notebooks use time-slicing." },
      { title: "3 · Pack", body: "First-fit decreasing with alignment rules places the 3g models first, then 2g, then 1g. Creating a 3g instance at slice 2 would block a second 3g, so the packer only uses valid starts." },
      { title: "4 · Results and risks", body: "The small models fit on far fewer GPUs. Spread replicas of each model across GPUs and racks so one failure doesn't take down a whole model." },
    ],
    checkpoint: { prompt: "Why does packing order matter for MIG?", answer: "Instances must start at allowed slices. Placing small instances first can leave free slices that no large instance can use, which is fragmentation." },
    lab: { title: "Pack a model catalogue", brief: "Run the packer on a realistic catalogue and compare against one-model-per-GPU.", steps: ["List 30 models with memory and slice needs", "Pack with first-fit decreasing and count GPUs", "Shuffle the order (no sort) and compare", "Add a replica rule: two replicas never on the same GPU", "Report GPUs saved and blast radius per GPU"], doneWhen: "You can state the GPU saving and the worst-case number of models lost when one GPU fails." },
  },
  exercise: "Your inference fleet averages 20% GPU use with one model per GPU. How would you raise use while keeping latency and isolation guarantees?",
  answerHint: "Sharing modes and their tradeoffs, profiling, packing, replicas and blast radius.",
  expected: ["mig", "mps", "time-slicing", "packing", "isolation", "fragmentation"],
  modelAnswer: "First profile each model's memory and compute at its latency target. Choose a sharing mode: MIG gives hardware isolation for multi-tenant, latency-critical models; MPS gives higher throughput when tenants trust each other; time-slicing suits development. Do the packing with first-fit decreasing, respecting MIG alignment rules to avoid fragmentation. Keep replicas on different GPUs and racks so one failure has a small blast radius, and re-pack periodically as models change.",
  pitfalls: [
    "Using MPS between untrusted tenants, where one fault can affect others.",
    "Creating MIG instances in an order that strands slices.",
    "Packing by memory only and missing compute contention.",
    "Putting every replica of a model on the same GPU.",
  ],
  probes: [
    ["L1 · What does MIG isolate?", "Compute slices, memory and memory bandwidth paths, so one instance can't slow or crash another."],
    ["L2 · When would you choose MPS over MIG?", "When processes trust each other and need to share compute flexibly, for example one team's batch inference."],
    ["L3 · How do you change MIG layouts on a live node?", "Drain the GPU, reconfigure, run a health check, then return it; plan layouts per pool to limit churn."],
    ["L4 · Demand shifts daily between model sizes. How do you avoid constant repartitioning?", "Keep pools with fixed layouts, move capacity between pools in batches, and use a cost model that weighs repacking churn against utilization."],
  ],
  poly: "Fitting firmware, buffers and DMA regions into fixed memory on Poly hardware is the same alignment and packing problem, just with slices of a GPU instead of regions of SRAM.",
  why: "Roblox runs inference on a large GPU fleet (PUBLIC: 2024 hybrid-cloud inference blog); the GPU Compute posting asks for scheduling and efficiency at fleet scale.",
  companies: ["Roblox", "Microsoft", "NVIDIA", "Google", "Anthropic"],
  myth: { myth: "MIG is always better because it isolates.", reality: "Isolation costs flexibility. Trusted batch workloads often get more throughput from MPS." },
  interviewTip: "Lead with measurement: 'first, I'd profile each model at its latency target'. Packing without numbers is guessing.",
},
];
