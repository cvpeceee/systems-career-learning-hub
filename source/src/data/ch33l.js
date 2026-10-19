import { jobs } from "./jobs.js";
import { LN, LNgo } from "../helpers.js";

export const L33 = [
{
  title: "Remote build caching: content-addressed action keys, hermeticity and hit rate",
  sim: "buildcache",
  snippet: "lesson_33_1.go",
  jobs: jobs(["ea", "POSTED: CI and build systems, developer productivity at scale. PUBLIC (Roblox 2025 tools blog): time-to-land and CI speed are tracked metrics. Bazel is NOT named in the posting."]),
  concept: "Most test-server time goes into building and testing again things that haven't changed. That test server is called **CI** (continuous integration). A **remote build cache** fixes that by remembering results. The trick is the **cache key**. A build step (an **action**) is a command plus everything it reads. Hash the command line, the relevant environment variables, the toolchain version and the **digest** (content hash) of every input file. Two actions with the same key must produce the same output, so the second one can just download the result. This is **content addressing**: outputs are stored by their hash, so identical files are stored once. It only works if actions are **hermetic**: they depend only on declared inputs. Hidden inputs break it in two ways. A timestamp or absolute path baked into the output makes keys differ every time (**cache misses**). An undeclared input, such as a header read from the machine, makes keys match when the outputs shouldn't (**cache poisoning**, which is worse). Build systems such as Bazel, Buck2 and others implement this with a remote cache and remote execution protocol. Only cache successful actions, and treat the cache as untrusted when keys come from developer machines: CI should write, laptops should read. Track **hit rate** by action type; a sudden drop usually means a new non-hermetic input.",
  analogy: "A bakery that labels every cake with its exact recipe and ingredient batch numbers. If someone orders the same recipe with the same batches, hand over the cake already made. If a baker secretly adds an unlisted ingredient, two different cakes get the same label.",
  language: "Go 1.22+ · deterministic action keys, cache-then-execute, success-only writes and hit-rate stats",
  primer: {
    text: "Builds repeat a lot of work that hasn't changed. A build cache remembers each step's result under a fingerprint of exactly what went into it. If the fingerprint matches, it reuses the result instead of doing the work again.",
    terms: [
      ["Action", "One build step: a command with its inputs and outputs."],
      ["Digest", "A content hash of a file, such as SHA-256."],
      ["Content addressing", "Storing data under the hash of its content."],
      ["Hermetic", "A build step that depends only on its declared inputs, nothing else on the machine."],
      ["Cache poisoning", "A wrong result stored under a key that later builds trust."],
      ["Hit rate", "The share of actions answered from the cache."],
    ],
  },
  lines: LNgo(`
package buildcache

import (
    "crypto/sha256"
    "encoding/hex"
    "sort"
    "strings"
)

type Action struct {
    Cmd    []string
    Env    map[string]string // only variables the action may read
    Inputs map[string]string // path -> content digest
    Tool   string            // toolchain identity, e.g. compiler digest
}

type Result struct {
    Exit   int
    Output []byte
}

type Cache interface {
    Get(key string) (Result, bool)
    Put(key string, r Result)
}

func sortedKeys(m map[string]string) []string {
    ks := make([]string, 0, len(m))
    for k := range m {
        ks = append(ks, k)
    }
    sort.Strings(ks) //@ Map order is random in Go; sort so the same action always hashes the same.
    return ks
}

// Key hashes everything the action depends on.
func Key(a Action) string {
    h := sha256.New()
    w := func(s string) { h.Write([]byte(s)); h.Write([]byte{0}) } //@ A separator byte stops "ab"+"c" colliding with "a"+"bc".
    w("tool:" + a.Tool)
    w("cmd:" + strings.Join(a.Cmd, "\\x00"))
    for _, k := range sortedKeys(a.Env) {
        w("env:" + k + "=" + a.Env[k])
    }
    for _, p := range sortedKeys(a.Inputs) {
        w("in:" + p + "=" + a.Inputs[p])
    }
    return hex.EncodeToString(h.Sum(nil))
}

type Stats struct{ Hits, Misses int }

// Run returns a cached result or executes and stores it if it succeeded.
func Run(a Action, c Cache, exec func(Action) Result, canWrite bool, st *Stats) (Result, bool) {
    k := Key(a)
    if r, ok := c.Get(k); ok {
        st.Hits++
        return r, true
    }
    st.Misses++
    r := exec(a)
    if r.Exit == 0 && canWrite { //@ Never cache failures, and only trusted CI workers write.
        c.Put(k, r)
    }
    return r, false
}

func (s Stats) HitRate() float64 {
    if s.Hits+s.Misses == 0 {
        return 0
    }
    return float64(s.Hits) / float64(s.Hits+s.Misses)
}
`),
  storyLesson: {
    scenarioTitle: "The cache that stopped hitting",
    scenario: "A monorepo's CI takes 25 minutes on average. A remote cache was added a year ago, but its hit rate has fallen from 85% to 30%, and nobody knows why.",
    sections: [
      { title: "1 · Find the miss", body: "Compare action keys from two CI runs of the same commit. The code-generation step's key differs: the generator stamps the build time into a header, which changes the inputs of everything downstream." },
      { title: "2 · Fix hermeticity", body: "Remove the timestamp (or pass a fixed one), strip absolute paths from compiler flags, and pin the toolchain by digest. Keys now match across runs." },
      { title: "3 · Guard the cache", body: "Only CI workers write; laptops read. A nightly job rebuilds a sample of actions without the cache and compares outputs, catching undeclared inputs." },
      { title: "4 · Watch the number", body: "Hit rate is tracked per action type on a dashboard with an alert on drops. Median CI time returns to 9 minutes." },
    ],
    checkpoint: { prompt: "Which is worse: a cache miss from a timestamp, or a cache hit from an undeclared input? Why?", answer: "The false hit. A miss only wastes time; a false hit returns the wrong output silently, which can ship a broken build." },
    lab: { title: "Key debugging tool", brief: "Write a small tool that explains why two action keys differ.", steps: ["Record each part that goes into Key", "Diff two records and print the first differing part", "Add a test with a timestamp in Env", "Add a test where a missing input causes a false hit", "Report hit rate by action type"], doneWhen: "The tool points to the exact field that broke the cache." },
  },
  exercise: "CI takes 30 minutes and the remote cache hit rate is 35%. Walk through how you'd diagnose and fix it.",
  answerHint: "Action keys, diffing, hermeticity, who writes, monitoring.",
  expected: ["key", "hermetic", "hit rate", "digest", "poisoning", "toolchain"],
  modelAnswer: "Break the hit rate down by action type and diff the action key inputs between two runs of the same commit to find what changes. Common causes are timestamps, absolute paths, unpinned toolchain versions and environment variables. Make actions hermetic: declare every input by digest and pin the toolchain. Protect against poisoning by letting only trusted CI write and by spot-checking rebuilt outputs against cached ones. Track hit rate per action type with alerts.",
  pitfalls: [
    "Hashing map entries in random order, so keys never match.",
    "Letting developer laptops write to the shared cache.",
    "Caching failed actions, so a flaky failure sticks.",
    "Measuring only overall hit rate, which hides one bad action type.",
  ],
  probes: [
    ["L1 · What goes into an action key?", "Command, relevant environment, toolchain identity and digests of all inputs."],
    ["L2 · Why is a false hit worse than a miss?", "It silently returns wrong output; a miss only costs time."],
    ["L3 · How do you detect undeclared inputs at scale?", "Sandboxing that hides undeclared files, plus periodic uncached rebuilds compared byte-for-byte."],
    ["L4 · The cache is 40 TB and slow. How do you evolve it?", "Tier it by access recency, add regional replicas near CI, evict by last-access with pinning for release branches, and measure fetch time versus rebuild cost per action."],
  ],
  poly: "Reproducible firmware builds for Poly devices hit the same problems: embedded timestamps and toolchain drift. Explaining how you made builds reproducible is a strong staff-level story here.",
  why: "Roblox's Engineering Acceleration posting covers CI and builds at scale (POSTED); its 2025 tools blog tracks time to land (PUBLIC). Build caching is the main lever on both.",
  companies: ["Roblox", "Google", "Meta", "Uber", "Stripe"],
  myth: { myth: "A remote cache automatically makes CI fast.", reality: "Without hermetic actions, the hit rate decays and the cache can even return wrong results." },
  interviewTip: "Say 'false hits are worse than misses'. It signals that you think about correctness before speed.",
},
{
  title: "Merge queues: batching, bisection and keeping main green",
  sim: "mergeq",
  snippet: "lesson_33_2.go",
  jobs: jobs(["ea", "POSTED: code review and CI systems, developer velocity. PUBLIC (Roblox 2025 tools blog): P75 time to land tracked."]),
  concept: "In a busy repository, two changes can each pass CI alone and still break **main** together. A **merge queue** prevents that: it tests each change on top of the latest main plus everything ahead of it in the queue, and merges only what passes. Testing one change at a time is safe but slow; with a 20-minute CI run, only three changes land per hour. **Batching** tests several queued changes together. If the batch passes, all of them merge at once. If it fails, **bisection** splits the batch in half and tests each half, repeating until the bad change is found and removed. With failure rate p and batch size B, batches fail more often as B grows, so the best batch size depends on p. **Speculative** queues run several batches in parallel, each assuming the ones ahead will pass, trading compute for latency. The metric developers feel is **time to land**: from approval to merge. Track it at p50 and p75, not just averages, because the slow tail is what frustrates people.",
  analogy: "A tour bus that checks passengers' tickets as a group. If the group check fails, it splits the group in half and checks again until it finds the one person without a ticket, instead of checking everyone one at a time from the start.",
  language: "Go 1.22+ · batch testing with recursive bisection on failure, counting CI runs",
  primer: {
    text: "Two changes can work alone but break things together. A merge queue tests changes in order on top of the newest code. It tests groups to save time, and splits a failing group to find the bad change.",
    terms: [
      ["Main (trunk)", "The shared branch everyone builds on; it should always pass tests."],
      ["Merge queue", "A line of approved changes, each tested on top of main and those ahead of it before merging."],
      ["Batch", "Several queued changes tested together in one CI run."],
      ["Bisection", "Splitting a failing batch in halves to find the change that broke it."],
      ["Time to land", "Time from approval until a change is merged."],
      ["Speculative testing", "Testing later batches in parallel, assuming earlier ones will pass."],
    ],
  },
  lines: LNgo(`
package mergeq

type PR struct {
    ID  int
    Bad bool // for simulation only: the real signal is the test result
}

// Tester runs CI on main plus the given changes, in order.
type Tester func(batch []PR) bool

type Outcome struct {
    Merged, Rejected []PR
    Runs             int
}

// Process lands the queue in batches of up to maxBatch, bisecting failures.
func Process(queue []PR, test Tester, maxBatch int) Outcome {
    if maxBatch < 1 {
        maxBatch = 1
    }
    var out Outcome
    for len(queue) > 0 {
        n := maxBatch
        if n > len(queue) {
            n = len(queue)
        }
        batch := queue[:n]
        queue = queue[n:]
        out.resolve(batch, test)
    }
    return out
}

func (o *Outcome) resolve(batch []PR, test Tester) {
    o.Runs++
    if test(append(append([]PR(nil), o.Merged...), batch...)) { //@ Test on top of everything already merged, in order.
        o.Merged = append(o.Merged, batch...)
        return
    }
    if len(batch) == 1 {
        o.Rejected = append(o.Rejected, batch[0]) //@ Found it: send this change back to its author.
        return
    }
    mid := len(batch) / 2
    o.resolve(batch[:mid], test) //@ Left half first, so the right half is tested on top of whatever the left half merged.
    o.resolve(batch[mid:], test)
}
`),
  storyLesson: {
    scenarioTitle: "Main is red every afternoon",
    scenario: "A 600-engineer monorepo merges directly after per-change CI. Every afternoon, main breaks from semantic conflicts between changes, and fixing it blocks everyone for an hour.",
    sections: [
      { title: "1 · Add a queue", body: "Every approved change now enters a queue and is tested on top of main plus the changes ahead. Main stops breaking, but p75 time to land doubles because CI runs one change at a time." },
      { title: "2 · Batch", body: "Batches of 8 cut CI runs sharply when most changes pass. When a batch fails, bisection finds the bad change in about log2(8) = 3 extra runs." },
      { title: "3 · Tune to the failure rate", body: "With about 5% of changes failing, batches of 8 fail a third of the time. The team sizes batches from the measured failure rate and runs two speculative batches in parallel." },
      { title: "4 · Measure", body: "The dashboard shows p50 and p75 time to land, main breakages per week and CI runs per landed change. Breakages fall to near zero and p75 time to land drops below its pre-queue level." },
    ],
    checkpoint: { prompt: "Why does the best batch size depend on the failure rate?", answer: "A batch passes only if every change in it passes, roughly (1−p)^B. Higher p makes big batches fail often, and each failure costs extra bisection runs." },
    lab: { title: "Batch size explorer", brief: "Simulate the queue with different failure rates and batch sizes.", steps: ["Generate 200 PRs with failure rate p", "Run Process for batch sizes 1, 2, 4, 8, 16", "Plot CI runs per landed change", "Repeat for p = 1%, 5%, 15%", "Pick a batch-size rule from the results"], doneWhen: "You can state the best batch size for each failure rate and why." },
  },
  exercise: "Main breaks daily from interacting changes, and developers complain about slow merging. Design the merge process.",
  answerHint: "Queue on top of main, batches, bisection, failure-rate tuning, time-to-land metrics.",
  expected: ["queue", "batch", "bisect", "main", "time to land", "p75"],
  modelAnswer: "Add a merge queue: each approved change is tested on top of main plus the changes ahead of it, so main stays green. To keep throughput, batch several changes per CI run and bisect a failing batch to find the culprit. Size batches from the measured failure rate, since (1-p)^B is the pass chance, and run speculative batches in parallel when compute allows. Track time to land at p50 and p75, main breakages and CI runs per landed change.",
  pitfalls: [
    "Testing each change only against the main it branched from.",
    "Fixed large batches when many changes fail, so bisection dominates.",
    "Reporting average time to land, which hides the slow tail.",
    "Letting flaky tests fail batches (lesson 33.3).",
  ],
  probes: [
    ["L1 · Why do changes that pass alone break main together?", "They interact: one renames a function, the other adds a new call to the old name."],
    ["L2 · What does bisection cost?", "About log2(B) extra runs to find one bad change in a batch of B, more if several are bad."],
    ["L3 · How does speculative execution change the tradeoff?", "It cuts latency by testing later batches in parallel, but wastes compute when an earlier batch fails and later ones must rerun."],
    ["L4 · The monorepo grows 3×. What breaks first and what do you change?", "One global queue becomes the bottleneck. Split queues by affected build targets, so unrelated changes land in parallel, and keep a final check for cross-cutting changes."],
  ],
  poly: "Coordinating driver changes across several Poly firmware branches taught you how conflicts arrive late. A merge queue is the automated version of the integration discipline you already practised.",
  why: "The Engineering Acceleration posting covers code review and CI (POSTED), and Roblox publicly tracks P75 time to land (PUBLIC). Merge queues directly move that metric.",
  companies: ["Roblox", "Uber", "Google", "Shopify", "GitHub"],
  myth: { myth: "More CI machines alone fix slow merging.", reality: "A serial queue is limited by CI duration, not machines; batching and speculation change the shape." },
  interviewTip: "Quote the formula (1−p)^B when discussing batch size. It shows the tradeoff is quantitative, not a guess.",
},
{
  title: "Flaky tests: detection on the same commit, quarantine and retry policy",
  sim: "flaky",
  snippet: "lesson_33_3.go",
  jobs: jobs(["ea", "POSTED: CI reliability, developer productivity metrics and engineering velocity."]),
  concept: "A **flaky test** passes and fails on the same code. Flakiness destroys trust in CI: developers rerun until green, merge queues reject good changes, and real failures get ignored. The cleanest signal is **same-commit disagreement**: if a test both passed and failed on one commit, it is flaky, whatever the code does. Count that across many commits to get a **flake rate** per test. Common causes are timing (sleeps, timeouts), shared state between tests, test order dependence, network calls and random seeds. Policy has three parts. **Retries** hide flakes from developers but can also hide real bugs; retry at most once and record that it happened. **Quarantine** removes a test from blocking CI once its flake rate crosses a threshold, while still running it and reporting to the owner. **Ownership and deadlines**: each quarantined test has an owner and a date, or it's deleted. A healthy CI tracks the share of runs failed by flakes and the time spent on reruns.",
  analogy: "A smoke alarm that sometimes goes off when you make toast. If you just keep resetting it, you'll ignore it during a real fire. Instead, log every false alarm, move the alarm while you fix it, and give someone a deadline.",
  language: "Go 1.22+ · same-commit disagreement detection, flake rates and a quarantine list",
  primer: {
    text: "A flaky test sometimes passes and sometimes fails with the same code. That makes people stop trusting test results. This lesson finds flaky tests, takes them out of the way, and makes sure someone fixes them.",
    terms: [
      ["Flaky test", "A test that passes and fails on the same code."],
      ["Same-commit disagreement", "A test both passed and failed on one commit: strong evidence of flakiness."],
      ["Flake rate", "Share of a test's commits where it disagreed with itself."],
      ["Quarantine", "Running a test without letting it block merges, while it gets fixed."],
      ["Retry", "Running a failed test again automatically."],
      ["Order dependence", "A test that only passes when run before or after certain other tests."],
    ],
  },
  lines: LNgo(`
package flaky

import "sort"

type Run struct {
    Test, Commit string
    Pass         bool
}

type Stats struct {
    Commits, Flaky int
}

// Analyze finds commits where a test both passed and failed.
func Analyze(runs []Run) map[string]Stats {
    type seen struct{ pass, fail bool }
    by := map[string]map[string]*seen{}
    for _, r := range runs {
        if by[r.Test] == nil {
            by[r.Test] = map[string]*seen{}
        }
        s := by[r.Test][r.Commit]
        if s == nil {
            s = &seen{}
            by[r.Test][r.Commit] = s
        }
        if r.Pass {
            s.pass = true
        } else {
            s.fail = true
        }
    }
    out := map[string]Stats{}
    for t, commits := range by {
        st := Stats{Commits: len(commits)}
        for _, s := range commits {
            if s.pass && s.fail { //@ Same code, different result: that's flakiness, not a bug in the change.
                st.Flaky++
            }
        }
        out[t] = st
    }
    return out
}

// Quarantine lists tests whose flake rate exceeds limit, given enough data.
func Quarantine(st map[string]Stats, minCommits int, limit float64) []string {
    var q []string
    for t, s := range st {
        if s.Commits >= minCommits && float64(s.Flaky)/float64(s.Commits) > limit { //@ Too little data: don't quarantine on one bad day.
            q = append(q, t)
        }
    }
    sort.Strings(q)
    return q
}
`),
  storyLesson: {
    scenarioTitle: "Rerun until green",
    scenario: "Developers rerun CI an average of 1.8 times per change. The merge queue rejects about 1 in 10 batches for failures that disappear on retry.",
    sections: [
      { title: "1 · Find the flakes", body: "CI already reruns failures, so the data exists. Grouping results by test and commit finds 140 tests that both passed and failed on the same commit last month." },
      { title: "2 · Quarantine", body: "Tests with a flake rate above 2% over at least 20 commits stop blocking merges. They still run, and their results go to the owning team's dashboard." },
      { title: "3 · Fix the causes", body: "Half of the flakes are timing (fixed sleeps), a quarter are shared temp directories, the rest are network calls. Each pattern gets a lint rule or helper." },
      { title: "4 · Keep it fixed", body: "Quarantined tests have an owner and a 30-day deadline. Reruns per change fall to 1.1 and merge-queue false rejections drop sharply." },
    ],
    checkpoint: { prompt: "Why is unlimited automatic retry a bad flaky-test policy?", answer: "It hides real intermittent bugs and the cost of flakiness. Retry at most once, record every retry, and quarantine and fix tests that need it." },
    lab: { title: "Flake report", brief: "Build a report from synthetic CI history.", steps: ["Generate runs for 50 tests over 100 commits with a few flaky ones", "Run Analyze and Quarantine", "Add an order-dependent test and see whether it's detected", "Add owner and deadline fields", "Report time lost to reruns"], doneWhen: "The report lists flaky tests with rates, owners and the time they cost." },
  },
  exercise: "Developers say CI is 'flaky' and rerun until green. How do you measure and fix this?",
  answerHint: "Same-commit signal, flake rate, quarantine with ownership, retry policy, metrics.",
  expected: ["flaky", "same commit", "quarantine", "retry", "owner", "rate"],
  modelAnswer: "Measure first: a test that passed and failed on the same commit is flaky, so compute a flake rate per test from CI history. Quarantine tests above a threshold, with a minimum amount of data, so they stop blocking merges but still run and report. Each quarantined test gets an owner and a deadline. Allow at most one retry and record it. Fix common causes like sleeps, shared state and network calls with helpers and lint rules. Track reruns per change and the share of failures from flakes.",
  pitfalls: [
    "Unlimited retries that hide real bugs.",
    "Quarantine without owners, so tests stay disabled forever.",
    "Deciding on too few runs and quarantining good tests.",
    "Missing order dependence because tests always run in the same order.",
  ],
  probes: [
    ["L1 · What's the simplest reliable flake signal?", "Pass and fail on the same commit."],
    ["L2 · Why keep running quarantined tests?", "To measure whether fixes work and to notice if they start failing consistently, which means a real bug."],
    ["L3 · How do you catch order-dependent tests?", "Shuffle test order with a recorded seed and compare results across seeds."],
    ["L4 · Flakiness is 30% infrastructure, not tests. How do you separate them?", "Tag failures by cause (runner, network, dependency service) using logs and exit codes, track infra flakes separately, and make infra owners accountable for their share."],
  ],
  poly: "Hardware-in-the-loop tests for Poly drivers were probably flaky for real reasons like timing and device state. That experience separating real intermittent bugs from test problems is exactly the judgment this role needs.",
  why: "Engineering Acceleration owns CI reliability and productivity metrics (POSTED). Flaky tests are one of the biggest drains on developer time.",
  companies: ["Roblox", "Google", "Meta", "Uber", "Spotify"],
  myth: { myth: "Retries solve flaky tests.", reality: "Retries hide them and the real bugs they can mask." },
  interviewTip: "Lead with the same-commit definition; it's crisp and measurable.",
},
{
  title: "Code search at monorepo scale: trigram indexes, candidate filtering and verification",
  sim: "trigram",
  snippet: "lesson_33_4.go",
  jobs: jobs(["ea", "POSTED: source code search and storage among the team's areas. PUBLIC (Roblox 2025 tools blog): code center for search and navigation."]),
  concept: "Searching every file for a string doesn't scale to a large repository. Code search engines such as Zoekt and Google's Code Search build a **trigram index**. A **trigram** is any three consecutive characters: \"mutex\" contains \"mut\", \"ute\" and \"tex\". The index maps each trigram to a **posting list**: the IDs of files that contain it. To search for a literal, take its trigrams and **intersect** their posting lists. Any file containing the string must contain all its trigrams, so the intersection is a superset of the real matches. These are **candidates**; then **verify** each by actually searching its text, which removes false positives (files that have the trigrams in different places). Regular expressions work by turning the regex into a query of required trigrams. Intersect shortest lists first to keep work small. A production system adds sharding across machines, incremental updates as commits land, ranking (definitions before uses), and access control.",
  analogy: "A library index that lists, for every three-letter combination, which books contain it. To find a phrase, look up its three-letter pieces, keep only books on every list, then open those few books to check.",
  language: "Go 1.22+ · building trigram posting lists, intersecting shortest-first and verifying candidates",
  primer: {
    text: "Searching a huge codebase line by line is too slow. A search index records which files contain each three-letter piece. A search checks only files that contain every piece, then confirms the real matches.",
    terms: [
      ["Trigram", "Three characters in a row, such as 'mut' in 'mutex'."],
      ["Posting list", "The sorted list of file IDs that contain one trigram."],
      ["Intersection", "Keeping only the IDs present in every list."],
      ["Candidate", "A file that might match because it contains all the trigrams."],
      ["Verification", "Checking a candidate's text to confirm the real match."],
      ["Sharding", "Splitting the index across machines."],
    ],
  },
  lines: LNgo(`
package trigram

import (
    "sort"
    "strings"
)

type Index struct {
    docs []string
    post map[string][]int // trigram -> sorted doc IDs
}

func New() *Index { return &Index{post: map[string][]int{}} }

func grams(s string) map[string]bool {
    g := map[string]bool{}
    for i := 0; i+3 <= len(s); i++ {
        g[s[i:i+3]] = true //@ Byte trigrams; real engines handle UTF-8 and case folding.
    }
    return g
}

func (x *Index) Add(text string) int {
    id := len(x.docs)
    x.docs = append(x.docs, text)
    for t := range grams(text) {
        x.post[t] = append(x.post[t], id) //@ IDs increase, so every list stays sorted.
    }
    return id
}

func intersect(a, b []int) []int {
    var out []int
    for i, j := 0, 0; i < len(a) && j < len(b); {
        switch {
        case a[i] == b[j]:
            out = append(out, a[i])
            i++
            j++
        case a[i] < b[j]:
            i++
        default:
            j++
        }
    }
    return out
}

// Search returns IDs of docs containing q, and how many candidates were checked.
func (x *Index) Search(q string) ([]int, int) {
    var cand []int
    if len(q) < 3 {
        for i := range x.docs { //@ No trigram to use: fall back to scanning everything.
            cand = append(cand, i)
        }
    } else {
        var lists [][]int
        for t := range grams(q) {
            lists = append(lists, x.post[t])
        }
        sort.Slice(lists, func(i, j int) bool { return len(lists[i]) < len(lists[j]) }) //@ Shortest first keeps every step small.
        cand = lists[0]
        for _, l := range lists[1:] {
            cand = intersect(cand, l)
        }
    }
    var hits []int
    for _, id := range cand {
        if strings.Contains(x.docs[id], q) { //@ Verify: trigrams in the wrong places are false positives.
            hits = append(hits, id)
        }
    }
    return hits, len(cand)
}
`),
  storyLesson: {
    scenarioTitle: "Search that takes a coffee break",
    scenario: "Engineers search a 40 GB repository with a grep-based tool that takes over a minute per query, so they stop searching and duplicate code instead.",
    sections: [
      { title: "1 · Build an index", body: "A trigram index over all text files fits in memory on a few shards. Queries now intersect posting lists and verify a few hundred candidates." },
      { title: "2 · Keep it fresh", body: "New commits are indexed incrementally into small delta shards, merged in the background. Results lag main by under a minute." },
      { title: "3 · Rank", body: "Definitions rank above uses, non-test code above tests, recent files above old. Engineers find the right result in the top three most of the time." },
      { title: "4 · Measure", body: "p95 query latency, searches per engineer per day and zero-result rate go on a dashboard. Search use triples." },
    ],
    checkpoint: { prompt: "Why must every candidate be verified?", answer: "Containing all trigrams doesn't mean they appear together in order. Only checking the text confirms the match." },
    lab: { title: "Index a real repository", brief: "Index a source tree and measure.", steps: ["Index every .go, .c and .h file in a repository", "Compare Search with a full scan for 20 queries", "Record candidates checked versus files in the repository", "Add case-insensitive search", "Estimate index memory per GB of source"], doneWhen: "Search returns the same results as a scan with far fewer files checked." },
  },
  exercise: "Engineers wait over a minute for code search in a large monorepo. Design a fast code search system.",
  answerHint: "Trigram index, intersection, verification, sharding, freshness, ranking.",
  expected: ["trigram", "posting", "intersect", "verify", "shard", "incremental"],
  modelAnswer: "Build a trigram index mapping every three-character sequence to a posting list of file IDs. A query takes its trigrams, intersects the posting lists shortest first, then must verify each candidate against the text to remove false positives. Regexes become trigram queries. Shard the index across machines and fan out queries, update it incrementally as commits land, rank definitions above uses, and enforce access control. Track p95 latency and zero-result rate.",
  pitfalls: [
    "Skipping verification and returning false positives.",
    "Intersecting long lists first, which wastes work.",
    "Rebuilding the whole index on every commit.",
    "Ignoring access control for restricted directories.",
  ],
  probes: [
    ["L1 · What's a trigram index?", "A map from every three-character sequence to the files containing it."],
    ["L2 · How do you handle queries shorter than three characters?", "Fall back to a scan or require more context; short queries are rarely useful anyway."],
    ["L3 · How do you support regex?", "Convert the regex into a boolean query of required trigrams, intersect and union lists, then verify with the regex engine."],
    ["L4 · The index must reflect commits within a minute across 10 shards. Design the update path.", "Commit hooks feed an indexer that builds small delta shards; queries merge base and delta results; a compactor merges deltas into base periodically; versions keep queries consistent."],
  ],
  poly: "Searching large vendor driver trees for register names is everyday work for you. Building the tool that makes that instant for a whole company is a natural staff-level step.",
  why: "Source code search is named in the Engineering Acceleration posting (POSTED), and Roblox's tools blog describes its code center (PUBLIC).",
  companies: ["Roblox", "Google", "Sourcegraph", "GitHub", "Meta"],
  myth: { myth: "Code search is just grep on a big machine.", reality: "At scale it's an index problem: trigrams, sharding and freshness." },
  interviewTip: "Explain candidates versus verified matches. It shows you understand why the index is fast and still correct.",
},
];
