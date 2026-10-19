import { h, useState, Toggle, Choice, Bar, Verdict, tl, fmt } from "../rt.js";

// Playbook content. Labels: POSTED = job posting, PUBLIC = named public source, INFERRED = our reasoning. Never invented.
const PB = {
  ant: {
    title: "Anthropic · Staff+ SWE, Infrastructure (Distributed Systems)",
    role: [
      "POSTED: one requisition (SF / NYC / Seattle); the two LinkedIn cards are the same job.",
      "POSTED: build and run the distributed systems that train and serve models: reliability, scalability, data pipelines.",
      "POSTED: team placement happens after the interview; related postings include Node Infra and Cluster Infrastructure.",
      "PUBLIC (Anthropic postmortem, Sep 2025): serving spans AWS Trainium, NVIDIA GPUs and Google TPUs.",
      "INFERRED: staff scope means owning a reliability or scale problem across teams, with numbers.",
    ],
    loop: [
      "POSTED: no LeetCode-style coding; practical problems in your best language.",
      "PUBLIC (Exponent, HelloInterview; reported): recruiter → technical screen → ~4–5 rounds: coding, system design, project deep dive, hiring manager/behavioral, culture/values.",
      "PUBLIC (reported): coding evolves in stages (concurrency, file/data processing, edge cases).",
      "INFERRED: expect follow-ups on failure handling at every stage.",
    ],
    plan: ["Wk1: ch31 lessons + goodput math drills", "Wk2: practical Go/Python: queues, leases, retries (36.1)", "Wk3: design: training scheduler, checkpoint store (drill trainsched)", "Wk4: Kubernetes at scale, incidents, postmortem reading", "Wk5: 3 deep-dive stories with numbers (36.6)", "Wk6: mock loop + values/mission reflection"],
    stories: [
      "Poly driver reliability fix → '[component] failed [rate]; I found [root cause]; fleet failures fell [X%]'.",
      "Cross-team firmware release → 'I aligned [teams] on [decision], shipped to [N devices] without [incident]'.",
      "Debugging a timing race → 'I proved [hypothesis] with [tool], fixed with [change], added [test]'.",
    ],
    ladder: [
      ["L1", "What is job MTBF for N nodes?", "Node MTBF / N."],
      ["L2", "How do you pick the checkpoint interval?", "Young: √(2CM); make C small with async."],
      ["L3", "What breaks in your checkpoint store when the network partitions mid-save?", "Manifest-last commit, retries with idempotent shard keys, fall back to the last valid step."],
      ["L4", "How would you cut restart time from 30 to 3 minutes across the fleet?", "Hot spares, cached images and data, pre-warmed collectives, parallel restore, measured per stage."],
    ],
  },
  gpu: {
    title: "Roblox · Principal SWE, GPU Compute",
    role: [
      "POSTED: GPU platform for training and inference: scheduling, reliability, drivers/firmware, telemetry (XID, ECC, NVLink), BMC/Redfish, Go.",
      "POSTED: $345,040–$399,420 base range listed for the role.",
      "PUBLIC (Roblox blog, Sep 2024): hybrid-cloud inference with KServe/Triton, Ray, vLLM and an ML gateway on 1,000+ GPUs.",
      "PUBLIC (secondary talk summary): YuniKorn queues and bin packing on Kubernetes; confirm before quoting.",
      "INFERRED: principal scope means setting the GPU platform direction, not only running it.",
    ],
    loop: [
      "PUBLIC (Roblox 2022 article, official): senior candidates may get system design or a take-home, then team interviews and a values discussion.",
      "PUBLIC (reported, third-party): ~4×45-minute rounds at IC5+: one coding, two system design, one behavioral.",
      "INFERRED: expect one design round on GPU fleet health or scheduling.",
    ],
    plan: ["Wk1: ch32 lessons; XID/ECC/NVLink vocabulary", "Wk2: Go telemetry parsing practice (36.2)", "Wk3: design drill gpuplatform", "Wk4: Kubernetes GPU scheduling, MIG/MPS, inference serving (ch26)", "Wk5: stories: fleet reliability and influence (36.6)", "Wk6: mock rounds + read the 2024 inference blog"],
    stories: [
      "Poly hardware error handling → 'I classified [error types], cut false RMAs by [X]'.",
      "Firmware rollout → 'I designed staged rollout for [N] devices; caught [issue] at canary'.",
      "Performance tuning → 'I improved [metric] by [X] on [hardware] by [change]'.",
    ],
    ladder: [
      ["L1", "What's XID 79?", "GPU fell off the bus: hardware path."],
      ["L2", "How do you tell app faults from hardware?", "Correlate across jobs and GPUs."],
      ["L3", "How do you return repaired nodes safely?", "Hysteresis + burn-in + repeat-failure tracking."],
      ["L4", "Utilization is 25%. Give me your 12-month plan.", "Waste breakdown, sharing, scheduling, right-sizing, metrics per quarter."],
    ],
  },
  ea: {
    title: "Roblox · Principal SWE, Engineering Acceleration",
    role: [
      "POSTED: source code search and storage, code review, CI, developer productivity metrics, AI for engineering; HashiStack mentioned.",
      "POSTED: $295,250–$345,040 base range listed.",
      "PUBLIC (Roblox tools blog, Feb 2025): code center, P75 time to land, engineering productivity measurement.",
      "PUBLIC: Bazel is not named in the posting or public sources found; say 'a build cache like Bazel's'.",
      "INFERRED: yes, this is build/CI/developer-productivity work, with search and AI tooling as well.",
    ],
    loop: [
      "PUBLIC (official 2022 article and reported IC5+ loops): same as the GPU role above.",
      "INFERRED: expect a design round on CI or developer platform scale.",
    ],
    plan: ["Wk1: ch33 lessons", "Wk2: Go metrics practice: p50/p75 time to land (36.3)", "Wk3: design drill buildci", "Wk4: read Roblox tools posts; AI code tooling evaluation", "Wk5: stories on adoption and influence (36.6)", "Wk6: mock loop"],
    stories: [
      "Poly build/test infrastructure → 'I cut [build/test time] from [X] to [Y] by [change]'.",
      "Tooling adoption → 'I got [N teams] to adopt [tool] by [approach]'.",
      "Flaky HIL tests → 'I separated real bugs from flakes, reduced reruns by [X]'.",
    ],
    ladder: [
      ["L1", "What's a merge queue?", "Tests changes on top of main plus those ahead."],
      ["L2", "How do you size batches?", "(1−p)^B pass chance and bisection cost."],
      ["L3", "Why did cache hit rate fall?", "Non-hermetic inputs: diff action keys."],
      ["L4", "How do you measure productivity without gaming?", "System metrics plus surveys, used for bottlenecks not ranking."],
    ],
  },
  qc: {
    title: "Qualcomm · Senior Staff Engineer (telematics embedded Linux platform)",
    role: [
      "POSTED (match INFERRED): boot/recovery, NAND/eMMC, OTA, MAC, verified boot, disk integrity, FDE, TARA, boot-time and footprint targets, AP–modem fusion over PCIe/USB/Ethernet, Yocto.",
      "POSTED: $169,800–$254,600 range listed for that posting.",
      "INFERRED: the screenshot title matches several San Diego senior staff roles; confirm the requisition with the recruiter.",
      "INFERRED: senior staff scope = platform architecture ownership across hardware, modem and software teams.",
    ],
    loop: [
      "PUBLIC (reported, third-party): recruiter and hiring-manager screens, then 3–5 technical rounds.",
      "PUBLIC (reported): C/C++ and pointers, bit manipulation, OS internals, Linux drivers, concurrency, embedded design, project deep dives.",
      "INFERRED: expect whiteboard C and a platform architecture discussion.",
    ],
    plan: ["Wk1: ch34 lessons", "Wk2: C practice: bitfields, packed headers, CRC (36.4)", "Wk3: design drill telematicsboot", "Wk4: Yocto, verified boot, ISO/SAE 21434 basics", "Wk5: driver stories mapped to platform ownership (36.6)", "Wk6: mock panel"],
    stories: [
      "Poly Linux driver → 'I owned [driver] for [product]; fixed [boot/stability issue]'.",
      "Boot-time work → 'I cut boot from [X] to [Y] s by [change]'.",
      "Secure update → 'I designed [update/recovery path]; no units bricked across [N]'.",
    ],
    ladder: [
      ["L1", "What's an A/B update?", "Two slots; update the inactive one."],
      ["L2", "When is a slot marked successful?", "After a real health check, not just boot."],
      ["L3", "How do you store boot metadata safely?", "Redundant copies with checksums and sequence numbers."],
      ["L4", "Design the key hierarchy and revocation for a 10-year fleet.", "Multiple fused key slots, signed revocation, OTA rotation without bricking."],
    ],
  },
  ms: {
    title: "Microsoft · Member of Technical Staff (Principal), Microsoft Robotics",
    role: [
      "POSTED: VLA models on robots, ROS 2/Nav2, sim-to-real, safe-autonomy boundaries with human-in-the-loop fallback, evaluation gates, ML serving.",
      "POSTED: preferred: safety-critical or human-in-the-loop autonomy; publications, open source or standards.",
      "PUBLIC (Microsoft Research, Jan 2026): Rho-alpha VLA model for bimanual manipulation.",
      "NOTE: no pay range was captured from the posting; check the listing.",
    ],
    loop: [
      "PUBLIC (reported, third-party): principal loops of 4–6 rounds: coding, 1–3 design, project deep dive, leadership.",
      "PUBLIC (reported): a possible final senior interviewer, historically called 'As Appropriate'.",
      "POSTED: Microsoft values (respect, integrity, accountability, growth mindset) appear in the posting.",
    ],
    plan: ["Wk1: ch35 lessons", "Wk2: C++ topic bus with QoS (36.5)", "Wk3: design drill robotplatform", "Wk4: ROS 2 QoS and executors, Nav2 basics; read Rho-alpha posts", "Wk5: leadership stories (36.6)", "Wk6: mock loop"],
    stories: [
      "Poly real-time audio → 'I kept [loop] under [X ms] worst case by [change]'.",
      "Safety limits → 'I designed [limit/guard] that prevented [failure]'.",
      "Qualification gates → 'I defined pass/fail criteria for [product], catching [issue]'.",
    ],
    ladder: [
      ["L1", "Why action chunks?", "Model slower than control rate."],
      ["L2", "How do you guard a learned policy?", "Simplex envelope and fallback."],
      ["L3", "How do you know a policy is better?", "Intervals, per-task, safety gate."],
      ["L4", "How would you run evaluation across 50 robots at 3 sites?", "Versioned suites, paired trials, auto success detection with audits."],
    ],
  },
};

