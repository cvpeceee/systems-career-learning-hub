import { chapter } from "../helpers.js";
import { L36 } from "./ch36l.js";
import { STAR } from "../sims/s36.jsx";

export const CH36 = chapter({
  id: "role-playbooks", number: 36, title: "High-Profile Role Playbooks: Anthropic, Roblox ×2, Qualcomm, Microsoft & the Staff-Level Story Bank", shortTitle: "Role Playbooks",
  duration: "6–8 hours (plus the 6-week plans)", leverage: false,
  promise: "For each of the five roles: what it really is, what the loop is reported to look like (with labels), a 6-week plan, one coding practice in that company's reported style, and a story bank built only from your real experience.",
  diagram: "flow", flowStages: ["read", "verify", "practise", "design", "stories", "mock"],
  captions: [
    "Read the posting closely (POSTED).",
    "Check public sources and label each claim (PUBLIC, INFERRED).",
    "Practise one coding problem in the reported style (practical coding).",
    "Rehearse the design drill for the role (staff-level design).",
    "Draft stories from real experience (STAR, depth ladder).",
    "Run a full mock loop (timing, feedback).",
  ],
  phases: [
    { label: "Infra", title: "Anthropic", detail: "Practical coding: leased job queue.", lessons: [0] },
    { label: "Roblox", title: "GPU Compute and Engineering Acceleration", detail: "Telemetry triage; time-to-land percentiles.", lessons: [1, 2] },
    { label: "Embedded", title: "Qualcomm", detail: "Bitfields, portable headers, CRC-32.", lessons: [3] },
    { label: "Robotics", title: "Microsoft", detail: "Topic bus with QoS.", lessons: [4] },
    { label: "Stories", title: "All five", detail: "STAR bank, depth ladders, honest impact numbers.", lessons: [5] },
  ],
  lessons: [...L36],
  lab: {
    title: "Capstone: your five-role application pack",
    brief: "Assemble everything you need for the five loops in one private document. Nothing here is sent anywhere.",
    steps: [
      "Per role: one paragraph on why you fit, citing the posting (POSTED)",
      "Per role: the reported loop and the questions you'll ask the recruiter to confirm it",
      "Your 6-week calendar merging the five plans",
      "Eight to ten STAR stories with real numbers, each mapped to roles",
      "One mock interview per role, with notes",
    ],
    doneWhen: "Every claim about a company is labelled, and every story uses only real facts.",
    starterLang: "Markdown · personal prep pack",
    starter: `# Prep pack (private)
## Anthropic
## Roblox GPU Compute
## Roblox Engineering Acceleration
## Qualcomm
## Microsoft Robotics
## Calendar
## Story bank`,
  },
  quiz: [
    { prompt: "Anthropic's coding interviews are described in its application form as…", options: ["LeetCode-style", "Practical, in your best language", "Take-home only", "Pair programming in Rust"], answer: 1, explanation: "POSTED on the application form." },
    { prompt: "For the Anthropic role, team placement happens…", options: ["Before applying", "After the interview process", "At the recruiter call", "Never"], answer: 1, explanation: "POSTED." },
    { prompt: "Is Roblox Engineering Acceleration build/CI work?", options: ["No, it's ML research", "Yes, plus search, storage, review, metrics and AI tooling", "Only Jenkins", "Only security"], answer: 1, explanation: "POSTED scope." },
    { prompt: "Which claim about Roblox needs care?", options: ["They track P75 time to land", "They use Bazel", "They run GPU inference", "They hire principals"], answer: 1, explanation: "No public source found for Bazel." },
    { prompt: "Why avoid packed structs for wire formats?", options: ["They're slow", "Layout is implementation-defined", "They use more memory", "They're C++ only"], answer: 1, explanation: "Write bytes explicitly." },
    { prompt: "In a reliable QoS bus, a full queue should…", options: ["Drop the oldest", "Apply backpressure", "Crash", "Drop the newest"], answer: 1, explanation: "Never drop for reliable subscribers." },
    { prompt: "Scenario: you can't remember the exact number for a past result. In a STAR story you…", options: ["Estimate high", "Say what you know, how you measured, and the uncertainty", "Invent a round number", "Skip the result"], answer: 1, explanation: "Never invent; be precise about uncertainty.", scenario: true },
    { prompt: "Scenario: your bootstrap interval for a claimed improvement includes zero. You say…", options: ["It improved a lot", "The improvement isn't established; here's what more data would show", "Nothing", "Change the data"], answer: 1, explanation: "Honesty is a staff signal.", scenario: true },
  ],
  interviewRoom: {
    title: "Staff-level behavioral bank: 10 STAR prompts",
    intro: "Ten prompts reported as common in staff and principal behavioral and leadership rounds. Each answer below is a TEMPLATE: the brackets are placeholders to fill only with your real experience. None of Chandra's achievements are assumed or invented.",
    questions: STAR.map(([t, tpl]) => ({ prompt: `Behavioral · Tell me about: ${t.toLowerCase()}.`, answer: `Template: ${tpl}` })),
    tasks: [
      { title: "30 minutes · Story drafting", prompt: "Draft three stories from the bank with real facts, two minutes each when spoken.", rubric: ["Situation ≤ 2 sentences", "'I' actions", "A real number", "Scope beyond your team", "Reflection"] },
      { title: "20 minutes · Depth ladder", prompt: "For one story, write and answer four follow-ups, each one level deeper.", rubric: ["L1 facts", "L2 reasoning", "L3 setbacks", "L4 staff-level reflection"] },
      { title: "15 minutes · Impact evidence", prompt: "Use the bootstrap tool on before/after data you really have and state the result honestly.", rubric: ["Correct resampling", "Interval reported", "Honest conclusion"] },
    ],
  },
});
