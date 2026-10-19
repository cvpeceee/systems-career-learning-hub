import { chapter } from "../helpers.js";
import { L35 } from "./ch35l.js";

export const CH35 = chapter({
  id: "robot-platform", number: 35, title: "Robotics Platform: Running VLA Policies, Safe Autonomy & Evaluation Gates", shortTitle: "Robotics Platform",
  duration: "7–9 hours", leverage: false,
  promise: "Take a large learned robot policy from the model to the motors: feed a real-time controller from a slow model, guard it with a checkable safety layer, and decide with statistics when a new policy is really better.",
  diagram: "flow", flowStages: ["observe", "infer", "chunk", "guard", "act", "evaluate"],
  captions: [
    "Cameras and an instruction describe the scene (observation).",
    "A large model plans the next moves (VLA inference).",
    "Planned moves are played back smoothly at a fast rate (action chunking).",
    "A simple checker stops anything unsafe (Simplex, stopping distance).",
    "Motors follow the approved command (real-time control loop).",
    "Results decide whether a new version ships (success rates, confidence intervals).",
  ],
  phases: [
    { label: "Run", title: "Model to motors", detail: "Chunks, latency skipping, temporal ensembling, staleness, real-time loops.", lessons: [0] },
    { label: "Guard", title: "Safe boundaries", detail: "Simplex, envelopes, stopping distance, fallback, hysteresis.", lessons: [1] },
    { label: "Judge", title: "Evidence to ship", detail: "Wilson intervals, task suites, sim-to-real, release gates.", lessons: [2] },
  ],
  lessons: [...L35],
  lab: {
    title: "Capstone: a robot policy platform design",
    brief: "Design the platform that takes a new VLA checkpoint from training to a fleet of lab robots.",
    steps: [
      "Serving: where inference runs, latency budget, chunk size and handoff",
      "Control: loop rate, ensembling, staleness and hold behavior",
      "Safety: envelope, fallback, standards, intervention logging",
      "Evaluation: task suite, sim screening, real trials, gate rules",
      "Operations: rollout to robots, rollback, monitoring",
    ],
    doneWhen: "A new checkpoint can be evaluated and rolled out with a written gate, and every safety claim has a test.",
    starterLang: "Markdown · platform design",
    starter: `# Robot policy platform
## Serving and latency
## Control loop
## Safety layer
## Evaluation and gates
## Rollout and monitoring`,
  },
  quiz: [
    { prompt: "Action chunking exists because…", options: ["Models are tiny", "Inference is slower than the control rate", "Motors are slow", "It saves memory"], answer: 1, explanation: "Chunks bridge the rate gap." },
    { prompt: "Index a chunk's actions by…", options: ["Arrival time", "Ticks since its observation", "Random", "Chunk count"], answer: 1, explanation: "Skips the inference delay." },
    { prompt: "Temporal ensembling trades…", options: ["Memory for speed", "Smoothness for responsiveness", "Safety for cost", "Nothing"], answer: 1, explanation: "More averaging, slower reaction." },
    { prompt: "Stopping distance is…", options: ["v/a", "v·t_r + v²/(2a)", "a·t²", "v²·a"], answer: 1, explanation: "Reaction plus braking." },
    { prompt: "Simplex's safety controller must be…", options: ["Learned", "Simple and verifiable", "Fast to train", "Cloud-hosted"], answer: 1, explanation: "So it can be trusted." },
    { prompt: "For 18/20 successes, a 95% Wilson interval is roughly…", options: ["89–91%", "70–97%", "50–100%", "85–95%"], answer: 1, explanation: "Small samples are uncertain." },
    { prompt: "Scenario: the robot stutters at doorways, flipping between safety and policy control. Fix?", options: ["Lower speed", "Hysteresis before handing back", "Remove the safety layer", "Bigger model"], answer: 1, explanation: "Require calm cycles.", scenario: true },
    { prompt: "Scenario: new policy 92% vs 85% on 25 trials each, but worse on a critical task. Ship?", options: ["Yes", "No: per-task regression and overlapping intervals", "Yes, after a blog post", "Only in sim"], answer: 1, explanation: "The gate fails twice.", scenario: true },
  ],
  interviewRoom: {
    title: "Microsoft Robotics MTS interview room",
    intro: "Modeled on Microsoft's Member of Technical Staff (Principal-level), Microsoft Robotics posting (POSTED: VLA, ROS 2/Nav2, sim-to-real, safe-autonomy boundaries, evaluation gates, ML serving). Microsoft's general interview format is described publicly (PUBLIC); the loop for this team is not published.",
    questions: [
      { prompt: "Design · Serve a 3B-parameter VLA to 20 lab robots with a 100 Hz control loop.", answer: "On-robot GPU or nearby edge server per latency budget; chunked actions with timestamps; lock-free handoff to the control thread; ensembling; staleness hold; monitoring of inference latency and loop jitter; fallback policy on network loss." },
      { prompt: "Safety · How do you bound what a learned policy can do?", answer: "Simplex: envelope checks on proposed commands (speed, workspace, stopping distance), verified fallback, hysteresis, intervention logging, standards-based limits, and tests for sensor failure." },
      { prompt: "Evaluation · How do you know a new policy is better?", answer: "Fixed task suites, paired trials, Wilson intervals, per-task regression checks, sim screening with tracked sim-real correlation, safety and latency gates." },
      { prompt: "ROS 2 · Where does ROS 2 fit, and what are its pitfalls?", answer: "Middleware for sensors, navigation (Nav2) and tooling; pitfalls are QoS mismatches, executor latency, and large-message copies. Keep the hard real-time loop outside or on a real-time executor." },
      { prompt: "Leadership · Researchers want to ship fast; safety wants more testing. How do you resolve it?", answer: "Agree on the gate in advance with both, automate it so it's fast, and give researchers a sandbox path with restricted envelopes for quick iteration." },
    ],
    tasks: [
      { title: "45 minutes · C++ topic bus", prompt: "Implement a small publish/subscribe bus with reliable and best-effort QoS and a keep-last history.", rubric: ["Correct QoS semantics", "Thread safety", "Bounded memory", "Tests"] },
      { title: "30 minutes · Chunk executor", prompt: "Implement latency skipping and ensembling, and show the jump size with and without.", rubric: ["Indexing by observation time", "Weights", "Staleness"] },
      { title: "20 minutes · Gate math", prompt: "Implement Wilson intervals and a promotion rule.", rubric: ["Correct formula", "Edge cases n=0, k=n", "Clear decision"] },
    ],
  },
});