function Playbook({ k }) {
  const p = PB[k];
  const [tab, setTab] = useState("role");
  const [done, setDone] = useState(() => p.plan.map(() => false));
  const n = done.filter(Boolean).length;
  const list = (xs) => h("ul", { className: "sim-list" }, xs.map((x, i) => h("li", { key: i }, x)));
  const body = tab === "role" ? list(p.role) : tab === "loop" ? list(p.loop) : tab === "stories" ? list(p.stories)
    : tab === "ladder" ? h("dl", { className: "sim-kv" }, p.ladder.map(([lv, q, a]) => [h("dt", { key: lv + "q" }, `${lv} · ${q}`), h("dd", { key: lv + "a" }, a)]))
    : h("div", null, p.plan.map((w, i) => h(Toggle, { key: i, label: w, value: done[i], onChange: (v) => setDone(done.map((d, j) => (j === i ? v : d))) })));
  return h("div", null,
    h("p", { className: "sim-note" }, p.title + ". Every line is labelled POSTED, PUBLIC or INFERRED; see new-jobs-oct12-research.md for links."),
    h(Choice, { label: "Section", value: tab, onChange: setTab, options: [{ v: "role", l: "Role" }, { v: "loop", l: "Interview loop" }, { v: "plan", l: "6-week plan" }, { v: "stories", l: "Story mapping" }, { v: "ladder", l: "Question ladder" }] }),
    body,
    h(Bar, { label: "Prep plan progress", value: (n / p.plan.length) * 100, tone: n === p.plan.length ? "good" : "warn", text: `${n} of ${p.plan.length} weeks` }),
    h(Verdict, { ok: n === p.plan.length },
      n === p.plan.length ? tl("Every week of the plan is done. Book a mock interview.", "prep plan complete")
      : tl(`Next up: ${p.plan[n === 0 ? 0 : done.indexOf(false)]}. Tick weeks off on the plan tab.`, `${p.plan.length - n} weeks left`)));
}

