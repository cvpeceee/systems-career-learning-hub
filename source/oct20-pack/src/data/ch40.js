import { chapter } from "../helpers.js";
import { L40 } from "./ch40l.js";

export const CH40 = chapter({
  id: "product-backends-agents", number: 40, title: "Product Backends & AI Agents: Async Order Pipelines, Privacy by Design & Production Agent Automation", shortTitle: "Backends & Agents",
  duration: "7–9 hours", leverage: false,
  promise: "Build backends that never lose or duplicate an order, enforce privacy rules in code rather than documents, and put AI agents into production with guarded tools and release gates.",
  diagram: "flow", flowStages: ["commit", "publish", "compensate", "consent", "gate", "evaluate"],
  captions: [
    "Save the change and its message in one transaction (outbox).",
    "Send messages later and safely retry (at-least-once, idempotent).",
    "Undo earlier steps in reverse if a later one fails (saga).",
    "Check what each person agreed to, at the moment of use (consent ledger).",
    "Validate, approve and de-duplicate every agent tool call (tool gate).",
    "Ship agent changes only if test scores don't regress (eval gate).",
  ],
  phases: [
    { label: "Pipelines", title: "Never lose an order", detail: "Outbox, idempotent consumers, sagas.", lessons: [0] },
    { label: "Privacy", title: "Rules as code", detail: "Consent, purpose, retention, residency.", lessons: [1] },
    { label: "Agents", title: "Agents in production", detail: "MCP tools, approvals, idempotency, evals.", lessons: [2] },
  ],
  lessons: [...L40],
  lab: {
    title: "Capstone: an AI-assisted order support service",
    brief: "Design a service where customers place orders and an agent helps support staff resolve problems, with privacy controls throughout.",
    steps: [
      "Order state machine, outbox and idempotent consumers",
      "Saga for cancellation and refund, with the non-reversible step placed last",
      "Consent and retention for support conversations; residency for EU customers",
      "Agent tools on an MCP server with risk tiers, approvals and idempotency keys",
      "Eval set categories, the ship gate, and the adoption metrics you'll query",
    ],
    doneWhen: "Every external effect is idempotent, every personal-data use has a purpose check, and every agent release passes a gate.",
    starterLang: "Markdown · design doc",
    starter: `# Order support service
## Orders: states, outbox, consumers
## Cancellation saga
## Privacy: consent, retention, residency
## Agent tools and gates
## Evals and metrics`,
  },
  quiz: [
    { prompt: "The outbox pattern writes the event…", options: ["After the transaction", "In the same transaction as the data change", "To a log file", "Only on success of the consumer"], answer: 1, explanation: "One commit, no dual write." },
    { prompt: "Outbox relays deliver…", options: ["Exactly once", "At least once", "At most once", "Never"], answer: 1, explanation: "So consumers dedupe." },
    { prompt: "In a saga, compensations run…", options: ["In the same order", "In reverse order of completed steps", "Randomly", "Only for the failed step"], answer: 1, explanation: "Undo the latest first." },
    { prompt: "A user has no consent record for 'marketing'. Default?", options: ["Allow", "Deny", "Ask the model", "Allow once"], answer: 1, explanation: "Default deny." },
    { prompt: "MCP by itself provides…", options: ["Authorization", "A protocol describing tools, resources and prompts", "Human approval", "Idempotency"], answer: 1, explanation: "Policy is the host's job." },
    { prompt: "An agent release improves overall score but worsens the prompt-injection category. Ship?", options: ["Yes", "No: safety regression", "Only on Fridays", "Ship and watch"], answer: 1, explanation: "Gate on safety categories." },
    { prompt: "Scenario: customers are charged but orders never schedule after deploys. Fix?", options: ["Retry payments", "Transactional outbox + idempotent planner", "Bigger pods", "Disable deploys"], answer: 1, explanation: "Dual-write crash window.", scenario: true },
    { prompt: "Scenario: an agent sends the same email twice after a timeout. Fix?", options: ["Longer timeout", "Idempotency keys on side-effecting tools", "Fewer tools", "Higher temperature"], answer: 1, explanation: "Retries must not repeat effects.", scenario: true },
  ],
  interviewRoom: {
    title: "Product backend and agent interview room",
    intro: "Modelled on Wing's Senior Backend SWE (POSTED), Osano's Senior SWE, Full Stack (POSTED via mirror), Google's Senior AI Solution Builder (POSTED) and Genesys's AI CX Agent Principal SWE (POSTED via Dice mirror). Genesys's posting describes its process as a recruiter Zoom call, then the hiring manager and team, usually no more than five interviews (POSTED). The other loops are INFERRED; see the 06 company pages.",
    questions: [
      { prompt: "Backend · Design the order and dispatch backend for drone delivery.", answer: "State machine, idempotency keys, outbox + relay, idempotent consumers, orchestrated saga with compensations, launch last, stuck-state alerts, schema with constraints." },
      { prompt: "Backend · How do you migrate a hot table's schema with no downtime?", answer: "Expand/contract: add nullable column, dual-write, backfill in batches, switch reads behind a flag, stop old writes, drop the old column later; watch locks and replication lag." },
      { prompt: "Privacy · Design consent storage and checks for a SaaS used in the EU and US.", answer: "Append-only ledger per subject/purpose, latest wins, default deny, check at use, policy versions, audit trail, residency at write, retention sweeps, DSAR via a data map." },
      { prompt: "Agents · How do you take an agent from prototype to production?", answer: "Tool schemas via MCP, risk tiers with approval, idempotency keys, audit logs, RAG grounding with citations, eval harness with safety categories and a regression gate, pilot rollout, impact metrics." },
      { prompt: "Agents · How do you defend against prompt injection in tool results?", answer: "Treat tool output as data, not instructions; least-privilege tools; approval for risky actions; content isolation and filtering; injection cases in evals; monitor for unusual tool sequences." },
    ],
    tasks: [
      { title: "30 minutes · Outbox and consumer", prompt: "Implement order creation with an outbox, a relay that retries, and an idempotent consumer; show crash safety.", rubric: ["Same-transaction write", "Retry keeps order", "Dedupe by event ID", "Tests for crash points"] },
      { title: "25 minutes · Consent ledger", prompt: "Append-only consent events; Allowed(subject, purpose, at) with default deny.", rubric: ["Latest event wins", "Point-in-time queries", "Default deny", "Tests for withdrawal"] },
      { title: "30 minutes · Tool gate", prompt: "Validate agent tool calls against schemas, require approval for risky tools and dedupe by idempotency key.", rubric: ["Rejects unknown tools and args", "Approval tier", "Idempotent", "Audit log"] },
    ],
  },
});
