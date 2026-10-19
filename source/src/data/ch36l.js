import { jobs } from "./jobs.js";
import { LN, LNgo } from "../helpers.js";

const common = {
  companies: ["Anthropic", "Roblox", "Qualcomm", "Microsoft"],
};

export const L36 = [
{
  ...common,
  title: "Anthropic playbook: Staff+ Infrastructure, and a practical job queue with leases",
  sim: "playbook_ant",
  snippet: "lesson_36_1.go",
  jobs: jobs(["ant", "POSTED: Staff+ Infrastructure (Distributed Systems); coding interviews are practical, not LeetCode-style (application form)."]),
  concept: "**What the role really is.** One requisition covers SF, NYC and Seattle (POSTED); the two LinkedIn cards are the same job. You interview for the Infrastructure organization, and **team placement happens after the interview** (POSTED). So prepare broadly: training and serving reliability, clusters, scheduling, data systems. **The loop.** Anthropic's application form says it does not run LeetCode-style interviews and wants practical coding in your best language (POSTED). Third-party guides report a recruiter call, a technical screen and about 4–5 rounds: coding, system design, a project deep dive, a hiring-manager/behavioral round and a culture/values round (PUBLIC, reported). Coding is reported to grow in stages, adding concurrency and failure cases as you go. **Practice problem.** A **work queue with leases** is a classic practical exercise. A worker **leases** a job for a fixed time. It must **ack** before the lease expires, or the job returns to the queue. Each lease gets a **token**, so a slow worker's late ack can't complete a job that someone else now owns. After too many attempts, the job goes to a **dead-letter queue** for humans to inspect. **Mapping your Poly experience.** Staff-level stories show scope, numbers and influence. Frame driver debugging as reliability ownership: the failure rate you measured, the root cause you proved, and the fleet-level result. The 6-week plan is in the sim.",
  analogy: "A library that lends books with a due date and a slip number. Return it late and your slip is void, because it was already lent to someone else. Books that keep coming back damaged go to a repair shelf instead of back into circulation.",
  language: "Go 1.22+ · in-memory queue with leases, fencing tokens, retry limits and a dead-letter queue",
  primer: {
    text: "This lesson explains what the Anthropic role involves and how its interviews are reported to work. It then practises a typical hands-on problem: a job queue where workers borrow jobs for a limited time. Jobs that keep failing go to a separate list for people to check.",
    terms: [
      ["Lease", "Temporary ownership of a job that expires unless renewed or completed."],
      ["Ack (acknowledge)", "A worker's message that a job is finished."],
      ["Fencing token", "A number issued with each lease so stale owners can be rejected."],
      ["Dead-letter queue", "A holding place for jobs that failed too many times."],
      ["Idempotent", "Safe to run more than once with the same result."],
      ["Team placement", "Choosing your team after you pass the interviews (POSTED for this role)."],
    ],
  },
  lines: LNgo(`
package jobq

import (
    "errors"
    "sync"
    "time"
)

type Job struct {
    ID       string
    Attempts int
}

type lease struct {
    job   *Job
    token uint64
    until time.Time
}

type Queue struct {
    mu       sync.Mutex
    ready    []*Job
    leased   map[string]*lease
    Dead     []*Job
    max      int
    dur      time.Duration
    now      func() time.Time
    tokenSeq uint64
}

var ErrStale = errors.New("stale or unknown lease")

func New(max int, dur time.Duration, now func() time.Time) *Queue {
    return &Queue{leased: map[string]*lease{}, max: max, dur: dur, now: now} //@ Inject the clock so tests control time.
}

func (q *Queue) Enqueue(j *Job) {
    q.mu.Lock()
    defer q.mu.Unlock()
    q.ready = append(q.ready, j)
}

// Lease hands out the next job with a fresh token.
func (q *Queue) Lease() (*Job, uint64, bool) {
    q.mu.Lock()
    defer q.mu.Unlock()
    q.reapLocked()
    if len(q.ready) == 0 {
        return nil, 0, false
    }
    j := q.ready[0]
    q.ready = q.ready[1:]
    j.Attempts++
    q.tokenSeq++
    q.leased[j.ID] = &lease{job: j, token: q.tokenSeq, until: q.now().Add(q.dur)}
    return j, q.tokenSeq, true
}

// Ack completes a job, but only for the current lease holder.
func (q *Queue) Ack(id string, token uint64) error {
    q.mu.Lock()
    defer q.mu.Unlock()
    l, ok := q.leased[id]
    if !ok || l.token != token { //@ A late ack from an expired lease is rejected: someone else owns the job now.
        return ErrStale
    }
    delete(q.leased, id)
    return nil
}

// Nack returns a job early (worker gave up).
func (q *Queue) Nack(id string, token uint64) error {
    q.mu.Lock()
    defer q.mu.Unlock()
    l, ok := q.leased[id]
    if !ok || l.token != token {
        return ErrStale
    }
    delete(q.leased, id)
    q.retryLocked(l.job)
    return nil
}

func (q *Queue) retryLocked(j *Job) {
    if j.Attempts >= q.max {
        q.Dead = append(q.Dead, j) //@ Too many attempts: park it for humans instead of looping forever.
        return
    }
    q.ready = append(q.ready, j)
}

func (q *Queue) reapLocked() {
    t := q.now()
    for id, l := range q.leased {
        if !t.Before(l.until) { //@ Expired: the worker may have crashed. Requeue or dead-letter.
            delete(q.leased, id)
            q.retryLocked(l.job)
        }
    }
}
`),
  storyLesson: {
    scenarioTitle: "Preparing for the Anthropic loop",
    scenario: "You have six weeks before an Anthropic Infrastructure loop. The posting is broad, and placement happens after interviews, so you can't prepare for one team's stack.",
    sections: [
      { title: "1 · Read the signals", body: "The posting stresses reliability and scale; the application form says practical coding (POSTED). Third-party guides report design themes like queues, failure handling and moving large model files (PUBLIC, reported)." },
      { title: "2 · Practise practical coding", body: "Build this queue, then extend it in stages: add lease renewal, concurrency tests with -race, persistence, and metrics. That mirrors the reported staged format." },
      { title: "3 · Design depth", body: "Work through chapter 31 and the trainsched drill. Be ready to quantify: job MTBF, checkpoint interval, restart time, goodput." },
      { title: "4 · Stories", body: "Prepare three stories from the STAR bank (36.6) with real numbers from your Poly work. Fill placeholders only with facts you can defend in a deep dive." },
    ],
    checkpoint: { prompt: "Why does each lease carry a token?", answer: "A worker whose lease expired might still finish and ack. The token proves which lease is current, so the late ack is rejected and the job isn't marked done twice or by the wrong owner." },
    lab: { title: "Staged extension", brief: "Extend the queue as a practical interview would.", steps: ["Write tests with a fake clock for expiry and stale acks", "Add Renew(id, token) to extend a lease", "Run 20 goroutines leasing and acking under go test -race", "Add a visibility metric: oldest ready job age", "Explain how you'd persist the queue"], doneWhen: "All tests pass under -race and you can explain each design choice in two sentences." },
  },
  exercise: "Implement and explain a job queue where workers may crash or stall. How do you prevent jobs from being lost, done twice, or retried forever?",
  answerHint: "Leases with expiry, tokens, retry limit, dead letters, idempotency.",
  expected: ["lease", "token", "expire", "dead-letter", "idempotent", "retry"],
  modelAnswer: "Workers take a lease with an expiry time; if they don't ack before it expires, the job goes back to the queue, so crashes don't lose work. Each lease has a fencing token, so a late ack from an expired lease is rejected. Each retry is counted and capped: after the maximum attempts, the job moves to a dead-letter queue for inspection. Because a job can still run twice, for example a slow worker that finishes after expiry, job handlers should be idempotent. Inject the clock for testing and run concurrency tests with the race detector.",
  pitfalls: [
    "Trusting any ack, so a stale worker completes someone else's job.",
    "Unlimited retries that loop on a poison job.",
    "Using wall-clock time in tests instead of an injected clock.",
    "Assuming leases give exactly-once execution; they give at-least-once.",
  ],
  probes: [
    ["L1 · What happens if a worker crashes holding a lease?", "The lease expires and the job is requeued."],
    ["L2 · Why can a job still run twice?", "A slow worker may finish after expiry while another runs it; handlers must be idempotent."],
    ["L3 · How would you persist this queue?", "A write-ahead log or a database table with lease columns updated in transactions; or an existing system like SQS semantics."],
    ["L4 · Make it serve 100k jobs/s across regions.", "Shard by job key, keep leases local to a shard, batch leases, and replicate shards with a consensus log; measure lease contention."],
  ],
  poly: "Driver watchdogs and command queues to Poly hardware had timeouts and retries too. Use that story to show you already think in leases, retries and poison inputs.",
  why: "The Anthropic posting is a Staff+ distributed-systems role with practical coding (POSTED); queues with failure handling are a reported design theme (PUBLIC, reported).",
  myth: { myth: "Staff interviews are only about system design.", reality: "Anthropic states its coding interviews are practical (POSTED), and guides report coding rounds at all levels." },
  interviewTip: "Talk through failure cases before you're asked: crash, stall, late ack, poison job. That is the staged format in miniature.",
},
{
  ...common,
  title: "Roblox GPU Compute playbook: principal scope, and fleet telemetry triage in Go",
  sim: "playbook_gpu",
  snippet: "lesson_36_2.go",
  jobs: jobs(["gpu", "POSTED: Principal SWE, GPU Compute: GPU platform, telemetry (XID/ECC/NVLink), BMC/Redfish, Go."]),
  concept: "**What the role really is.** The posting describes a principal engineer for Roblox's GPU platform: scheduling and resource management, reliability at fleet scale, drivers and firmware, hardware telemetry such as XID, ECC and NVLink, out-of-band management through BMC/Redfish, and Go (POSTED). Roblox has written publicly about running inference on a hybrid cloud with KServe and Triton, Ray, vLLM and an ML gateway on over a thousand GPUs (PUBLIC, 2024 blog). **Principal** scope means setting direction: you decide what the GPU platform should become over a year or two, and convince others. **The loop.** Roblox's own 2022 article says senior candidates may get system design or a take-home, then team interviews and a values discussion (PUBLIC, official). Third-party reports describe about four 45-minute rounds at senior levels: one coding, two system design, one behavioral (PUBLIC, reported). **Practice problem.** Fleet triage from a CSV is realistic for this role: parse samples, apply rules, and output actions sorted for an operator. Use the standard **encoding/csv** package, validate every field, and keep rules in one place so they can be tested. **Mapping your Poly experience.** Hardware error handling and firmware rollouts are your strongest match: present them as fleet-level reliability and change-management work.",
  analogy: "A night-shift nurse reading every patient's monitor printout, flagging who needs a doctor now, who needs watching, and who's fine, in a list sorted so the most urgent are seen first.",
  language: "Go 1.22+ · parse GPU telemetry CSV with encoding/csv, apply triage rules and emit sorted actions",
  primer: {
    text: "This lesson explains the Roblox GPU platform role and its reported interviews. Then it practises a realistic task: reading a file of graphics card health readings. The code flags cards that need attention, most urgent first.",
    terms: [
      ["Principal engineer", "A senior individual contributor who sets technical direction across teams."],
      ["Telemetry", "Measurements a system reports about itself, such as errors and temperatures."],
      ["CSV", "Comma-separated values: a simple text table format."],
      ["Triage", "Sorting problems by urgency."],
      ["encoding/csv", "Go's standard library package for reading and writing CSV."],
      ["Validation", "Checking input fields are present and well-formed before using them."],
    ],
  },
  lines: LNgo(`
package triage

import (
    "encoding/csv"
    "fmt"
    "io"
    "sort"
    "strconv"
)

// Input columns: node,gpu,xid,dbe,nvlink_crc_per_min,temp_c
type Flag struct {
    Node   string
    GPU    int
    Action int // 1 watch, 2 drain, 3 repair
    Why    string
}

func rule(xid, dbe int, crc float64, temp int) (int, string) {
    switch {
    case xid == 79:
        return 3, "fell off bus"
    case dbe > 0 || xid == 48:
        return 2, "uncorrectable ECC"
    case crc > 100:
        return 2, "NVLink errors high"
    case temp >= 90:
        return 2, "overheating"
    case crc > 5 || xid != 0:
        return 1, "watch"
    }
    return 0, ""
}

func Triage(r io.Reader) ([]Flag, error) {
    cr := csv.NewReader(r)
    cr.FieldsPerRecord = 6 //@ Reject short or long rows instead of guessing.
    rows, err := cr.ReadAll()
    if err != nil {
        return nil, err
    }
    var out []Flag
    for i, row := range rows {
        if i == 0 && row[0] == "node" {
            continue //@ Skip the header row.
        }
        gpu, e1 := strconv.Atoi(row[1])
        xid, e2 := strconv.Atoi(row[2])
        dbe, e3 := strconv.Atoi(row[3])
        crc, e4 := strconv.ParseFloat(row[4], 64)
        temp, e5 := strconv.Atoi(row[5])
        for _, e := range []error{e1, e2, e3, e4, e5} {
            if e != nil {
                return nil, fmt.Errorf("line %d: %w", i+1, e) //@ Say which line was bad: operators need to find it.
            }
        }
        if a, why := rule(xid, dbe, crc, temp); a > 0 {
            out = append(out, Flag{row[0], gpu, a, why})
        }
    }
    sort.Slice(out, func(i, j int) bool {
        if out[i].Action != out[j].Action {
            return out[i].Action > out[j].Action //@ Most urgent first.
        }
        if out[i].Node != out[j].Node {
            return out[i].Node < out[j].Node
        }
        return out[i].GPU < out[j].GPU
    })
    return out, nil
}
`),
  storyLesson: {
    scenarioTitle: "Preparing for the Roblox GPU Compute loop",
    scenario: "You have six weeks to prepare for a principal GPU platform role. Your GPU fleet experience is lighter than your driver and embedded experience.",
    sections: [
      { title: "1 · Close the vocabulary gap", body: "Chapter 32 gives you XID, ECC, row remapping, NVLink, MIG and rollout language. Learn to explain each in one sentence and give a decision it drives." },
      { title: "2 · Practise the coding round", body: "Build this triage tool, then add hysteresis across samples, per-node aggregation and tests for malformed input." },
      { title: "3 · Design rounds", body: "Reported loops include two design rounds. Practise the gpuplatform drill and a GPU inference serving design (chapter 26)." },
      { title: "4 · Principal stories", body: "Prepare a direction-setting story: a multi-quarter plan you proposed and drove. Use the STAR bank with your real Poly numbers." },
    ],
    checkpoint: { prompt: "What separates a principal answer from a senior one in a GPU platform design round?", answer: "A principal answer sets direction: it quantifies waste and risk across the fleet, chooses what not to do, sequences work over quarters and explains how to bring other teams along." },
    lab: { title: "Extend the triage tool", brief: "Turn the parser into a small service.", steps: ["Add tests for malformed rows and unknown XIDs", "Aggregate per node: drain if 2+ GPUs need drain", "Add hysteresis using the previous run's state", "Write a summary line per action class", "Benchmark 1 million rows"], doneWhen: "Tests pass, bad input is reported with line numbers, and 1M rows run in seconds." },
  },
  exercise: "Given a CSV of GPU telemetry from a 10,000-GPU fleet, write and explain a triage tool. What makes it production-worthy?",
  answerHint: "Parsing and validation, rules in one place, sorting by urgency, tests, scale.",
  expected: ["csv", "validate", "rule", "sort", "test", "xid"],
  modelAnswer: "Parse with encoding/csv, fixing the field count and so you can validate every field and bad input fails with a line number. Keep the triage rule in one function: XID 79 means repair, double-bit ECC or XID 48 means drain, high NVLink errors or temperature mean drain, smaller signals mean watch. Sort output by urgency then node so operators see the worst first. Production-worthy means tests for each rule and for malformed input, aggregation per node, hysteresis across runs, and streaming for large files.",
  pitfalls: [
    "Splitting lines by hand instead of using a CSV parser.",
    "Silently skipping bad rows.",
    "Rules scattered through the code so nobody can review them.",
    "Unsorted output that hides the urgent cases.",
  ],
  probes: [
    ["L1 · Why fix FieldsPerRecord?", "So rows with missing or extra columns fail loudly instead of shifting values."],
    ["L2 · How would you handle 100 GB of telemetry?", "Stream rows instead of ReadAll, aggregate incrementally, and parallelize by node shard."],
    ["L3 · How do you change thresholds safely?", "Version the rules, replay historical data to compare outcomes, and roll out like any other change."],
    ["L4 · How would this become the fleet's health service?", "Agents stream metrics; a central service applies versioned rules, keeps per-node state with hysteresis, drives drains via the scheduler and exposes an audit log."],
  ],
  poly: "Parsing hardware logs and error registers to decide on resets is your daily Poly work. Present this tool as that experience at fleet scale.",
  why: "The GPU Compute posting names telemetry, XID/ECC/NVLink and Go (POSTED). Reported Roblox loops include a coding round (PUBLIC, reported).",
  myth: { myth: "Principal candidates don't get coding questions.", reality: "Reported Roblox senior loops still include coding (PUBLIC, reported)." },
  interviewTip: "Ask what the operator does with the output. Designing for the person who reads it is a principal habit.",
},
{
  ...common,
  title: "Roblox Engineering Acceleration playbook: is it build/CI work? And computing p50/p75 time to land in Go",
  sim: "playbook_ea",
  snippet: "lesson_36_3.go",
  jobs: jobs(["ea", "POSTED: Principal SWE, Engineering Acceleration: source search and storage, review, CI, productivity metrics, AI for engineering."]),
  concept: "**What the role really is.** Yes, it is build, CI and developer-productivity work, and somewhat broader. The posting covers source code search and storage, code review, CI, developer productivity metrics and AI for engineering, and mentions HashiStack (POSTED). Roblox's 2025 tools blog describes a code center for search and navigation and tracks **P75 time to land** (PUBLIC). No public source found says Roblox uses Bazel, so talk about 'a build cache like Bazel's' instead of assuming it. **The loop.** Same public information as the GPU role: Roblox's 2022 article (PUBLIC, official) and reported four-round senior loops (PUBLIC, reported). Expect at least one design round on CI or developer platforms (INFERRED). **Practice problem.** Metrics are central to this role. Compute **time to land** per pull request, from approval to merge, then **percentiles** per team. Use the **nearest-rank** method: sort values, take the value at position ceil(p·n). Handle missing events: a PR with no merge isn't landed yet, so it doesn't count. **Mapping your Poly experience.** Build, test and release work you did for firmware is directly relevant; frame it as developer-velocity outcomes with numbers.",
  analogy: "Timing how long parcels take from 'ready to ship' to 'delivered', then reporting the time by which three quarters of parcels arrive, so you see the slow ones that annoy customers, not just the average.",
  language: "Go 1.22+ · pair approval and merge events, compute nearest-rank p50/p75 per team",
  primer: {
    text: "This lesson confirms what the Roblox role covers: builds, testing, code search and developer speed. Then it practises a metric the team publicly tracks: how long changes take to land, measured at the middle and at the slower end.",
    terms: [
      ["Time to land", "Time from a change's approval until it is merged."],
      ["Percentile (p75)", "The value below which 75% of measurements fall."],
      ["Nearest-rank method", "A simple percentile: sort the values and take the one at position ceil(p × n)."],
      ["Pull request (PR)", "A proposed code change submitted for review."],
      ["HashiStack", "HashiCorp's tools such as Nomad, Consul and Vault, mentioned in the posting."],
      ["Developer productivity metrics", "Measures of how quickly and smoothly engineers can ship changes."],
    ],
  },
  lines: LNgo(`
package ttl

import (
    "math"
    "sort"
    "time"
)

type Event struct {
    PR   int
    Team string
    Kind string // "approved" or "merged"
    At   time.Time
}

// percentile uses nearest rank on a sorted copy.
func percentile(xs []time.Duration, p float64) time.Duration {
    if len(xs) == 0 {
        return 0
    }
    s := append([]time.Duration(nil), xs...)
    sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })
    k := int(math.Ceil(p*float64(len(s)))) - 1 //@ Nearest rank: position ceil(p*n), counting from 1.
    if k < 0 {
        k = 0
    }
    return s[k]
}

type Report struct {
    N        int
    P50, P75 time.Duration
}

func TimeToLand(evs []Event) map[string]Report {
    type pair struct {
        team             string
        approved, merged time.Time
    }
    prs := map[int]*pair{}
    for _, e := range evs {
        p := prs[e.PR]
        if p == nil {
            p = &pair{team: e.Team}
            prs[e.PR] = p
        }
        switch e.Kind {
        case "approved":
            if p.approved.IsZero() || e.At.After(p.approved) {
                p.approved = e.At //@ Use the LAST approval: re-reviews restart the clock.
            }
        case "merged":
            p.merged = e.At
        }
    }
    by := map[string][]time.Duration{}
    for _, p := range prs {
        if p.approved.IsZero() || p.merged.IsZero() || p.merged.Before(p.approved) {
            continue //@ Not landed yet, or bad data: leave it out rather than guess.
        }
        by[p.team] = append(by[p.team], p.merged.Sub(p.approved))
    }
    out := map[string]Report{}
    for t, ds := range by {
        out[t] = Report{N: len(ds), P50: percentile(ds, 0.5), P75: percentile(ds, 0.75)}
    }
    return out
}
`),
  storyLesson: {
    scenarioTitle: "Preparing for the Engineering Acceleration loop",
    scenario: "You're asked to confirm the role is really build/CI work before investing six weeks. Then you need to prepare for a principal-level loop focused on developer platforms.",
    sections: [
      { title: "1 · Verify scope", body: "The posting confirms CI, code review, search, storage and productivity metrics (POSTED). It is developer-productivity work with a platform and AI-tooling angle." },
      { title: "2 · Coding", body: "Build this metric tool, then add regression detection week over week and tests for missing events." },
      { title: "3 · Design", body: "Practise the buildci drill: a monorepo CI design with caching, merge queues and flaky-test handling (chapter 33)." },
      { title: "4 · Stories", body: "Prepare adoption and influence stories: getting teams to change how they build and test. Use real Poly numbers only." },
    ],
    checkpoint: { prompt: "Why track p75 time to land rather than the average?", answer: "Averages hide the slow tail. p75 shows the experience of the slower quarter of changes, which is where developers feel the pain, and it isn't skewed by a few extreme outliers the way a mean is." },
    lab: { title: "Regression report", brief: "Turn the metric into a weekly report.", steps: ["Generate a month of events for 5 teams", "Compute weekly p50/p75 per team", "Flag teams whose p75 rose by more than 25%", "Handle PRs that were approved twice", "Write tests for merged-before-approved data"], doneWhen: "The report flags the right teams and every edge case has a test." },
  },
  exercise: "Leadership asks: 'Is our CI getting slower?' Using PR event data, how do you answer reliably?",
  answerHint: "Define the metric, handle edge cases, percentiles, per-team breakdown, trends.",
  expected: ["time to land", "p75", "percentile", "approval", "merge", "per team"],
  modelAnswer: "Define time to land as time from the last approval to merge. Pair events per PR, skip PRs not yet merged or with bad ordering, and compute p50 and p75 percentiles per team per week using nearest rank. Report trends and flag teams whose p75 rose significantly. Break down where the time goes, such as queueing, CI duration and reruns, so the answer points to causes, not just a number.",
  pitfalls: [
    "Reporting only the mean.",
    "Using first approval, so re-reviews look like slow CI.",
    "Including unmerged PRs with a guessed end time.",
    "One company-wide number that hides team differences.",
  ],
  probes: [
    ["L1 · How is p75 computed?", "Sort the values and take the one at position ceil(0.75 × n)."],
    ["L2 · Why last approval?", "Changes after review restart the process; first approval would overstate CI time."],
    ["L3 · How do you split time to land into causes?", "Record queue entry, CI start and end, and reruns; report each segment's percentiles."],
    ["L4 · How would you use this to choose next quarter's investments?", "Rank segments by total developer-hours lost, estimate the fix's impact and cost, and pick the top ones with a measurable target."],
  ],
  poly: "If you sped up firmware build or test cycles at Poly, quantify it as time to land or cycle time. That's directly comparable to this team's public metric.",
  why: "Roblox publicly tracks P75 time to land (PUBLIC), and the posting names productivity metrics (POSTED).",
  myth: { myth: "Engineering Acceleration is just keeping Jenkins running.", reality: "The posting covers search, storage, review, CI, metrics and AI tooling: a developer platform (POSTED)." },
  interviewTip: "Define your metric precisely before computing it. Interviewers watch for that discipline.",
},
{
  ...common,
  title: "Qualcomm playbook: senior staff platform ownership, and embedded C bitfields with a CRC-checked header",
  sim: "playbook_qc",
  snippet: "lesson_36_4.c",
  jobs: jobs(["qc", "POSTED: Senior Staff Engineer, automotive telematics embedded Linux platform (exact match to the screenshot INFERRED)."]),
  concept: "**What the role really is.** The best-matching posting is a senior staff role owning the embedded Linux platform for automotive telematics: boot and recovery, NAND/eMMC, OTA, MAC, verified boot, disk integrity, encryption, TARA, boot-time and footprint targets, and AP–modem fusion over PCIe, USB or Ethernet, built with Yocto (POSTED). The screenshot title matches more than one San Diego role, so confirm the requisition with the recruiter (INFERRED). **The loop.** Qualcomm doesn't publish a loop for this role. Candidate reports describe recruiter and hiring-manager screens, then 3–5 technical rounds on C and C++, pointers, bit manipulation, OS internals, Linux drivers, concurrency and embedded design, with project deep dives for senior candidates (PUBLIC, reported). **Practice problem.** Classic embedded C: read and write **register bitfields** with masks and shifts, and serialize a message **header** with explicit byte order and a **CRC-32**. Don't rely on C bitfield structs or packed structs for wire formats: their layout is implementation-defined. Write bytes explicitly. Use **unsigned** types for shifts to avoid undefined behavior. **Mapping your Poly experience.** This is your strongest match: Linux drivers, boot and hardware bring-up. Frame them as platform ownership: decisions that affected every product built on your platform.",
  analogy: "Filling in a paper form with fixed boxes: each piece of information has an exact position and width, and a check digit at the bottom catches any copying mistake.",
  language: "C11 · mask/shift register helpers, explicit big-endian header serialization and bitwise CRC-32",
  primer: {
    text: "This lesson explains the Qualcomm platform role and how its interviews are reported to work. It then practises classic chip-level C: setting bits inside a hardware register, and packing a message header with an error check.",
    terms: [
      ["Bitfield", "A group of bits inside a larger value that holds one setting."],
      ["Mask", "A value with 1s where the field's bits are, used to isolate or clear them."],
      ["Endianness", "The byte order of multi-byte values: big-endian puts the most significant byte first."],
      ["CRC-32", "A 32-bit checksum that detects accidental changes in data."],
      ["Implementation-defined", "Behavior the C standard leaves to each compiler, such as bitfield struct layout."],
      ["Yocto", "A toolkit for building custom embedded Linux distributions."],
    ],
  },
  lines: LN(`
#include <stddef.h>
#include <stdint.h>

/* Register field helpers: mask = width bits starting at shift. */
static inline uint32_t field_mask(unsigned shift, unsigned width) {
  return (width >= 32 ? 0xFFFFFFFFu : ((1u << width) - 1u)) << shift;   //@ Unsigned 1u: shifting a signed 1 into bit 31 is undefined.
}
static inline uint32_t field_get(uint32_t reg, unsigned shift, unsigned width) {
  return (reg & field_mask(shift, width)) >> shift;
}
static inline uint32_t field_set(uint32_t reg, unsigned shift, unsigned width, uint32_t v) {
  uint32_t m = field_mask(shift, width);
  return (reg & ~m) | ((v << shift) & m);                               //@ Clear the field, then insert; extra high bits of v are dropped.
}

/* CRC-32 (IEEE, reflected polynomial 0xEDB88320). */
uint32_t crc32(const uint8_t *p, size_t n) {
  uint32_t c = 0xFFFFFFFFu;
  while (n--) {
    c ^= *p++;
    for (int k = 0; k < 8; k++) c = (c >> 1) ^ (0xEDB88320u & (0u - (c & 1u)));   //@ Branch-free: subtract gives all-ones when the low bit is set.
  }
  return ~c;
}

struct hdr { uint8_t version; uint8_t type; uint16_t len; uint32_t seq; };

static void put16(uint8_t *b, uint16_t v) { b[0] = (uint8_t)(v >> 8); b[1] = (uint8_t)v; }
static void put32(uint8_t *b, uint32_t v) { for (int i = 0; i < 4; i++) b[i] = (uint8_t)(v >> (24 - 8 * i)); }
static uint32_t get32(const uint8_t *b) { return ((uint32_t)b[0] << 24) | ((uint32_t)b[1] << 16) | ((uint32_t)b[2] << 8) | b[3]; }

/* Wire format: version, type, len (BE16), seq (BE32), crc (BE32 over first 8 bytes). 12 bytes total. */
void hdr_pack(const struct hdr *h, uint8_t out[12]) {
  out[0] = h->version; out[1] = h->type;
  put16(out + 2, h->len); put32(out + 4, h->seq);                        //@ Write bytes explicitly: no packed structs, no host byte order.
  put32(out + 8, crc32(out, 8));
}

int hdr_unpack(const uint8_t in[12], struct hdr *h) {
  if (get32(in + 8) != crc32(in, 8)) return -1;                          //@ Reject corrupted headers before trusting any field.
  h->version = in[0]; h->type = in[1];
  h->len = (uint16_t)((in[2] << 8) | in[3]);
  h->seq = get32(in + 4);
  return 0;
}
`),
  storyLesson: {
    scenarioTitle: "Preparing for the Qualcomm panel",
    scenario: "You have deep Linux driver experience and six weeks to prepare for a senior staff platform role. The gap is platform-wide ownership: boot, update, security and the modem link together.",
    sections: [
      { title: "1 · Confirm the role", body: "Ask the recruiter which requisition you're interviewing for; the posting content differs between San Diego senior staff roles (INFERRED)." },
      { title: "2 · Sharpen C", body: "Write this code from memory, then test it: known CRC vector ('123456789' gives 0xCBF43926), field round-trips, and corrupted headers." },
      { title: "3 · Platform design", body: "Work through chapter 34 and the telematicsboot drill. Practise drawing the full boot chain with timings." },
      { title: "4 · Senior staff stories", body: "Turn driver work into platform stories: decisions that affected multiple products or teams. Use the STAR bank with real numbers." },
    ],
    checkpoint: { prompt: "Why not use a packed struct with bitfields to define the wire header?", answer: "Bitfield order, padding and byte order are implementation-defined, so the layout can change between compilers and processors. Explicit byte writes give one portable format." },
    lab: { title: "Embedded C drill", brief: "Test the helpers thoroughly.", steps: ["Check crc32('123456789') == 0xCBF43926", "Round-trip every field width 1..32", "Flip each bit of a packed header and confirm unpack fails", "Run under -fsanitize=undefined", "Add a version check that rejects unknown versions"], doneWhen: "All tests pass with sanitizers and every single-bit corruption is caught." },
  },
  exercise: "In a whiteboard round, implement register field helpers and a portable message header with a checksum. Explain the pitfalls.",
  answerHint: "Masks and shifts with unsigned types, explicit byte order, CRC, no packed structs.",
  expected: ["mask", "shift", "unsigned", "endian", "crc", "packed"],
  modelAnswer: "Build a mask of width bits at shift using unsigned arithmetic, so shifting into bit 31 isn't undefined; get is mask then shift right; set clears the field then ORs the shifted value under the mask. For the header, serialize each field explicitly in big-endian byte order rather than using a packed struct or bitfields, whose layout is implementation-defined. Add a CRC-32 over the header bytes, check it before trusting any field, and test with the known vector 0xCBF43926.",
  pitfalls: [
    "Shifting a signed 1 into the sign bit.",
    "Packed structs and bitfield structs for wire formats.",
    "Forgetting byte order when the peer is a different processor.",
    "Reading header fields before checking the CRC.",
  ],
  probes: [
    ["L1 · How do you set bits 4–7 of a register to 0xA?", "Clear with ~(0xF << 4), then OR (0xA << 4)."],
    ["L2 · Why is 1 << 31 a problem?", "1 is a signed int; shifting into the sign bit is undefined. Use 1u."],
    ["L3 · How do you make register writes safe on real hardware?", "Use volatile accessors or the kernel's readl/writel, respect read-modify-write races with locks, and mind write-1-to-clear bits."],
    ["L4 · Design the message format between AP and modem for 10 years of compatibility.", "Version field, length-prefixed TLVs so old readers skip unknown fields, CRC or link-level integrity, and a negotiated capability set."],
  ],
  poly: "Register-level driver code is your daily Poly work. Pair this with a story where a platform decision you made affected several products.",
  why: "The Qualcomm role is embedded Linux platform work (POSTED), and reported interviews focus heavily on C and bit manipulation (PUBLIC, reported).",
  myth: { myth: "Senior staff interviews skip low-level C.", reality: "Reported Qualcomm loops still test C fundamentals at senior levels (PUBLIC, reported)." },
  interviewTip: "State the undefined-behavior pitfalls out loud as you write. It shows senior judgment in a junior-looking question.",
},
{
  ...common,
  title: "Microsoft Robotics playbook: principal MTS scope, and a C++ topic bus with QoS",
  sim: "playbook_ms",
  snippet: "lesson_36_5.cpp",
  jobs: jobs(["ms", "POSTED: Member of Technical Staff (principal level), Microsoft Robotics: VLA, ROS 2/Nav2, safe autonomy, evaluation gates, ML serving."]),
  concept: "**What the role really is.** A principal-level technical staff role in Microsoft Robotics. It covers bringing vision-language-action models to real robots, ROS 2 and Nav2, sim-to-real, safe-autonomy boundaries with human-in-the-loop fallback, evaluation and validation gates, and ML serving (POSTED). Microsoft Research announced the Rho-alpha VLA model in January 2026 (PUBLIC). **The loop.** Third-party reports describe principal loops of 4–6 rounds: coding, one to three design rounds, a project deep dive and leadership, sometimes with a final senior interviewer (PUBLIC, reported). The posting lists Microsoft's values: respect, integrity, accountability and growth mindset (POSTED). **Practice problem.** ROS 2 passes messages over **topics** with **QoS** (quality of service) settings. **Reliable** delivery retries until received; **best effort** may drop. **History depth** (keep last N) bounds memory: when a slow subscriber's queue is full, the oldest message is dropped. Building a tiny in-process bus with these semantics, thread-safe, is a realistic C++ exercise and shows you understand the middleware. **Mapping your Poly experience.** Real-time audio pipelines, embedded C++ and hardware limits map well to robotics. Frame them around latency budgets and safety guards.",
  analogy: "A newsroom wire service. Some subscribers want every story delivered even if it takes retries; others just want the latest headlines and don't mind missing some. Each subscriber's inbox only holds the last few stories, so a slow reader isn't buried.",
  language: "C++17 · thread-safe in-process publish/subscribe with reliable vs best-effort QoS and keep-last history",
  primer: {
    text: "This lesson explains the Microsoft robotics role and its reported interviews. Then it builds a small message bus like the one robot software uses. Each listener chooses whether it must get every message, or only the newest few.",
    terms: [
      ["Topic", "A named channel that publishers send messages to and subscribers listen on."],
      ["QoS (quality of service)", "Settings that control delivery guarantees and buffering."],
      ["Reliable delivery", "Messages are not dropped; the publisher waits or retries."],
      ["Best effort", "Messages may be dropped under load."],
      ["Keep-last history", "Store only the newest N messages per subscriber."],
      ["ROS 2", "Robot Operating System 2, a widely used robotics middleware."],
    ],
  },
  lines: LN(`
#include <deque>
#include <functional>
#include <map>
#include <mutex>
#include <string>
#include <vector>

struct QoS { bool reliable = false; size_t depth = 10; };

template <class T>
class Bus {
  struct Sub { QoS q; std::deque<T> box; std::function<void(const T &)> cb; size_t dropped = 0; };
  std::mutex mu_;
  std::map<std::string, std::vector<Sub>> subs_;
 public:
  void subscribe(const std::string &topic, QoS q, std::function<void(const T &)> cb) {
    std::lock_guard<std::mutex> g(mu_);
    subs_[topic].push_back(Sub{q, {}, std::move(cb)});
  }

  // Returns false if a reliable subscriber's queue is full (caller must retry).
  bool publish(const std::string &topic, const T &msg) {
    std::lock_guard<std::mutex> g(mu_);
    auto it = subs_.find(topic);
    if (it == subs_.end()) return true;
    for (Sub &s : it->second)
      if (s.q.reliable && s.box.size() >= s.q.depth) return false;   //@ Backpressure: never drop for reliable subscribers. Check all first, so delivery is all-or-nothing.
    for (Sub &s : it->second) {
      if (s.box.size() >= s.q.depth) { s.box.pop_front(); ++s.dropped; }   //@ Best effort keep-last: drop the oldest.
      s.box.push_back(msg);
    }
    return true;
  }

  // Deliver queued messages. Callbacks run outside the lock.
  void spin() {
    std::vector<std::pair<std::function<void(const T &)>, T>> work;
    {
      std::lock_guard<std::mutex> g(mu_);
      for (auto &kv : subs_)
        for (Sub &s : kv.second)
          while (!s.box.empty()) { work.emplace_back(s.cb, s.box.front()); s.box.pop_front(); }
    }
    for (auto &w : work) w.first(w.second);                          //@ Never call user code while holding the lock: it could publish and deadlock.
  }

  size_t dropped(const std::string &topic, size_t i) {
    std::lock_guard<std::mutex> g(mu_);
    return subs_[topic].at(i).dropped;
  }
};
`),
  storyLesson: {
    scenarioTitle: "Preparing for the Microsoft Robotics loop",
    scenario: "Your background is embedded and real-time C++, not robot learning. You have six weeks to show principal-level judgment across serving, safety and evaluation.",
    sections: [
      { title: "1 · Learn the stack", body: "Chapter 35 covers chunked execution, Simplex safety and evaluation gates. Add ROS 2 basics: topics, QoS, executors and Nav2." },
      { title: "2 · Coding", body: "Build this bus and then extend it: per-topic stats, a reliable publish with timeout, and a stress test with several threads under TSan." },
      { title: "3 · Design", body: "Practise the robotplatform drill end to end, out loud, in 45 minutes." },
      { title: "4 · Leadership", body: "Prepare stories about bringing research into products and about safety tradeoffs. Fill the STAR templates with real Poly facts." },
    ],
    checkpoint: { prompt: "Why must callbacks run outside the lock?", answer: "A callback might publish to the bus, which takes the same lock, causing a deadlock. Holding a lock while running unknown code also makes latency unpredictable." },
    lab: { title: "Bus stress test", brief: "Exercise QoS under load.", steps: ["One fast publisher, one slow best-effort subscriber: count drops", "Add a reliable subscriber and observe backpressure", "Publish from a callback and confirm no deadlock", "Run 4 publisher threads under TSan", "Measure delivery latency per message"], doneWhen: "TSan is clean, drops match the QoS rules and no deadlock occurs." },
  },
  exercise: "Implement a small publish/subscribe bus with reliable and best-effort QoS for a robot. Explain the threading and memory choices.",
  answerHint: "QoS semantics, keep-last depth, backpressure, lock scope, callbacks outside the lock.",
  expected: ["qos", "reliable", "best effort", "depth", "backpressure", "lock"],
  modelAnswer: "Each subscriber has a QoS: reliable or best effort, plus a keep-last depth that bounds memory. Publishing checks reliable subscribers first; if any queue is full, it returns false so the caller applies backpressure instead of dropping. Best-effort subscribers drop the oldest message when full. A mutex protects queues, but spin copies work out under the lock and runs callbacks outside it, so a callback can publish without deadlock. Count drops per subscriber and test under ThreadSanitizer.",
  pitfalls: [
    "Unbounded queues that grow until memory runs out.",
    "Calling callbacks while holding the lock.",
    "Silently dropping messages for reliable subscribers.",
    "Partial delivery when one reliable subscriber is full.",
  ],
  probes: [
    ["L1 · What does keep-last depth do?", "Bounds each subscriber's queue; the oldest messages are dropped when full."],
    ["L2 · When would a robot topic use best effort?", "High-rate sensor streams where only the newest value matters, such as camera frames."],
    ["L3 · What does a mismatched QoS do in ROS 2?", "Incompatible publisher and subscriber settings, such as reliable subscriber with best-effort publisher, prevent the connection; tools report the incompatibility."],
    ["L4 · How would you make this zero-copy for large images?", "Share immutable buffers by reference counting or a shared-memory pool, pass handles instead of copies, and recycle buffers when all subscribers are done."],
  ],
  poly: "Audio pipelines at Poly had the same choice: never drop control messages, but drop stale audio frames rather than add latency. Use that as your QoS story.",
  why: "The Microsoft Robotics posting names ROS 2 (POSTED), and reported principal loops include coding (PUBLIC, reported).",
  myth: { myth: "Robotics roles only want ML researchers.", reality: "The posting asks for real-time systems, serving and safety engineering alongside VLA work (POSTED)." },
  interviewTip: "Connect every design choice to a robot behavior, for example 'best effort for camera frames because stale images are useless'.",
},
{
  ...common,
  title: "Staff-level stories and depth ladders: the STAR bank, and putting an honest number on your impact",
  sim: "starbank",
  snippet: "lesson_36_6.cpp",
  jobs: jobs(["ant", "PUBLIC (reported): project deep dive and behavioral rounds."], ["gpu", "PUBLIC (reported): behavioral round; principal scope."], ["ea", "PUBLIC (reported): behavioral round."], ["qc", "PUBLIC (reported): project deep dives for senior candidates."], ["ms", "PUBLIC (reported): leadership round; POSTED values."]),
  concept: "Every one of these loops is reported to include a behavioral, leadership or project deep-dive round. At staff and principal level, interviewers look for **scope** (beyond your own team), **ambiguity** (you defined the problem), **influence** (others changed what they did), and **measured results**. The **STAR** format (Situation, Task, Action, Result) keeps stories tight: two sentences of situation, one of task, most of the time on your actions, and a result with a number. The bank in the sim has 10 prompts with templates. The brackets are placeholders: fill them only with things you actually did and can defend under questioning. Deep dives then go down a **depth ladder**: what you did, why, what else you considered, what went wrong, and what you'd do now. Prepare each story to the fourth level. **Honest numbers.** 'Failures fell 40%' invites the question 'how sure are you?'. A **bootstrap confidence interval** answers it: resample your before and after data many times, recompute the difference each time, and report the middle 95% of results. If the interval includes zero, say the improvement isn't established. That honesty is itself a staff-level signal.",
  analogy: "A courtroom witness. Tell the story in order, say exactly what you did, and back the key claim with evidence that holds up under cross-examination.",
  language: "C++17 · bootstrap 95% confidence interval for the change in a mean, with a fixed seed",
  primer: {
    text: "Senior interviews ask for stories about your past work. This lesson gives ten common questions with fill-in templates, using only your real experience. It also shows how to check that an improvement you claim is real and not luck.",
    terms: [
      ["STAR", "Situation, Task, Action, Result: a structure for telling work stories."],
      ["Scope", "How far your work reached: your team, several teams, or the whole company."],
      ["Depth ladder", "Follow-up questions that go one level deeper each time."],
      ["Bootstrap", "Estimating uncertainty by resampling your own data many times."],
      ["Confidence interval", "A range likely to contain the true value."],
      ["Placeholder", "A bracketed slot to fill with your real facts; never invent them."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <random>
#include <vector>

static double mean(const std::vector<double> &v) {
  double s = 0;
  for (double x : v) s += x;
  return v.empty() ? 0 : s / v.size();
}

struct CI { double lo, est, hi; };

// 95% bootstrap interval for mean(after) - mean(before).
CI bootstrap_diff(const std::vector<double> &before, const std::vector<double> &after,
                  int iters = 10000, unsigned seed = 42) {
  if (before.empty() || after.empty()) return {0, 0, 0};
  std::mt19937 rng(seed);                                   //@ Fixed seed: the same data always gives the same interval.
  std::uniform_int_distribution<size_t> pb(0, before.size() - 1), pa(0, after.size() - 1);
  std::vector<double> diffs;
  diffs.reserve(iters);
  std::vector<double> b(before.size()), a(after.size());
  for (int i = 0; i < iters; ++i) {
    for (double &x : b) x = before[pb(rng)];                //@ Resample with replacement, same size as the original.
    for (double &x : a) x = after[pa(rng)];
    diffs.push_back(mean(a) - mean(b));
  }
  std::sort(diffs.begin(), diffs.end());
  auto at = [&](double q) { return diffs[static_cast<size_t>(q * (diffs.size() - 1))]; };
  return {at(0.025), mean(after) - mean(before), at(0.975)};   //@ Middle 95% of the resampled differences.
}

// "Established" only if the whole interval is on the improving side.
bool improved(const CI &ci, bool lower_is_better) {
  return lower_is_better ? ci.hi < 0 : ci.lo > 0;
}
`),
  storyLesson: {
    scenarioTitle: "Turning driver work into a staff-level story",
    scenario: "You fixed a long-standing driver bug at Poly that caused device resets. In interviews it comes out as 'I fixed a bug', which sounds like mid-level work.",
    sections: [
      { title: "1 · Situation and scope", body: "Who was affected? Fill in: '[N devices / customers] saw [symptom] about [rate]; [teams] had tried [what] for [how long].' Use only real numbers." },
      { title: "2 · Your actions", body: "Name the hard decisions: how you narrowed it down, what you built to prove the cause, who you convinced and how. Use 'I' for your part." },
      { title: "3 · Result with evidence", body: "Before-and-after reset rates from logs. Compute a bootstrap interval with this lesson's code, so you can say 'down [X]%, with 95% interval [lo–hi]'." },
      { title: "4 · Ladder it", body: "Practise answers four levels deep: why that approach, what alternatives, what broke along the way, what you'd change now." },
    ],
    checkpoint: { prompt: "Why compute a confidence interval for your own impact number?", answer: "Interviewers probe numbers. An interval shows whether the improvement could be noise, and admitting uncertainty honestly builds more credibility than an unqualified claim." },
    lab: { title: "Build your bank", brief: "Draft five stories from the bank with real facts.", steps: ["Pick five prompts that fit your experience", "Fill every placeholder with a real fact, or drop the story", "Time each at about 2 minutes", "Write four ladder questions per story and answer them", "Where you have data, compute a bootstrap interval for the result"], doneWhen: "Five stories pass all five checks in the sim, each with a defended number." },
  },
  exercise: "Tell me about the most technically complex problem you solved. Then: how do you know your fix worked?",
  answerHint: "STAR with scope, your actions, a number, and evidence that the number isn't noise.",
  expected: ["situation", "action", "result", "scope", "confidence interval", "bootstrap"],
  modelAnswer: "Use STAR: the situation in two sentences with who was affected and the scope across teams; the task you owned; the actions you personally took, including decisions and who you influenced; and the result with a number. To show the fix worked, compare before and after data and give a bootstrap confidence interval for the change: resample both periods many times and report the middle 95% of differences. If the interval excludes zero, the improvement is established; if not, say so and describe what more data you'd collect.",
  pitfalls: [
    "Inventing or inflating numbers you can't defend.",
    "Saying 'we' throughout so your role is unclear.",
    "Long situations and short actions.",
    "Stories with no scope beyond your own task.",
  ],
  probes: [
    ["L1 · What did you personally do?", "Name your specific actions and decisions."],
    ["L2 · Why that approach?", "Explain the alternatives you weighed and the evidence that decided it."],
    ["L3 · What went wrong along the way?", "A real setback and how you adapted."],
    ["L4 · What would you do differently now, at staff level?", "Reflect on scope: what you'd change in process, ownership or prevention across teams."],
  ],
  poly: "Your Poly driver and C++ experience is the raw material for every story here. The templates only work when every bracket is filled with something you really did.",
  why: "All five loops are reported to include behavioral, leadership or deep-dive rounds (PUBLIC, reported; see the research file).",
  myth: { myth: "Behavioral rounds are a formality for engineers.", reality: "At staff and principal level they often decide the level you're offered." },
  interviewTip: "Lead with the result in one sentence, then tell the story. Interviewers remember the number.",
},
];