// STAR bank: 10 staff/principal prompts with placeholder templates. No achievements are invented.
export const STAR = [
  ["Ambiguous problem you scoped", "S: [team/product] had [vague problem]. T: I owned turning it into a plan. A: I measured [baseline], wrote options [A/B], aligned [people]. R: [metric] moved from [X] to [Y]."],
  ["Technical decision you drove across teams", "S: [teams] disagreed on [choice]. T: decide by [date]. A: design doc, data from [experiment], review. R: adopted by [N teams]; [outcome]."],
  ["Production incident you led", "S: [system] failed affecting [scope]. T: restore and prevent. A: [mitigation], root cause [X], fix [Y]. R: [time to recover], [recurrence prevented]."],
  ["Reliability you improved with numbers", "S: [failure rate]. T: cut it. A: [instrumentation], [fix]. R: [X → Y] over [period]."],
  ["Mentoring or raising the bar", "S: [engineer/team] needed [skill]. A: [pairing/reviews/docs]. R: [their result]."],
  ["Disagreeing with a senior leader", "S: [leader] wanted [plan]. A: I showed [data/risk], proposed [alternative]. R: [decision], [what you learned]."],
  ["A failure you owned", "S: [what went wrong]. A: [your part], [how you fixed it]. R: [change you made to avoid repeats]."],
  ["Trading speed for quality", "S: deadline [X], risk [Y]. A: [what you cut/kept and why]. R: [ship result], [follow-up]."],
  ["Influencing without authority", "S: needed [team] to do [thing]. A: [found their pain], [pilot], [metrics]. R: [adoption]."],
  ["Long-term technical direction", "S: [platform] would hit [limit] in [time]. A: [roadmap], [milestones], [buy-in]. R: [progress so far]."],
];

