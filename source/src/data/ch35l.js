import { jobs } from "./jobs.js";
import { LN } from "../helpers.js";

export const L35 = [
{
  title: "Running learned robot policies: action chunks, control rates, latency and temporal ensembling",
  sim: "chunking",
  snippet: "lesson_35_1.cpp",
  jobs: jobs(["ms", "POSTED: vision-language-action (VLA) models on real robots, real-time systems and ML serving for robotics. PUBLIC: Microsoft Research's Rho-alpha robotics model (announced Jan 2026)."]),
  concept: "A **vision-language-action** (VLA) model takes camera images and an instruction and outputs robot actions. These models are large, so one inference may take 50–300 ms, while a robot arm's controller needs a new command every few milliseconds. The common bridge is **action chunking**: each inference predicts a **chunk** of the next H actions (say 50 steps at 50 Hz, one second). A low-level controller runs at its own fast rate, following the chunk, while the next inference runs in the background. Three problems appear. **Latency**: by the time a chunk arrives, its first actions are already in the past. Skip the actions for elapsed time so the robot doesn't jerk backwards. **Discontinuities**: switching from one chunk to the next can cause a jump. **Temporal ensembling** (from the ACT work on action chunking) averages all chunks that cover the current time, weighting older predictions more or less with an exponential factor, which smooths motion. **Staleness**: if inference stalls, the robot keeps executing an old plan. The executor must detect that the current chunk is used up or too old and command a safe hold. Keep the fast loop **real-time**: no memory allocation, no locks that can block, and fixed-size buffers.",
  analogy: "A tour guide who walks ahead plotting the next stretch of the route while the group follows the last one. When a new plan arrives, the group blends into it instead of turning sharply; if the guide goes silent, the group stops rather than walking off a cliff.",
  language: "C++17 · a fixed-capacity chunk executor with latency skipping, exponential temporal ensembling and a staleness stop",
  primer: {
    text: "Large robot AI models think slowly, but robot arms need commands many times a second. So the model plans a short burst of moves at once, and a fast loop plays them back. New plans are blended in smoothly, and the robot holds still if plans stop arriving.",
    terms: [
      ["VLA (vision-language-action) model", "A model that takes images and an instruction and outputs robot actions."],
      ["Action chunk", "A sequence of future actions predicted in one model run."],
      ["Control rate", "How often the low-level controller sends a command, such as 50 times a second."],
      ["Temporal ensembling", "Averaging the actions that several overlapping chunks predict for the same moment."],
      ["Staleness", "When the plan being followed is too old to trust."],
      ["Real-time loop", "Code that must finish every cycle on time; it avoids memory allocation and blocking."],
    ],
  },
  lines: LN(`
#include <array>
#include <cmath>
#include <optional>

constexpr int H = 50;          // actions per chunk
constexpr int MAXC = 4;        // chunks kept for ensembling
constexpr int DOF = 7;         // joints

using Act = std::array<double, DOF>;
struct Chunk { long t0 = 0; std::array<Act, H> a{}; bool used = false; };   //@ t0 = control tick of the observation the chunk was planned from.

class Executor {
  std::array<Chunk, MAXC> ring_{};   //@ Fixed storage: no allocation inside the control loop.
  int next_ = 0;
  double k_;
 public:
  explicit Executor(double k) : k_(k) {}
  void push(const Chunk &c) { ring_[next_] = c; ring_[next_].used = true; next_ = (next_ + 1) % MAXC; }

  // Command for control tick t, or nullopt to hold position safely.
  std::optional<Act> act(long t) const {
    Act sum{}; double wsum = 0;
    for (const Chunk &c : ring_) {
      if (!c.used) continue;
      long i = t - c.t0;                 //@ Latency skip: index by elapsed ticks since the observation, not since arrival.
      if (i < 0 || i >= H) continue;     //@ This chunk doesn't cover tick t.
      double w = std::exp(-k_ * i);      //@ Exponential weighting: older chunks have larger i, so k > 0 favors newer plans. k = 0 is a plain average.
      for (int j = 0; j < DOF; ++j) sum[j] += w * c.a[i][j];
      wsum += w;
    }
    if (wsum == 0) return std::nullopt; //@ Every chunk is used up: stale plan, so hold.
    for (double &x : sum) x /= wsum;
    return sum;
  }
};
`),
  storyLesson: {
    scenarioTitle: "The arm that twitches every second",
    scenario: "A team deploys a VLA policy on a 7-joint arm. Inference takes 180 ms, chunks are 50 steps at 50 Hz, and the arm jerks visibly each time a new chunk arrives. Once, when the inference server hiccuped, the arm kept moving past its target.",
    sections: [
      { title: "1 · Latency", body: "Each chunk was played from its first action on arrival, 9 ticks late, so the arm jumped back in time. Indexing by ticks since the observation removes most of the jump." },
      { title: "2 · Smoothing", body: "Temporal ensembling averages the overlapping chunks. Motion becomes smooth, at the cost of slightly slower reaction to new instructions." },
      { title: "3 · Stale plans", body: "When no chunk covers the current tick, the executor returns 'hold', and the arm's controller holds position. A watchdog also checks inference health." },
      { title: "4 · Real-time hygiene", body: "The control loop uses fixed buffers and a lock-free handoff from the inference thread. Worst-case loop time is measured and logged." },
    ],
    checkpoint: { prompt: "Why index a chunk by ticks since its observation instead of since it arrived?", answer: "The model planned from the moment it saw the image. Actions for the time spent on inference are already in the past; skipping them keeps the plan aligned with reality." },
    lab: { title: "Chunk executor bench", brief: "Simulate a policy and measure smoothness.", steps: ["Generate chunks from a smooth trajectory with noise", "Run with latency 0, 5 and 15 ticks, with and without skipping", "Measure the largest jump between consecutive commands", "Try k = 0, 0.01 and 0.1", "Stop sending chunks and confirm the hold"], doneWhen: "You can pick k and show the jump size and reaction time tradeoff with numbers." },
  },
  exercise: "A large robot policy takes 200 ms per inference, but the arm needs commands at 100 Hz. Design how actions get from the model to the motors safely.",
  answerHint: "Chunking, separate rates, latency compensation, ensembling, staleness and real-time loop.",
  expected: ["chunk", "latency", "ensembl", "stale", "control loop", "real-time"],
  modelAnswer: "Have the model predict an action chunk covering the next second or so. A real-time control loop runs at 100 Hz on its own thread, following the current chunk, while inference runs in parallel. Compensate latency by indexing each chunk by elapsed time since its observation. Use temporal ensembling to blend overlapping chunks and avoid jumps. If no fresh chunk covers the current time, the plan is stale: hold or stop safely. Keep the loop real-time with fixed buffers and no blocking, and measure worst-case loop time.",
  pitfalls: [
    "Playing chunks from their start on arrival, ignoring inference latency.",
    "Allocating memory or taking blocking locks in the control loop.",
    "No staleness check, so the robot follows an old plan.",
    "Over-smoothing so the robot reacts slowly to new instructions.",
  ],
  probes: [
    ["L1 · Why predict chunks instead of one action?", "Inference is slower than the control rate; a chunk keeps the controller supplied between model runs."],
    ["L2 · What does temporal ensembling trade?", "Smoothness against responsiveness: more averaging means fewer jumps but slower reaction."],
    ["L3 · How do you hand chunks from the inference thread to the control thread?", "A lock-free single-producer single-consumer slot or ring with release/acquire, so the control loop never blocks."],
    ["L4 · The model runs in the cloud sometimes and on-board other times. How does the design change?", "Treat latency as variable: measure it per chunk with timestamps, adapt chunk length and staleness limits, and keep an on-board fallback policy for network loss."],
  ],
  poly: "Real-time audio and DSP pipelines on Poly devices have the same structure: a slow producer, a fast fixed-rate consumer, fixed buffers, and graceful handling of underruns.",
  why: "The Microsoft Robotics MTS posting names VLA models, real-time systems and ML serving (POSTED); Rho-alpha is Microsoft Research's public VLA work (PUBLIC).",
  companies: ["Microsoft", "Google DeepMind", "Physical Intelligence", "Tesla", "Figure"],
  myth: { myth: "A smarter model makes the control loop unnecessary.", reality: "Real robots still need a fast, deterministic loop between the model and the motors." },
  interviewTip: "Separate the slow model loop from the fast control loop in your first sentence. It frames everything else.",
},
{
  title: "Safe autonomy boundaries: the Simplex pattern, safety envelopes and fallback control",
  sim: "simplex",
  snippet: "lesson_35_2.cpp",
  jobs: jobs(["ms", "POSTED: safe autonomy boundaries, safety and reliability for learned robot behaviors."]),
  concept: "A learned policy can't be fully verified, but a robot near people must have guarantees. The **Simplex architecture** handles this with three parts. An **advanced controller** (the learned policy) proposes commands. A simple, verifiable **safety controller** (stop, brake, retreat) can always bring the robot to a safe state. A **decision module** checks every proposed command against a **safety envelope**, and switches to the safety controller if the command would leave it. Envelope checks are simple physics: speed limits near humans, joint and workspace limits, and **stopping distance**. At speed v with deceleration a and reaction time t_r, the robot needs v·t_r + v²/(2a) to stop. If the distance to the nearest obstacle is less than that plus a margin, the proposed command isn't safe. Switch back to the learned policy only after a period inside the envelope (**hysteresis**), or the robot flickers between modes. Log every intervention: the **intervention rate** is a key safety and quality metric for learned behaviors. Safety standards such as ISO 10218 (industrial robots) and ISO/TS 15066 (collaborative robots) shape the limits for real products.",
  analogy: "A learner driver with an instructor who has their own brake pedal. The learner drives; the instructor only brakes when the car would get too close to something, then lets the learner continue once things are calm.",
  language: "C++17 · stopping-distance envelope check, switch to a fallback controller, hysteresis and intervention counting",
  primer: {
    text: "An AI that drives a robot can make mistakes, so a simple safety checker watches every command. If a command would get too close to a person or object, the checker takes over and stops the robot. The AI gets control back only after things are safe for a while.",
    terms: [
      ["Simplex architecture", "A learned controller plus a simple, verified safety controller, with a switch between them."],
      ["Safety envelope", "The set of states and commands known to be safe."],
      ["Stopping distance", "How far the robot moves before it can stop: reaction distance plus braking distance."],
      ["Fallback controller", "The simple controller that brings the robot to a safe state."],
      ["Intervention rate", "How often the safety layer overrides the learned policy."],
      ["Hysteresis", "Requiring a calm period before switching back, to avoid flickering."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <cmath>

struct Cmd { double v; };                      // forward speed, m/s
struct State { double v; double dist; };       // current speed, distance to nearest obstacle (m)

struct Limits {
  double a_brake = 2.0;      // m/s^2 the fallback can always achieve
  double t_react = 0.1;      // s from decision to braking
  double margin = 0.3;       // m kept free at all times
  double v_max = 1.5;        // m/s cap near people
};

double stopping_distance(double v, const Limits &L) {
  v = std::max(0.0, v);
  return v * L.t_react + v * v / (2 * L.a_brake);   //@ Distance covered while reacting, plus braking distance.
}

bool safe(const State &s, const Cmd &c, const Limits &L) {
  if (c.v > L.v_max) return false;
  return stopping_distance(c.v, L) + L.margin <= s.dist;   //@ Check the PROPOSED speed: could we still stop in time?
}

class Supervisor {
  Limits L_;
  int calm_ = 0, need_;
  bool fallback_ = false;
 public:
  long interventions = 0;
  Supervisor(Limits L, int need) : L_(L), need_(need) {}
  Cmd step(const State &s, const Cmd &learned) {
    bool ok = safe(s, learned, L_);
    if (!ok) {
      if (!fallback_) ++interventions;                     //@ Count each takeover once, for the metrics.
      fallback_ = true;
      calm_ = 0;
    } else if (fallback_ && ++calm_ >= need_) {
      fallback_ = false;                                   //@ Hand back only after "need" safe cycles in a row.
    }
    if (!fallback_) return learned;
    double v = std::max(0.0, s.v - L_.a_brake * 0.01);    //@ Fallback: brake at a_brake (10 ms cycle).
    return Cmd{v};
  }
  bool in_fallback() const { return fallback_; }
};
`),
  storyLesson: {
    scenarioTitle: "A mobile robot in a busy lab",
    scenario: "A learned navigation policy drives a mobile manipulator through a lab with people. It's usually smooth, but twice it approached a person faster than staff were comfortable with.",
    sections: [
      { title: "1 · Add the envelope", body: "A supervisor checks each proposed speed against the stopping distance to the nearest obstacle from the depth sensors, with a margin and a speed cap near people." },
      { title: "2 · Fallback", body: "On violation, a simple controller brakes at a known deceleration. It is small enough to review line by line and test exhaustively." },
      { title: "3 · Hysteresis", body: "Control returns to the policy after 20 calm cycles. Without this, the robot stuttered at doorways as it flipped between modes." },
      { title: "4 · Metrics", body: "Interventions per hour are logged with sensor snapshots. They feed back into policy training data and form a release gate (lesson 35.3)." },
    ],
    checkpoint: { prompt: "Why check the proposed command instead of the current state?", answer: "The current state may be safe while the command would take the robot somewhere it can't stop in time. Checking the command catches the problem before it happens." },
    lab: { title: "Envelope test suite", brief: "Exercise the supervisor with scenarios.", steps: ["Approach a wall at 1.5 m/s and confirm a stop before the margin", "A person steps in at 0.8 m", "Noisy distance readings near the threshold: measure mode flicker with need = 1 and need = 20", "Count interventions over a run", "Vary braking and reaction time and recompute the safe speed"], doneWhen: "No scenario breaches the margin and mode flicker disappears with hysteresis." },
  },
  exercise: "You're deploying a learned navigation policy on a robot that works near people. How do you guarantee safety without verifying the neural network?",
  answerHint: "Simplex, envelope, stopping distance, fallback, hysteresis, metrics.",
  expected: ["simplex", "envelope", "stopping distance", "fallback", "hysteresis", "intervention"],
  modelAnswer: "Use a Simplex architecture: the learned policy proposes commands, and a simple decision module checks each against a safety envelope before it reaches the motors. The envelope includes speed caps near people and a stopping distance check, reaction distance plus v squared over 2a plus a margin, against the nearest obstacle. Violations switch to a verified fallback controller that brakes. Return control only after a calm period, which is hysteresis. Log the intervention rate as a safety metric and release gate, and follow ISO 10218 and ISO/TS 15066 for limits.",
  pitfalls: [
    "Checking the current state instead of the proposed command.",
    "A fallback controller too complex to verify.",
    "No hysteresis, so the robot flickers between modes.",
    "Not counting interventions, which hides safety regressions.",
  ],
  probes: [
    ["L1 · What does the safety controller need to guarantee?", "That it can always bring the robot to a safe state from anywhere inside the envelope."],
    ["L2 · Where do braking and reaction values come from?", "Measured worst cases for the platform, including load, floor surface and sensor delay, with margin."],
    ["L3 · How do you handle sensor failure?", "Treat missing or stale sensor data as unsafe: the envelope shrinks to stop, and the fault is reported."],
    ["L4 · Manipulation near people, not just driving. How does the envelope generalize?", "Use speed and separation monitoring or power and force limiting per ISO/TS 15066, computed for each link's motion toward the nearest human, with the same switch-and-hysteresis structure."],
  ],
  poly: "Safety limits in Poly hardware, such as thermal shutdowns and audio level limiters, follow the same idea: a simple, trusted guard around a complex system.",
  why: "Safe autonomy boundaries are named in the Microsoft Robotics posting (POSTED).",
  companies: ["Microsoft", "Boston Dynamics", "Tesla", "Amazon Robotics", "Agility"],
  myth: { myth: "Train the policy well enough and you don't need a safety layer.", reality: "You can't test every situation; a simple, checkable guard is how real systems give guarantees." },
  interviewTip: "Write the stopping-distance formula. Concrete physics beats abstract talk about 'safety layers'.",
},
{
  title: "Evaluation gates for robot policies: success rates, confidence intervals and sim-to-real",
  sim: "capability",
  snippet: "lesson_35_3.cpp",
  jobs: jobs(["ms", "POSTED: evaluation infrastructure and gates for robot capabilities; sim-to-real transfer."]),
  concept: "Robot policies are judged by **success rate** on a set of tasks, but real-robot trials are expensive, so sample sizes are small. 18 successes in 20 trials isn't 90% with certainty. A **confidence interval** shows the uncertainty. For proportions, the **Wilson interval** behaves well with small samples and rates near 0 or 1. Gate decisions should use the interval's **lower bound**: a new policy is promoted only if its lower bound beats the current one's point estimate, or if the difference is clearly positive. Evaluate on a **task suite** that covers the variety you care about: different objects, lighting, positions. Report per task, because a gain on easy tasks can hide a loss on hard ones. **Simulation** gives thousands of trials cheaply, but the **sim-to-real gap** means sim results may not transfer. Track the correlation between sim and real scores, and use sim to screen candidates and real trials to decide. A release gate checks several things together: success with confidence, no regression on any critical task, safety intervention rate (lesson 35.2) not worse, and latency within budget.",
  analogy: "Judging a new recipe from 20 taste tests. 18 of 20 liked it, but with so few tasters you'd say 'somewhere between about 70% and 97%'. Before replacing the old recipe, you want the low end of that range to beat it, for every type of customer.",
  language: "C++17 · Wilson intervals, per-task comparison and a multi-condition release gate",
  primer: {
    text: "Robot tests are slow and costly, so we only get a few trials. A small number of trials leaves a lot of uncertainty about the true success rate. This lesson only promotes a new robot policy when it is clearly better on every important task.",
    terms: [
      ["Success rate", "Share of trials where the robot completed the task."],
      ["Confidence interval", "A range likely to contain the true value, given the data."],
      ["Wilson interval", "A confidence interval for proportions that works well with small samples."],
      ["Lower bound", "The bottom of the interval; a cautious estimate."],
      ["Task suite", "A fixed set of tasks and conditions used for every evaluation."],
      ["Sim-to-real gap", "The difference between results in simulation and on real robots."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

struct Interval { double lo, mid, hi; };

// Wilson score interval for k successes in n trials (z = 1.96 for ~95%).
Interval wilson(int k, int n, double z = 1.96) {
  if (n == 0) return {0, 0, 1};                         //@ No data: anything is possible.
  double p = static_cast<double>(k) / n, z2 = z * z;
  double den = 1 + z2 / n;
  double c = (p + z2 / (2 * n)) / den;                  //@ Center is pulled toward 0.5 for small n.
  double half = z * std::sqrt(p * (1 - p) / n + z2 / (4.0 * n * n)) / den;
  return {std::max(0.0, c - half), p, std::min(1.0, c + half)};
}

struct TaskResult { std::string task; int k_new, n_new, k_old, n_old; bool critical; };

struct Gate {
  bool pass; std::string why;
};

Gate release_gate(const std::vector<TaskResult> &tasks, double interv_new, double interv_old,
                  double p95_ms, double budget_ms) {
  int kn = 0, nn = 0, ko = 0, no = 0;
  for (const auto &t : tasks) {
    Interval a = wilson(t.k_new, t.n_new), b = wilson(t.k_old, t.n_old);
    if (t.critical && a.hi < b.mid) return {false, "regression on critical task " + t.task};   //@ Even the optimistic estimate is worse than the old policy.
    kn += t.k_new; nn += t.n_new; ko += t.k_old; no += t.n_old;
  }
  Interval all_new = wilson(kn, nn), all_old = wilson(ko, no);
  if (all_new.lo <= all_old.mid) return {false, "improvement not yet significant: run more trials"};
  if (interv_new > interv_old) return {false, "more safety interventions than current policy"};
  if (p95_ms > budget_ms) return {false, "inference latency over budget"};
  return {true, "promote"};
}
`),
  storyLesson: {
    scenarioTitle: "The 'better' policy that wasn't",
    scenario: "A new manipulation policy scores 92% versus the current 85% on 25 real trials each. The team wants to ship it. A week later, operators report it fails often on transparent objects.",
    sections: [
      { title: "1 · Intervals", body: "With 25 trials, 92% has a Wilson interval of roughly 75–98%. The overlap with the old policy is large; the 'gain' wasn't established." },
      { title: "2 · Per-task", body: "Broken down by task, the new policy improved on opaque boxes but dropped sharply on transparent bottles, a critical task for this customer." },
      { title: "3 · Sim to screen, real to decide", body: "Sim runs 2,000 trials per candidate to screen. Only candidates that pass in sim go to real trials, and sim–real correlation per task is tracked." },
      { title: "4 · The gate", body: "Promotion now needs the overall lower bound above the current policy, no critical-task regression, no rise in interventions, and latency within budget." },
    ],
    checkpoint: { prompt: "Why use the lower bound instead of the point estimate for promotion?", answer: "With few trials, the point estimate is noisy. Requiring the lower bound to beat the current policy guards against promoting a policy that only looked better by chance." },
    lab: { title: "Gate calculator", brief: "Use the functions to decide on real-looking data.", steps: ["Compute Wilson intervals for 18/20, 45/50 and 180/200", "Find how many trials make 90% vs 85% significant", "Build a 6-task suite with one critical task", "Run the gate on a policy that improves easy tasks only", "Add an intervention-rate regression and check the gate stops it"], doneWhen: "You can explain each gate decision and the trial count it needed." },
  },
  exercise: "A new robot policy beats the current one 92% to 85% on 25 real trials each. Should you ship it? Design the evaluation gate.",
  answerHint: "Uncertainty, Wilson intervals, per-task checks, sim and real roles, safety and latency.",
  expected: ["confidence", "wilson", "per-task", "sim-to-real", "intervention", "lower bound"],
  modelAnswer: "Not yet. With 25 trials the confidence intervals overlap a lot; a Wilson interval for 23 of 25 is roughly 75 to 98%. The gate should require the new policy's lower bound to beat the current policy, checked overall and per-task, with no regression on critical tasks. Use simulation to screen many candidates and real trials to decide, while tracking the sim-to-real gap. Also require the safety intervention rate not to increase and latency to stay within budget.",
  pitfalls: [
    "Shipping on point estimates from a handful of trials.",
    "Only reporting the average across tasks.",
    "Trusting sim results without checking sim–real correlation.",
    "Ignoring safety and latency in the release decision.",
  ],
  probes: [
    ["L1 · Why is 18/20 not simply 90%?", "That's the point estimate; the true rate could plausibly be anywhere from about 70% to 97%."],
    ["L2 · Why Wilson rather than the normal approximation?", "The normal interval misbehaves for small n and rates near 0 or 1, even going outside 0–1; Wilson doesn't."],
    ["L3 · How do you reduce the trials needed?", "Paired designs (same scenes for both policies), stratified task suites, sequential testing with pre-set stopping rules, and sim screening."],
    ["L4 · How would you build evaluation infrastructure for 50 robots across sites?", "Versioned task suites, scene resets, automatic success detection with human audit, result storage per policy version, dashboards with intervals, and scheduling that pairs policies on the same robots."],
  ],
  poly: "Hardware qualification for Poly products also had small sample sizes and pass/fail gates. Framing your test-gate experience in confidence-interval terms makes it staff-level evidence.",
  why: "The Microsoft Robotics posting includes evaluation gates and sim-to-real work (POSTED).",
  companies: ["Microsoft", "Google DeepMind", "Physical Intelligence", "Toyota Research Institute", "Tesla"],
  myth: { myth: "A higher success rate on the test set means a better policy.", reality: "Only if the difference is bigger than the uncertainty, and holds for every task that matters." },
  interviewTip: "Ask 'how many trials?' before judging any success rate. It immediately shows statistical maturity.",
},
];
