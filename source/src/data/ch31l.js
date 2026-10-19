import { jobs } from "./jobs.js";
import { LN, LNgo } from "../helpers.js";

export const L31 = [
{
  title: "Failure math at accelerator scale: job MTBF, checkpoint intervals and goodput",
  sim: "goodput",
  snippet: "lesson_31_1.cpp",
  jobs: jobs(["ant", "POSTED: own reliability and scalability of systems that train AI models; preferred GPUs/TPUs/Trainium. RELATED Node Infra posting: 'driving up fleet MTBI and minimizing stranded capacity'."], ["gpu", "POSTED: GPU reliability at fleet scale and multi-node training patterns."]),
  concept: "A training job that needs every one of its machines fails whenever **any** of them fails. If one node fails on average every 50,000 hours, its **MTBF** (mean time between failures) is 50,000 h. A job on 4,096 such nodes sees a failure about every 50,000 / 4,096 ≈ 12 hours. At 16,384 nodes it is about every 3 hours. So at frontier scale, failure is the normal case, and the design question becomes how much useful work survives. Jobs save a **checkpoint** (model and optimizer state) every interval τ. Each failure loses, on average, half an interval of work plus the **restart time** (find spare nodes, reload, warm up). Writing checkpoints also costs time. **Young's formula** gives a good interval: τ ≈ √(2·C·M), where C is the time a checkpoint blocks training and M is the job MTBF. **Goodput** is the share of wall-clock time spent on training that is kept. A first-order model: waste ≈ C/τ + (τ + C)/(2M) + R/M. Three levers move it: make checkpoints cheaper to block on (asynchronous, sharded writes), make restarts faster (hot spare nodes, cached data and images), and raise node MTBF (catch bad hardware before it joins a job). **Spare capacity** follows from the same math. A 4,096-node job on a fleet where 1% of nodes are down needs enough spares that it can almost always start.",
  analogy: "A relay team of 4,000 runners where the race restarts from the last checkpoint flag whenever anyone trips. Flags cost a moment to plant. Plant them too often and you crawl; too rarely and every trip throws away a long stretch.",
  language: "C++17 · job MTBF, Young's interval, goodput, and how many spare nodes a gang job needs",
  primer: {
    text: "Big training jobs use thousands of machines at once. With that many machines, something breaks every few hours. The job saves its progress regularly, so a crash only loses the work since the last save. This lesson works out how often to save and how much time is really useful.",
    terms: [
      ["MTBF (mean time between failures)", "The average running time between failures, for one machine or a whole job."],
      ["Checkpoint", "A saved copy of the model and training state, so a job can restart from it."],
      ["Goodput", "The share of time spent on useful training that is kept, after losses from failures, restarts and saving."],
      ["Young's formula", "A rule of thumb for the checkpoint interval: the square root of 2 × checkpoint cost × MTBF."],
      ["Restart time", "Time from a failure until training is running again: replacing nodes, loading state, warming up."],
      ["Hot spare", "A healthy machine kept ready so a failed one can be replaced at once."],
      ["Binomial distribution", "The chance of exactly k failures among n independent machines that each fail with probability p."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <cmath>

// A job that needs all n nodes fails when any node fails.
double job_mtbf_hours(double node_mtbf_hours, int nodes) {   //@ Assumes independent failures. Shared power or network faults make it worse, which is why racks matter.
  return nodes > 0 ? node_mtbf_hours / nodes : 0.0;           //@ Failure rates add: n nodes fail n times as often.
}

// Young: checkpoint every sqrt(2 * C * M) hours of training.
double young_interval_hours(double ckpt_hours, double mtbf_hours) {
  if (ckpt_hours <= 0 || mtbf_hours <= 0) return 0.0;        //@ No cost or no failures: the formula doesn't apply.
  return std::sqrt(2.0 * ckpt_hours * mtbf_hours);           //@ Balances saving cost (C/tau) against lost work (tau/2M).
}

struct Plan {
  double ckpt_hours;     // time training is blocked per checkpoint //@ With async checkpoints this is only the snapshot time.
  double restart_hours;  // detect, replace nodes, reload, warm up
  double mtbf_hours;     // whole-job MTBF
};

// Share of wall time spent on training that is kept (first-order model).
double goodput(const Plan &p, double interval_hours) {
  if (interval_hours <= 0 || p.mtbf_hours <= 0) return 0.0;
  double waste = p.ckpt_hours / interval_hours                     //@ Saving cost, paid every interval.
               + (interval_hours + p.ckpt_hours) / (2 * p.mtbf_hours) //@ On average a failure lands halfway through an interval.
               + p.restart_hours / p.mtbf_hours;                   //@ Every failure also pays a restart.
  return std::clamp(1.0 - waste, 0.0, 1.0);                       //@ First-order model: only valid when the interval is well below the MTBF.
}

// P(at most k of n nodes are down) when each is down with probability p.
double binom_cdf(int k, int n, double p) {
  if (p <= 0) return 1.0;
  if (p >= 1) return k >= n ? 1.0 : 0.0;
  double s = 0;
  for (int i = 0; i <= k && i <= n; ++i) {
    double logc = std::lgamma(n + 1.0) - std::lgamma(i + 1.0) - std::lgamma(n - i + 1.0); //@ log of n-choose-i, so big n doesn't overflow.
    s += std::exp(logc + i * std::log(p) + (n - i) * std::log1p(-p));
  }
  return std::min(s, 1.0);
}

// Fewest spares so a job needing "need" nodes can start with probability >= target.
int spares_needed(int need, double p_down, double target) {
  for (int s = 0; s <= need; ++s)
    if (binom_cdf(s, need + s, p_down) >= target) return s;    //@ With s spares, up to s of the need+s nodes may be down.
  return -1;                                                   //@ Target unreachable: fix the fleet's health first.
}
`),
  storyLesson: {
    scenarioTitle: "The 16,000-GPU run that kept rewinding",
    scenario: "A team scales a training run from 2,048 to 16,384 accelerators (2,048 nodes of 8). Throughput per step looks great, but after a week the model has trained only 61% as many tokens as planned.",
    sections: [
      { title: "1 · Do the math", body: "Nodes average about 20,000 hours between failures, so the job sees one roughly every 10 hours. Checkpoints block training for 12 minutes and run every 4 hours; restarts take 40 minutes. The model predicts about 78% goodput. Measured goodput is lower because failures cluster in a few bad racks." },
      { title: "2 · Cheaper checkpoints", body: "Switching to asynchronous, sharded checkpoints cuts blocking to 40 seconds: snapshot to host memory, then upload in the background. Young's formula now says about every 45 minutes, so a failure loses far less." },
      { title: "3 · Faster restarts", body: "Keeping 2% hot spares with images and datasets pre-cached cuts restart time from 40 to 8 minutes. The spare math says 2% covers the job 99.9% of the time at the observed 0.5% node-down rate." },
      { title: "4 · Fewer failures", body: "Burn-in tests and health gates before nodes join jobs (chapter 32) raise node MTBF by about a third. Goodput reaches about 93%, and the run catches up within two weeks." },
    ],
    checkpoint: { prompt: "Why does doubling the job size roughly halve its MTBF, and what two things should change with it?", answer: "Failure rates add across nodes that must all work. Shorten the checkpoint interval (Young: about 1/√2 as long) and make restarts cheaper, or goodput falls." },
    lab: { title: "Goodput budget for a run", brief: "Build a small calculator from this lesson's functions and plan a 30-day, 8,192-node run.", steps: ["Find the job MTBF for node MTBFs of 10k, 30k and 100k hours", "Compute Young's interval for blocking costs of 10 min, 2 min and 20 s", "Plot goodput against interval and check that the optimum is near Young's value", "Add restart time options (40, 15, 5 min) and rank the three levers", "Size spares for 99% and 99.9% start probability at 0.5% and 2% down rates"], doneWhen: "You can say which lever buys the most goodput for this run and back it with numbers." },
  },
  exercise: "A 4,096-node training job sees a failure about every 12 hours. Checkpoints block training for 6 minutes and restarts take 20 minutes. How do you choose the checkpoint interval, and what would you change to raise goodput?",
  answerHint: "MTBF math, Young's formula, then the three levers.",
  expected: ["mtbf", "interval", "young", "goodput", "async", "restart"],
  modelAnswer: "Job MTBF is node MTBF divided by node count, about 12 hours here. Young's formula gives an interval near sqrt(2 x 0.1 h x 12 h), about 1.5 hours, which balances checkpoint cost against lost work. Goodput is then roughly 1 minus C/tau, minus (tau+C)/2M, minus R/M, about 87%. To raise it: async sharded checkpoints so blocking drops to seconds and the interval can shrink, faster restart with hot spares and cached images, and health gates that raise node MTBF.",
  pitfalls: [
    "Planning with node MTBF instead of job MTBF.",
    "Checkpointing on a fixed schedule copied from a smaller job.",
    "Ignoring restart time, which often costs more than checkpoints.",
    "Assuming failures are independent when racks, power or a bad firmware batch fail together.",
  ],
  probes: [
    ["L1 · Why is failure 'normal' for a 16k-GPU job?", "Failure rates add across all nodes the job needs; thousands of nodes turn a rare per-node event into one every few hours."],
    ["L2 · How do you get the blocking cost C from minutes to seconds?", "Snapshot state to host memory or local NVMe and return to training, then upload shards in parallel in the background; only the snapshot blocks."],
    ["L3 · What breaks if you checkpoint every 5 minutes with async writes?", "Uploads overlap and storage bandwidth saturates. Keep at most one upload in flight and skip a step if the previous one hasn't committed."],
    ["L4 · Failures are correlated by rack. How does the math change?", "Treat the rack as the failure unit for spares and placement; spread gangs across racks only if the network allows, and quarantine racks with clustered failures."],
  ],
  poly: "On Poly devices you budgeted for watchdog resets and field failures across a large installed base. This is the same reliability math, moved from one device times many customers to one job times thousands of nodes.",
  why: "Anthropic's Infrastructure org runs the systems that train its models; the related Node Infra posting names fleet MTBI and stranded capacity. Interviewers expect you to reason about failure rates with numbers.",
  companies: ["Anthropic", "Meta", "Google", "OpenAI", "Roblox"],
  myth: { myth: "Better hardware makes checkpoints unnecessary.", reality: "Even excellent nodes fail every few hours when you need thousands of them at once." },
  interviewTip: "Say 'job MTBF is node MTBF over N' in the first minute of any large-training design question, then size the interval with Young's formula.",
},
{
  title: "Checkpointing at scale: sharded, asynchronous writes with atomic manifests",
  sim: "ckpt",
  snippet: "lesson_31_2.go",
  jobs: jobs(["ant", "POSTED: data pipelines, databases and the systems that train models; reliability of what you build."], ["gpu", "POSTED: multi-node training patterns on the GPU fleet."]),
  concept: "The saved state of a big AI system is huge, often many million megabytes. It holds the **weights**, the **optimizer state** (often 2–3× the weights) and data-loader positions. One machine can't write that quickly, so every worker writes its own **shard** in parallel to object storage. The hard part is **atomicity**. A crash mid-save must never leave a half-written checkpoint that looks valid. The standard pattern: write all shards under a step-specific prefix, then write a small **manifest** last, listing each shard with its size and **checksum**. A step counts as valid only if its manifest exists and every shard matches. That is a commit point, like a database commit record. **Asynchronous checkpointing** splits the save in two. A quick **snapshot** copies state to host memory, so training continues. A background upload then sends the snapshot to storage. Keep at most one upload in flight, or uploads pile up and memory runs out. **Restore** picks the newest valid step, verifies checksums and loads shards in parallel. Each worker reads only the shards it needs, which helps when the restart uses a different number of workers (**resharding**). **Retention** deletes old steps safely: delete the manifest first, then the shards, so a half-deleted step can never be loaded.",
  analogy: "Moving house with 500 boxes. Each mover carries their own boxes (shards), and only when all are inside do you sign the delivery note (manifest). If the truck crashes halfway, there's no signed note, so nobody mistakes a half-empty house for the finished move.",
  language: "Go 1.22+ · parallel shard writes, checksummed manifest commit, newest-valid restore and safe retention",
  primer: {
    text: "Saving a huge model means many machines each write their own piece at the same time. The save only counts once a small list of all pieces is written last. If anything crashes earlier, the old save is still the one used.",
    terms: [
      ["Shard", "One piece of a checkpoint, written by one worker."],
      ["Manifest", "A small file written last that lists every shard and its checksum; its presence marks the checkpoint as complete."],
      ["Checksum", "A short fingerprint of data (here SHA-256) used to detect corruption."],
      ["Atomic commit", "A change that is either fully visible or not at all, never half done."],
      ["Asynchronous checkpoint", "Copy state quickly, resume training, and upload in the background."],
      ["Resharding", "Loading a checkpoint into a different number of workers than wrote it."],
      ["Retention", "Rules for which old checkpoints to keep and safely delete."],
    ],
  },
  lines: LNgo(`
package ckpt

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "errors"
    "fmt"
    "sort"
    "strings"
    "sync"
)

// Store is object storage: whole-object puts, no partial reads of a put in progress.
type Store interface { //@ S3, GCS and similar stores give exactly this: an object appears whole or not at all.
    Put(key string, data []byte) error
    Get(key string) ([]byte, error)
    List(prefix string) []string
    Delete(key string) error
}

type Manifest struct {
    Step   int      \`json:"step"\`
    Shards []string \`json:"shards"\` //@ SHA-256 of each shard, in order.
}

func prefix(step int) string { return fmt.Sprintf("ckpt/step-%08d/", step) } //@ Zero-padded so text order equals numeric order.

func sum(b []byte) string {
    h := sha256.Sum256(b)
    return hex.EncodeToString(h[:])
}

// Save writes shards in parallel (at most par at once), then commits the manifest.
func Save(ctx context.Context, s Store, step int, shards [][]byte, par int) error {
    if par < 1 {
        par = 1
    }
    m := Manifest{Step: step, Shards: make([]string, len(shards))}
    sem := make(chan struct{}, par) //@ Bound the uploads (lesson 27.1).
    var wg sync.WaitGroup
    var mu sync.Mutex
    var firstErr error
    for i, b := range shards {
        if ctx.Err() != nil {
            break
        }
        sem <- struct{}{}
        wg.Add(1)
        go func(i int, b []byte) {
            defer wg.Done()
            defer func() { <-sem }()
            m.Shards[i] = sum(b) //@ Each goroutine writes only its own index.
            if err := s.Put(fmt.Sprintf("%sshard-%05d", prefix(step), i), b); err != nil {
                mu.Lock()
                if firstErr == nil {
                    firstErr = err
                }
                mu.Unlock()
            }
        }(i, b)
    }
    wg.Wait()
    if firstErr != nil {
        return firstErr //@ No manifest: this step is invisible, the previous one stays current.
    }
    if err := ctx.Err(); err != nil {
        return err
    }
    mb, _ := json.Marshal(m)
    return s.Put(prefix(step)+"MANIFEST", mb) //@ The commit point. Written last, after every shard succeeded.
}

// SaveAsync snapshots now and uploads in the background.
func SaveAsync(ctx context.Context, s Store, step int, shards [][]byte, par int) <-chan error {
    snap := make([][]byte, len(shards))
    for i, b := range shards {
        snap[i] = append([]byte(nil), b...) //@ The snapshot: training may now overwrite its buffers.
    }
    done := make(chan error, 1) //@ Buffered so the goroutine never blocks if nobody reads.
    go func() { done <- Save(ctx, s, step, snap, par) }()
    return done
}

var ErrNone = errors.New("no valid checkpoint")

// Latest returns the newest step whose manifest exists and whose shards verify.
func Latest(s Store) (int, [][]byte, error) {
    var steps []int
    for _, k := range s.List("ckpt/") {
        var st int
        if strings.HasSuffix(k, "/MANIFEST") {
            if _, err := fmt.Sscanf(k, "ckpt/step-%08d/MANIFEST", &st); err == nil {
                steps = append(steps, st)
            }
        }
    }
    sort.Sort(sort.Reverse(sort.IntSlice(steps))) //@ Newest first.
    for _, st := range steps {
        if data, err := Load(s, st); err == nil {
            return st, data, nil
        }
    } //@ A corrupt newest step falls back to the one before it.
    return 0, nil, ErrNone
}

// Load reads one step and verifies every shard against the manifest.
func Load(s Store, step int) ([][]byte, error) {
    mb, err := s.Get(prefix(step) + "MANIFEST")
    if err != nil {
        return nil, err
    }
    var m Manifest
    if err := json.Unmarshal(mb, &m); err != nil {
        return nil, err
    }
    out := make([][]byte, len(m.Shards))
    for i, want := range m.Shards {
        b, err := s.Get(fmt.Sprintf("%sshard-%05d", prefix(step), i))
        if err != nil {
            return nil, err
        }
        if sum(b) != want {
            return nil, fmt.Errorf("step %d shard %d: checksum mismatch", step, i) //@ Silent corruption is caught here, not three days into training.
        }
        out[i] = b
    }
    return out, nil
}

// Retain keeps the newest keep committed steps and deletes the rest safely.
func Retain(s Store, keep int) {
    var steps []int
    for _, k := range s.List("ckpt/") {
        var st int
        if _, err := fmt.Sscanf(k, "ckpt/step-%08d/MANIFEST", &st); err == nil {
            steps = append(steps, st)
        }
    }
    sort.Ints(steps)
    for i := 0; i+keep < len(steps); i++ {
        p := prefix(steps[i])
        _ = s.Delete(p + "MANIFEST") //@ Manifest first: the step stops being valid before any shard disappears.
        for _, k := range s.List(p) {
            _ = s.Delete(k)
        }
    }
}
`),
  storyLesson: {
    scenarioTitle: "The checkpoint that looked fine",
    scenario: "A job restarts after a power event and loads the newest checkpoint folder. Loss jumps to a value from weeks ago. Half the optimizer shards in that folder were from an interrupted save.",
    sections: [
      { title: "1 · What went wrong", body: "The old code picked the newest folder by name. A crash during save left some new shards next to missing ones, and the loader filled gaps with zeros." },
      { title: "2 · Commit with a manifest", body: "Now shards go first and the manifest last. The loader ignores any step without a manifest and checks every shard's SHA-256. The interrupted step is invisible, and the previous one loads." },
      { title: "3 · Stop blocking training", body: "SaveAsync copies state to host memory in 30 seconds. The upload then takes 9 minutes in the background with 64 parallel writers, capped so it doesn't starve data loading." },
      { title: "4 · Delete safely", body: "Retention once deleted shards before the manifest, and a restart during cleanup loaded a broken step. Deleting the manifest first closes that window." },
    ],
    checkpoint: { prompt: "Why write the manifest last and delete it first?", answer: "Its presence defines validity. Written last, a step is never valid before all shards exist. Deleted first, a step is never valid after any shard is gone." },
    lab: { title: "Crash-test your checkpoints", brief: "Use an in-memory Store that can fail any Put or Get, and try to break Save, Latest and Retain.", steps: ["Fail a random shard Put and check Latest returns the previous step", "Corrupt one byte of a shard and check Latest skips that step", "Cancel the context mid-save and confirm no manifest is written", "Run SaveAsync while mutating the source buffers and verify the saved data is the snapshot", "Run Retain while another goroutine loads, under go test -race"], doneWhen: "No injected failure ever makes Latest return a step whose data doesn't match what was saved." },
  },
  exercise: "Design checkpoint save and restore for a model with 2 TB of state written by 1,024 workers. How do you make it fast, crash-safe and verifiable?",
  answerHint: "Shards in parallel, manifest last, checksums, async snapshot.",
  expected: ["shard", "parallel", "manifest", "checksum", "async", "retention"],
  modelAnswer: "Each worker writes its own shard in parallel to object storage under a step prefix, with bounded concurrency. The manifest listing every shard and its checksum is written last as the atomic commit point, so a crash never exposes a partial step. Async checkpointing snapshots to host memory and uploads in the background so training barely blocks. Restore picks the newest step with a manifest, verifies checksums and falls back to an older step on mismatch. Retention deletes the manifest first, then shards.",
  pitfalls: [
    "Treating the newest folder as the newest valid checkpoint.",
    "No checksums, so silent corruption loads.",
    "Unbounded parallel uploads that starve the data pipeline or the network.",
    "Starting a new async save before the previous one committed.",
  ],
  probes: [
    ["L1 · Why not one file per checkpoint?", "One writer is too slow for terabytes; parallel shards use every worker's bandwidth."],
    ["L2 · How do you restore with a different number of workers?", "Store shards with their logical layout (tensor name and slice); the loader maps old slices to new owners and reads only what it needs."],
    ["L3 · Storage is eventually consistent for listings. What changes?", "Don't trust List alone; read the manifest directly and retry missing shards, or keep a separate index of committed steps in a strongly consistent store."],
    ["L4 · How do you know a checkpoint is actually loadable before you need it?", "Continuously restore-test a sample: load into a spare job, run a few steps and compare loss with the original run."],
  ],
  poly: "Firmware updates on Poly devices wrote the image first and flipped a small header or flag last so a power cut never booted half an image. A checkpoint manifest is the same commit-last idea at datacenter scale.",
  why: "Training reliability at Anthropic's scale depends on checkpoints that are fast and never lie. This is a typical deep-dive topic in infrastructure interviews.",
  companies: ["Anthropic", "Meta", "Google", "Microsoft", "OpenAI"],
  myth: { myth: "If the files are there, the checkpoint is good.", reality: "Only a committed manifest plus matching checksums makes a checkpoint valid." },
  interviewTip: "Draw the timeline: snapshot, return to training, upload shards, write manifest. Then say what happens if a crash hits each segment.",
},
{
  title: "Scheduling accelerator jobs: gangs, quotas, fair share and preemption",
  sim: "gang",
  snippet: "lesson_31_3.go",
  jobs: jobs(["ant", "POSTED: partner with research teams on compute needs; RELATED Node/Cluster Infra postings name Kubernetes scheduler internals and Borg-like orchestration."], ["gpu", "POSTED: architect how GPU capacity is exposed to compute platforms, including scheduling and isolation."]),
  concept: "Chapter 29 placed single tasks. Training jobs are different in three ways. A distributed job is useful only if **all** its workers run at once, so it needs **gang scheduling**: start all N or none. Half-started gangs waste GPUs while they wait for the rest, and two half-started gangs can deadlock each other. Second, many teams share one cluster. Each team gets a **quota** (a guaranteed share), and may **borrow** idle capacity beyond it. When an owner needs its quota back, the scheduler **preempts** borrowed work. That is fine for jobs that checkpoint (lesson 31.2). Third, **fair share** decides who goes next when demand exceeds supply. A common rule picks the team using the smallest fraction of its guarantee. **Dominant resource fairness** generalizes this to several resources. Big gangs risk **starvation**. If small jobs keep **backfilling** into gaps, a 512-node job may never find 512 free nodes at once. Schedulers add a **reservation**: after a big job has been skipped too often, hold freed nodes for it. In Kubernetes this logic lives in batch schedulers and queueing add-ons (Volcano, Kueue, YuniKorn), not the default scheduler.",
  analogy: "A restaurant with tables for big parties. A party of 12 is only seated when all 12 chairs are free (gang). Each club has booked chairs (quota) but may use empty ones (borrowing) until the owners arrive (preemption). If you keep seating walk-in couples, the party of 12 waits forever, so after a while you hold tables for them (reservation).",
  language: "Go 1.22+ · an all-or-nothing gang scheduler with quotas, borrowing, preemption of borrowers and anti-starvation reservation",
  primer: {
    text: "Training jobs need all their machines at the same time, and many teams share one cluster. The scheduler starts a job only when all its machines are free, gives each team a guaranteed share, and takes back borrowed machines when the owners need them.",
    terms: [
      ["Gang scheduling", "Starting all of a job's workers together, or none of them."],
      ["Quota", "The capacity a team is guaranteed."],
      ["Borrowing", "Using idle capacity beyond your quota, which can be taken back."],
      ["Preemption", "Stopping a running job to free resources for a higher-claim job."],
      ["Fair share", "A rule for whose job runs next when demand exceeds capacity."],
      ["Backfill", "Running small jobs in gaps while bigger jobs wait."],
      ["Starvation", "A job that never runs because others keep taking the resources it needs."],
    ],
  },
  lines: LNgo(`
package gang

import "sort"

type Job struct {
    ID, Team string
    Nodes    int //@ All-or-nothing: the job needs this many whole nodes at once.
    Prio     int
    Seq      int //@ Submission order, for ties.
}

type Sched struct {
    Free      int
    Guarantee map[string]int //@ Nodes each team is promised.
    MaxSkips  int            //@ After this many skips, hold capacity for the job.
    Queue     []Job
    Running   map[string]Job
    used      map[string]int
    skips     map[string]int
    seq       int
}

func New(free int, guarantee map[string]int, maxSkips int) *Sched {
    return &Sched{Free: free, Guarantee: guarantee, MaxSkips: maxSkips,
        Running: map[string]Job{}, used: map[string]int{}, skips: map[string]int{}}
}

func (s *Sched) Submit(j Job) {
    s.seq++
    j.Seq = s.seq
    s.Queue = append(s.Queue, j)
}

// share is how much of its guarantee a team uses; lower goes first.
func (s *Sched) share(team string) float64 {
    g := s.Guarantee[team]
    if g < 1 {
        g = 1 //@ Teams with no guarantee still get ordered, just last.
    }
    return float64(s.used[team]) / float64(g)
}

func (s *Sched) start(j Job) {
    s.Free -= j.Nodes
    s.used[j.Team] += j.Nodes
    s.Running[j.ID] = j
}

// Finish releases a job's nodes.
func (s *Sched) Finish(id string) {
    if j, ok := s.Running[id]; ok {
        delete(s.Running, id)
        s.Free += j.Nodes
        s.used[j.Team] -= j.Nodes
    }
}

// reclaim preempts borrowers so team can get need nodes within its guarantee.
func (s *Sched) reclaim(need int) []string {
    var victims []Job
    for _, r := range s.Running {
        if s.used[r.Team] > s.Guarantee[r.Team] { //@ Only teams above their guarantee can lose jobs.
            victims = append(victims, r)
        }
    }
    sort.Slice(victims, func(a, b int) bool { //@ Cheapest victims first: low priority, then newest.
        if victims[a].Prio != victims[b].Prio {
            return victims[a].Prio < victims[b].Prio
        }
        return victims[a].Seq > victims[b].Seq
    })
    avail := s.Free
    var pick []Job
    taken := map[string]int{}
    for _, v := range victims {
        if avail >= need {
            break
        }
        if s.used[v.Team]-taken[v.Team] <= s.Guarantee[v.Team] {
            continue //@ Only take from teams still borrowing, counting victims already picked.
        }
        pick = append(pick, v)
        taken[v.Team] += v.Nodes
        avail += v.Nodes
    }
    if avail < need {
        return nil //@ Not enough to reclaim: preempt nobody rather than waste work.
    }
    var ids []string
    for _, v := range pick {
        s.Finish(v.ID)
        s.Submit(Job{ID: v.ID, Team: v.Team, Nodes: v.Nodes, Prio: v.Prio}) //@ Back in the queue; it resumes from its checkpoint.
        ids = append(ids, v.ID)
    }
    return ids
}

// Step starts what it can and returns started and preempted job IDs.
func (s *Sched) Step() (started, preempted []string) {
    sort.SliceStable(s.Queue, func(a, b int) bool {
        x, y := s.Queue[a], s.Queue[b]
        if x.Prio != y.Prio {
            return x.Prio > y.Prio
        }
        if sx, sy := s.share(x.Team), s.share(y.Team); sx != sy {
            return sx < sy //@ Fair share: the team furthest below its guarantee goes first.
        }
        return x.Seq < y.Seq
    })
    n := len(s.Queue) //@ Jobs requeued by reclaim during this pass land after index n.
    var rest []Job
    blocked := false
    for _, j := range s.Queue[:n] {
        if blocked { //@ Reservation: a starving job holds everything behind it.
            rest = append(rest, j)
            continue
        }
        if j.Nodes > s.Free && s.used[j.Team]+j.Nodes <= s.Guarantee[j.Team] {
            preempted = append(preempted, s.reclaim(j.Nodes)...) //@ Owner wants its guaranteed capacity back.
        }
        if j.Nodes <= s.Free {
            s.start(j) //@ Whole gang at once.
            started = append(started, j.ID)
            delete(s.skips, j.ID)
            continue
        }
        s.skips[j.ID]++
        if s.skips[j.ID] > s.MaxSkips {
            blocked = true //@ Stop backfilling smaller jobs into nodes this one needs.
        }
        rest = append(rest, j)
    }
    s.Queue = append(rest, s.Queue[n:]...) //@ Keep the preempted jobs for the next pass.
    return started, preempted
}
`),
  storyLesson: {
    scenarioTitle: "The 512-node run that never started",
    scenario: "A research team submits a 512-node pretraining job on a 2,000-node cluster shared by four teams. Two days later it still hasn't started, although the cluster is never more than 80% busy.",
    sections: [
      { title: "1 · Death by backfill", body: "Small evaluation jobs keep landing in every gap, so 512 nodes are never free at the same moment. The utilization graph looks healthy while the most important job starves." },
      { title: "2 · Reserve", body: "After the big job is skipped 20 times, the scheduler stops backfilling and holds freed nodes. It starts within 40 minutes; utilization dips briefly while capacity drains." },
      { title: "3 · Quotas and borrowing", body: "The research team owns 800 nodes, but another team borrowed 300 of them overnight. Reclaim preempts the borrowed, low-priority jobs (they resume from checkpoints) without touching anyone's guarantee." },
      { title: "4 · Measure it", body: "New dashboards show queue wait by job size, preemptions per team and nodes idle because of reservation. The policy becomes a documented contract that every team signs off on." },
    ],
    checkpoint: { prompt: "Why is starting 300 of a job's 512 workers worse than starting none?", answer: "The started workers can't make progress without the rest, so they hold GPUs doing nothing, and two partial gangs can block each other forever." },
    lab: { title: "Starvation and fairness experiments", brief: "Drive the scheduler with a synthetic trace: many 1–8-node jobs and occasional 256-node gangs from four teams.", steps: ["Measure big-job queue wait with MaxSkips = infinity, 50 and 5", "Track utilization lost to reservation for each setting", "Give one team a burst of jobs and check the others still get their guarantees", "Count preemptions and lost work (half a checkpoint interval each)", "Write the policy as a one-page contract for team leads"], doneWhen: "You can pick a MaxSkips value and defend it with wait-time and utilization numbers." },
  },
  exercise: "Several research teams share a 10,000-GPU cluster for jobs from 8 to 4,096 GPUs. How do you schedule them fairly without starving big jobs or wasting GPUs?",
  answerHint: "Gangs, quotas with borrowing, preemption, fair share, reservation.",
  expected: ["gang", "quota", "borrow", "preempt", "fair", "starv"],
  modelAnswer: "Use gang scheduling so a job's workers start together or not at all. Give each team a quota and let them borrow idle capacity, then preempt borrowed, low-priority work (which resumes from checkpoints) when an owner needs its guarantee. Order the queue by priority, then fair share. To prevent starvation of big jobs by backfill, reserve capacity after a job has been skipped too often. Also place gangs within network topology domains and measure queue wait by job size.",
  pitfalls: [
    "Scheduling workers one at a time with the default pod scheduler.",
    "Preempting jobs that don't checkpoint.",
    "Unlimited backfill that starves the largest jobs.",
    "Fair share by job count instead of resources used.",
  ],
  probes: [
    ["L1 · What is gang scheduling and why do training jobs need it?", "All-or-nothing start; collective communication can't run until every rank is present."],
    ["L2 · How do you add topology to the gang decision?", "Require the whole gang inside one network domain (a rail group or spine block). Treat each domain as a bin and gang-place within it, or relax with a penalty."],
    ["L3 · How do you avoid preemption storms?", "Minimum runtime before a job can be preempted, preemption budgets per team, and preferring victims whose last checkpoint is recent."],
    ["L4 · How would you build this on Kubernetes at 10k nodes?", "A queueing layer (Kueue-style) admits whole workloads against quotas, a gang-aware scheduler plugin places pods, and node health labels keep bad nodes out. Measure scheduler throughput, since per-pod scheduling at this scale is a bottleneck."],
  ],
  poly: "Poly's device test labs shared scarce test rigs across teams with booking rules and priority overrides. Quotas, borrowing and reservations are the same fairness problem with GPUs instead of rigs.",
  why: "Anthropic's posting has you translating research teams' compute needs into systems; scheduling shared accelerator capacity is the core of that. Roblox's GPU role names scheduling and isolation directly.",
  companies: ["Anthropic", "Roblox", "Google", "Meta", "NVIDIA"],
  myth: { myth: "High utilization means the scheduler is working.", reality: "A cluster can be 80% busy with small jobs while the most important large job starves." },
  interviewTip: "Name starvation by backfill before the interviewer does, and propose reservation with a number.",
},
{
  title: "Kubernetes at extreme scale: the API server, etcd, watch storms and fairness",
  sim: "apiserver",
  snippet: "lesson_31_4.go",
  jobs: jobs(["ant", "POSTED: 'some of the largest Kubernetes clusters in the world'; Kubernetes and IaC required. RELATED postings: hyperscale (100+ clusters, 10K+ nodes), Kubernetes internals."]),
  concept: "Chapter 27 wrote one controller. At tens of thousands of nodes, the **control plane** is the bottleneck. Every object lives in **etcd**, a Raft-replicated key-value store with a modest size limit (about 8 GB is a common recommended maximum) and finite write throughput. The **API server** sits in front of etcd. It keeps a **watch cache** so most reads and watches are served from memory, not etcd. Clients (kubelets, controllers, daemons on every node) use **list-then-watch**. They list once, then watch for changes from that list's **resourceVersion**. If a watch breaks and the client's version is too old (compacted away), the server answers **410 Gone** and the client must re-list. The classic outage is a **list storm**. Something makes every node's agent restart at once, and 20,000 full lists of all pods hit the API server together. Memory spikes, the server falls over, clients retry, and it gets worse. Defenses come in layers. Clients use **exponential backoff with jitter**, so retries spread out. Lists are served from the watch cache and paginated. Large clusters split heavy object types across separate etcd instances. **API Priority and Fairness** (APF) gives each priority level its own concurrency share and queues requests fairly per **flow**, so a misbehaving client can't starve the node heartbeats and system controllers that keep the cluster alive. Beyond one cluster's limits, you run **many clusters** with a fleet layer on top.",
  analogy: "A library with one front desk. Normally people ask 'what changed since Tuesday?' (watch). After a fire drill, everyone rushes back at once asking for the full catalogue (list storm). The fix: staggered return times (jitter), a photocopy of the catalogue at the desk (watch cache), and separate lines so staff with urgent errands aren't stuck behind the crowd (priority and fairness).",
  language: "Go 1.22+ · full-jitter backoff, the relist-on-410 rule, and a small priority-and-fairness admission queue",
  primer: {
    text: "Huge clusters keep all their state in one replicated database, behind one front door. If thousands of machines ask for everything at once, the front door falls over. Spreading retries out, answering from memory and giving important callers their own lane keeps it standing.",
    terms: [
      ["etcd", "The replicated key-value store that holds every Kubernetes object."],
      ["API server", "The front door to cluster state; every client reads and writes through it."],
      ["Watch", "A long-lived request that streams changes after a given version."],
      ["resourceVersion", "A version number for cluster state, used to resume a watch where it left off."],
      ["List storm", "Many clients re-listing large collections at the same moment, overloading the API server."],
      ["Jitter", "Random spread added to retry delays so clients don't retry in lockstep."],
      ["API Priority and Fairness (APF)", "Kubernetes' admission control: concurrency shares per priority level and fair queuing per client flow."],
    ],
  },
  lines: LNgo(`
package apf

import (
    "math/rand"
    "time"
)

// Backoff returns a full-jitter delay: random in [0, min(cap, base*2^attempt)].
func Backoff(attempt int, base, max time.Duration, r *rand.Rand) time.Duration {
    d := base
    for i := 0; i < attempt && d < max; i++ {
        d *= 2 //@ Exponential growth, stopped at the cap (no overflow).
    }
    if d > max {
        d = max
    }
    return time.Duration(r.Int63n(int64(d) + 1)) //@ Full jitter: 20,000 clients spread across the whole window instead of retrying together.
}

// NeedRelist: a watch can resume only if its version wasn't compacted away.
func NeedRelist(lastRV, compactedRV int64) bool {
    return lastRV < compactedRV //@ The server would answer 410 Gone; the client must list again (from the cache, paginated).
}

// Level is one priority level: a concurrency share plus fair queues per flow.
type Level struct {
    Limit    int //@ Seats this level may use at once.
    MaxQueue int //@ Per-flow queue length before rejecting (429).
    inflight int
    queues   map[string][]string //@ Flow (for example, one client identity) -> waiting request IDs.
    order    []string            //@ Round-robin order of flows with waiting requests.
}

func NewLevel(limit, maxQueue int) *Level {
    return &Level{Limit: limit, MaxQueue: maxQueue, queues: map[string][]string{}}
}

// Admit returns "run", "queued" or "rejected".
func (l *Level) Admit(flow, req string) string {
    if l.inflight < l.Limit && len(l.order) == 0 {
        l.inflight++
        return "run"
    }
    q := l.queues[flow]
    if len(q) >= l.MaxQueue {
        return "rejected" //@ One noisy flow fills only its own queue.
    }
    if len(q) == 0 {
        l.order = append(l.order, flow)
    }
    l.queues[flow] = append(q, req)
    return "queued"
}

// Done frees a seat and returns the next request to run (round robin across flows), or "".
func (l *Level) Done() string {
    if l.inflight > 0 {
        l.inflight--
    }
    if len(l.order) == 0 || l.inflight >= l.Limit {
        return ""
    }
    flow := l.order[0]
    l.order = l.order[1:]
    q := l.queues[flow]
    next := q[0]
    if len(q) > 1 {
        l.queues[flow] = q[1:]
        l.order = append(l.order, flow) //@ Back of the line: each flow gets one turn per round.
    } else {
        delete(l.queues, flow)
    }
    l.inflight++
    return next
}
`),
  storyLesson: {
    scenarioTitle: "The daemonset rollout that took down the control plane",
    scenario: "A config change restarts a logging daemon on all 18,000 nodes within two minutes. Each instance lists every pod in the cluster on startup. The API servers run out of memory and restart, and node heartbeats start failing.",
    sections: [
      { title: "1 · Why it cascades", body: "Each restart triggers fresh lists from every client, including kubelets whose watches broke. Retries with fixed 1-second delays arrive in synchronized waves." },
      { title: "2 · Stop the stampede", body: "Clients switch to full-jitter backoff, and the daemon lists only pods on its own node (a field selector), served from the watch cache. Load per restart drops by more than 1,000×." },
      { title: "3 · Protect the vital traffic", body: "APF puts node heartbeats and system controllers in their own priority level. The daemon's flow is limited to its own queue, so it can be slow without starving the cluster." },
      { title: "4 · Make rollouts safe", body: "Daemon rollouts now go out in waves (max unavailable 2%), and the team adds an API-server load SLO that pauses rollouts automatically." },
    ],
    checkpoint: { prompt: "Why does adding jitter help even though the total number of requests is the same?", answer: "Overload depends on the peak rate, not the total. Jitter spreads the same retries across the backoff window, so the peak drops and the server can keep up." },
    lab: { title: "Simulate a list storm", brief: "Model 20,000 clients that restart at t=0 and list, with a server that can serve 500 lists per second.", steps: ["Retry with a fixed 1 s delay and plot server queue length", "Switch to exponential backoff without jitter, then with full jitter", "Add per-flow fair queuing with a vital flow sending one request per second", "Measure the vital flow's latency in each configuration", "Write a rollout guardrail for daemonsets based on your results"], doneWhen: "Your plot shows the storm clearing and the vital flow staying fast with jitter and APF." },
  },
  exercise: "A cluster with 15,000 nodes keeps having control-plane outages after large rollouts. What is likely happening, and how do you fix it at the client, server and cluster-design levels?",
  answerHint: "List storms, backoff with jitter, watch cache, APF, and cluster size.",
  expected: ["list", "watch", "jitter", "backoff", "priority", "etcd"],
  modelAnswer: "Rollouts restart many clients at once and each does a full list, so the API server and etcd are overwhelmed and retries make it worse. On clients, use exponential backoff with jitter, narrow lists with selectors, and resume watches from their resourceVersion rather than relisting. On the server, serve lists from the watch cache with pagination and use API Priority and Fairness so heartbeats and system controllers keep their own share. At design level, roll out in waves, split heavy resources into separate etcd, and cap cluster size, using multiple clusters beyond it.",
  pitfalls: [
    "Retrying with a fixed delay, which synchronizes clients.",
    "Every node agent listing cluster-wide objects it doesn't need.",
    "Treating etcd as a general database for large or chatty data.",
    "Fixing outages by adding API-server replicas while the storm cause remains.",
  ],
  probes: [
    ["L1 · What is a watch, and what does resourceVersion do?", "A stream of changes after a version; resuming from the last seen version avoids a full re-list."],
    ["L2 · What happens when the version was compacted?", "410 Gone; the client must re-list. Watch bookmarks keep versions fresh so this is rarer."],
    ["L3 · How does APF prevent one client from starving others?", "Priority levels get separate concurrency shares; inside a level, requests are queued per flow and dispatched fairly, and overflowing flows are rejected with 429."],
    ["L4 · When do you split into many clusters, and what do you lose?", "When etcd size, write rate or failure blast radius exceed safe limits. You lose a single scheduling pool, so you need a fleet layer to place jobs and to roll out changes cluster by cluster."],
  ],
  poly: "Poly devices reconnecting to a management server after an outage is the same herd problem. Randomized reconnect delays, which you may have shipped in device firmware, are exactly full-jitter backoff.",
  why: "Anthropic's posting says it runs some of the largest Kubernetes clusters in the world. Interviewers for Kubernetes-heavy infrastructure ask what breaks at scale, not how to write YAML.",
  companies: ["Anthropic", "Google", "OpenAI", "Datadog", "Apple"],
  myth: { myth: "Add more API-server replicas and the control plane scales.", reality: "etcd and client behaviour set the limit. Without jitter, caching and fairness, more replicas just fall over together." },
  interviewTip: "When asked about a Kubernetes outage, start with 'who started listing what, all at once?' It's the most common answer at scale.",
},
];