function StarBank() {
  const [i, setI] = useState("0"), [s, setS] = useState(false), [num, setNum] = useState(false), [scope, setScope] = useState(false), [you, setYou] = useState(false), [learn, setLearn] = useState(false);
  const score = [s, num, scope, you, learn].filter(Boolean).length;
  const [t, tpl] = STAR[Number(i)];
  return h("div", null,
    h("p", { className: "sim-note" }, "Pick a prompt, draft your answer from your own experience using the template, then tick the checks your draft meets. Brackets are placeholders: fill them with real facts only."),
    h(Choice, { label: "Prompt", value: i, onChange: setI, options: STAR.map(([title], j) => ({ v: String(j), l: `${j + 1}. ${title}` })) }),
    h("dl", { className: "sim-kv" }, h("dt", null, t), h("dd", null, tpl)),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Situation in 2 sentences", value: s, onChange: setS }),
      h(Toggle, { label: "A real number in the result", value: num, onChange: setNum }),
      h(Toggle, { label: "Scope beyond your own team", value: scope, onChange: setScope }),
      h(Toggle, { label: "'I' for your actions, not 'we'", value: you, onChange: setYou }),
      h(Toggle, { label: "What you'd do differently", value: learn, onChange: setLearn })),
    h(Bar, { label: "Staff-level story checklist", value: score * 20, tone: score === 5 ? "good" : score >= 3 ? "warn" : "bad", text: `${score} of 5` }),
    h(Verdict, { ok: score === 5 },
      score === 5 ? tl("This story is ready to tell at staff level.", "STAR with scope, numbers and reflection")
      : !num ? tl("Add a real number, such as time saved or failures avoided.", "no quantified result")
      : !scope ? tl("Show how the work reached beyond your own team.", "scope too narrow for staff")
      : tl("A few checks are still missing. Tighten the draft.", `${5 - score} checks missing`)));
}

const mk = (k, title, goal) => ({ title, goal, C: () => h(Playbook, { k }) });
export const SIMS36 = {
  playbook_ant: mk("ant", "Anthropic Staff+ Infrastructure playbook", "Know the role, the reported loop and your plan; finish all six prep weeks."),
  playbook_gpu: mk("gpu", "Roblox GPU Compute playbook", "Know the role, the reported loop and your plan; finish all six prep weeks."),
  playbook_ea: mk("ea", "Roblox Engineering Acceleration playbook", "Know the role, the reported loop and your plan; finish all six prep weeks."),
  playbook_qc: mk("qc", "Qualcomm telematics platform playbook", "Know the role, the reported loop and your plan; finish all six prep weeks."),
  playbook_ms: mk("ms", "Microsoft Robotics MTS playbook", "Know the role, the reported loop and your plan; finish all six prep weeks."),
  starbank: { title: "Staff-level story bank", goal: "Draft each story from your real experience until it passes all five checks.", C: StarBank },
};
