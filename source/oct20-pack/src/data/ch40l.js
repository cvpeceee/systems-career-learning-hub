import { jobs } from "./jobs.js";
import { LNgo } from "../helpers.js";

export const L40 = [
{
  title: "Asynchronous order pipelines: the transactional outbox, idempotent consumers and sagas with compensation",
  sim: "outbox",
  snippet: "lesson_40_1.go",
  jobs: jobs(["wing", "POSTED: 'Design and build solutions that utilize asynchronous pipelines, database systems, RPC handlers'; 'database schema design, and synchronous/asynchronous systems'; on-call root causing."], ["genesys", "POSTED: microservices and RESTful API design on AWS."], ["osano", "POSTED: data modeling, API design, event-driven architectures (nice-to-have)."]),
  concept: "A delivery order touches many systems: the order database, payment, a flight planner that reserves an aircraft and airspace, and partner notifications. The classic bug is the **dual write**: the service commits the order to its database, then publishes an \"order created\" event to a queue. If it crashes in between, the order exists but nobody hears about it. If it publishes first and the commit fails, everyone hears about an order that doesn't exist. **Transactional outbox**: in the *same* database transaction as the order, insert a row into an **outbox** table. A separate **relay** reads unpublished outbox rows, publishes them, and marks them sent. The commit is now the single source of truth. The relay can crash and retry, so delivery is **at least once**, which means **consumers must be idempotent**: record processed event IDs (in the same transaction as their own effect) and skip duplicates. Change-data-capture tools such as Debezium implement the relay by tailing the database log. **Sagas** handle workflows that span services, where no single transaction is possible. Each step has a **compensation** (reserve aircraft ↔ release aircraft; charge ↔ refund). If step k fails, run the compensations for steps k−1 … 1 in reverse. Compensations must themselves be idempotent and retryable, and some steps can't be undone (a drone already launched), so put those **last**. Workflow engines (Temporal, AWS Step Functions) persist saga state so it survives restarts. **Schema design** supports all of this: an order state machine (CREATED → PAID → SCHEDULED → IN_FLIGHT → DELIVERED / CANCELLED) with valid transitions enforced in code and constraints, plus an idempotency key on every external request (see 06 c28).",
  analogy: "A restaurant writes each order on a ticket and pins it to the rail in the same motion. A runner takes tickets from the rail to the kitchen; if a ticket is delivered twice, the kitchen recognises the number and ignores the copy. If the dessert can't be made, the waiter undoes the earlier steps in reverse: cancels the main, then refunds the starter.",
  language: "Go 1.22+ · outbox written in the same transaction, a retrying relay, an idempotent consumer, and a saga runner with reverse compensation",
  primer: {
    text: "When one action must update a database and tell other systems, crashes in between cause lost or phantom orders. The fix is to save the message in the same database transaction and send it later, safely retrying. Multi-step workflows across services undo earlier steps if a later step fails. This lesson builds both patterns.",
    terms: [
      ["Dual write", "Writing to two systems (database and queue) separately, which can leave them inconsistent after a crash."],
      ["Transactional outbox", "Saving outgoing events in a table in the same transaction as the data change, then publishing them later."],
      ["At-least-once delivery", "Every message is delivered, but possibly more than once."],
      ["Idempotent consumer", "A receiver that produces the same result if it gets the same message twice."],
      ["Saga", "A multi-step workflow across services where each step has an undo (compensation)."],
      ["Compensation", "An action that reverses an earlier step, such as a refund for a charge."],
    ],
  },
  lines: LNgo(`
package orders

import "errors"

type Event struct {
    ID      string
    Payload string
    Sent    bool
}

// DB stands in for a relational database; Tx applies all changes or none.
type DB struct {
    Orders map[string]string
    Outbox []*Event
}

func (db *DB) CreateOrder(id, status string, fail bool) error {
    // BEGIN
    if fail {
        return errors.New("rollback") //@ Neither the order nor its event is written: no lost or phantom events.
    }
    db.Orders[id] = status
    db.Outbox = append(db.Outbox, &Event{ID: "order-created-" + id, Payload: id})
    // COMMIT: order and outbox row together
    return nil
}

// Relay publishes unsent outbox rows. publish may fail; rows stay unsent and are retried next run.
func (db *DB) Relay(publish func(Event) error) int {
    n := 0
    for _, e := range db.Outbox {
        if e.Sent {
            continue
        }
        if err := publish(*e); err != nil {
            return n //@ Stop and retry later; order is preserved.
        }
        e.Sent = true //@ A crash before this line means a re-publish: consumers must dedupe.
        n++
    }
    return n
}

// Consumer applies each event once, even if delivered many times.
type Consumer struct {
    Seen    map[string]bool
    Applied int
}

func (c *Consumer) Handle(e Event) {
    if c.Seen[e.ID] {
        return //@ In a real service, record the ID in the same transaction as the effect.
    }
    c.Seen[e.ID] = true
    c.Applied++
}

type Step struct {
    Name       string
    Do         func() error
    Compensate func()
}

// RunSaga runs steps in order; on failure, compensates completed steps in reverse.
func RunSaga(steps []Step) (done []string, undone []string, err error) {
    for i, s := range steps {
        if err = s.Do(); err != nil {
            for j := i - 1; j >= 0; j-- {
                steps[j].Compensate() //@ Reverse order: release the aircraft before refunding the payment it depended on.
                undone = append(undone, steps[j].Name)
            }
            return done, undone, err
        }
        done = append(done, s.Name)
    }
    return done, nil, nil
}
`),
  storyLesson: {
    scenarioTitle: "Orders that paid but never flew",
    scenario: "A few times a week, a customer is charged for a drone delivery that is never scheduled. Logs show the order committed, then the service restarted during a deploy before publishing the event to the flight planner.",
    sections: [
      { title: "1 · The dual write", body: "Commit then publish has a crash window. Deploys restart pods often enough that the window is hit every week." },
      { title: "2 · Outbox", body: "The order and an outbox row are written in one transaction. A relay publishes unsent rows and marks them sent. A crash means a re-publish, never a loss." },
      { title: "3 · Idempotent planner", body: "The flight planner records each event ID with its reservation in one transaction, so duplicates do nothing. Duplicate deliveries are now harmless and visible in metrics." },
      { title: "4 · Saga for cancellations", body: "If airspace isn't available, the saga releases the aircraft reservation and then refunds the payment. Launch, which can't be undone, is the last step and happens only after every reversible step succeeds." },
    ],
    checkpoint: { prompt: "The relay crashes after publishing an event but before marking it sent. What happens, and why is it safe?", answer: "It publishes the event again after restart. It's safe because consumers dedupe by event ID." },
    lab: { title: "Inject crashes", brief: "Use the code to show each crash point is safe.", steps: ["Create orders with one failing transaction and check no event exists for it", "Make publish fail on the second event, run Relay twice, and check order", "Deliver every event twice to the consumer and check Applied", "Run a 3-step saga where step 3 fails and print the compensation order", "Explain where a non-reversible step must go"], doneWhen: "No order is lost or duplicated in effect, and compensations run in reverse." },
  },
  exercise: "Design the backend for creating a drone delivery: order, payment, aircraft reservation, partner notification. What guarantees do you give and how?",
  answerHint: "State machine, outbox, at-least-once, idempotency, saga, non-reversible step last, observability.",
  expected: ["outbox", "idempotent", "saga", "compensation", "state machine", "at-least-once"],
  modelAnswer: "Model the order as a state machine with enforced transitions and an idempotency key per client request. Write the order and an outbox row in one transaction, and let a relay or CDC publish events with at-least-once delivery. Every consumer is idempotent, recording event IDs with its own effect. The cross-service workflow is a saga: charge, reserve aircraft, reserve airspace, notify partner, then launch. Each reversible step has a compensation run in reverse on failure, and launch comes last because it can't be undone. Saga state is persisted in a workflow engine, with metrics on stuck states and duplicate deliveries.",
  pitfalls: [
    "Commit-then-publish dual writes.",
    "Assuming exactly-once delivery from the queue.",
    "Compensations that aren't idempotent.",
    "Irreversible steps early in a saga.",
  ],
  probes: [
    ["L1 · What problem does the outbox solve?", "Keeping the database change and the event consistent across crashes."],
    ["L2 · Why are consumers required to be idempotent?", "The relay delivers at least once; duplicates must not repeat effects."],
    ["L3 · Choreography vs orchestration for sagas?", "Choreography: services react to events (loose, hard to see the whole flow). Orchestration: a coordinator drives steps (visible, one place to persist state). Orchestrate when steps and compensations are many."],
    ["L4 · How do you find orders stuck in a state?", "Per-state age metrics and alerts, a sweeper that re-drives or escalates, and trace IDs carried in events so a stuck order's history is one query."],
  ],
  poly: "Device provisioning flows (register, assign room, push config, confirm) fail halfway in the field. The same outbox and compensation thinking applies to your cloud-connected devices.",
  why: "Wing's backend posting names asynchronous pipelines, database schema design and sync/async systems. Outbox, idempotency and sagas are the core patterns interviewers probe.",
  companies: ["Wing", "Uber", "Stripe", "Amazon", "DoorDash"],
  myth: { myth: "Our queue guarantees exactly-once, so duplicates can't happen.", reality: "End-to-end exactly-once needs idempotent consumers; retries and crashes cause redelivery." },
  interviewTip: "Draw the crash window in commit-then-publish before proposing the outbox. Showing the bug first makes the fix land.",
},
{
  title: "Privacy by design: consent ledgers, purpose-based access, retention and data residency",
  sim: "privacy",
  snippet: "lesson_40_2.go",
  jobs: jobs(["osano", "POSTED: 'Apply data minimization, residency, retention and access controls to the systems you design, especially those that handle customer and personal data'; GDPR, CCPA, SOC 2."], ["wing", "POSTED: 'a privacy and security conscious ecosystem'."], ["truist", "POSTED: compliance with regulatory requirements; redaction in telemetry."]),
  concept: "Privacy laws in Europe (**GDPR**) and California (**CCPA**) turn into concrete system requirements. **Consent** is a record, not a checkbox: who agreed to what **purpose** (analytics, marketing, personalisation), when, under which policy version, and when they withdrew. Store it as an **append-only ledger** and take the latest entry per (subject, purpose). That gives you an audit trail for free. **Purpose limitation**: every data access names a purpose, and the check is \"does this subject currently consent to (or is there another lawful basis for) this purpose?\" **Data minimization**: collect only what a purpose needs, and drop or pseudonymize the rest early. **Retention**: each data category has a retention period, and a scheduled job deletes or anonymizes expired records, including derived copies, caches, search indexes and backups (backups usually expire on their own schedule). **Data subject requests (DSARs)**: users may ask for a copy of their data or its deletion (GDPR generally allows one month to respond). This only works if you keep a **data map** of where each subject's data lives. **Residency**: some customers require data to stay in a region. Enforce it at write time (reject or route), not by policy documents. Osano sells consent and privacy tooling, so for them these aren't side concerns; they are the product. One more rule from the posting: customer and personal data stays out of AI tools except through approved, privacy-safe paths.",
  analogy: "A library that records every permission slip, lends each book only for the reason on the slip, shreds old records on schedule, and keeps the Paris branch's records in Paris.",
  language: "Go 1.22+ · append-only consent ledger, purpose checks, retention sweep, and a residency guard on writes",
  primer: {
    text: "Privacy laws say people control how their data is used. In code that means recording what each person agreed to, checking it on every use, deleting data on schedule, and keeping some data inside a region. This lesson builds those four checks.",
    terms: [
      ["GDPR / CCPA", "EU and California privacy laws that give people rights over their personal data."],
      ["Consent", "A person's recorded agreement to a specific use (purpose) of their data, which they can withdraw."],
      ["Purpose limitation", "Using data only for the purposes it was collected and agreed for."],
      ["Data minimization", "Collecting and keeping only the data a purpose actually needs."],
      ["Retention period", "How long a kind of data may be kept before it must be deleted or anonymized."],
      ["DSAR", "Data subject access request: a person asking for a copy of their data, or its deletion."],
      ["Data residency", "A requirement that data is stored and processed in a particular region."],
    ],
  },
  lines: LNgo(`
package privacy

import (
    "errors"
    "time"
)

type ConsentEvent struct {
    Subject, Purpose string
    Granted          bool
    At               time.Time
    PolicyVersion    string
}

// Ledger is append-only: history is the audit trail; the latest event per (subject, purpose) wins.
type Ledger struct{ events []ConsentEvent }

func (l *Ledger) Record(e ConsentEvent) { l.events = append(l.events, e) }

func (l *Ledger) Allowed(subject, purpose string, at time.Time) bool {
    allowed := false
    var latest time.Time
    for _, e := range l.events {
        if e.Subject == subject && e.Purpose == purpose && !e.At.After(at) && !e.At.Before(latest) {
            allowed, latest = e.Granted, e.At //@ Withdrawal is just a later event with Granted = false.
        }
    }
    return allowed //@ No record means no consent: default deny.
}

type Record struct {
    Subject, Category, Region string
    Created                   time.Time
}

// Expired returns records past their category's retention; unknown categories are flagged, not kept forever.
func Expired(rs []Record, retention map[string]time.Duration, now time.Time) (del []Record, unknown []string) {
    for _, r := range rs {
        d, ok := retention[r.Category]
        if !ok {
            unknown = append(unknown, r.Category) //@ Data with no retention rule is a compliance bug to fix, not a default.
            continue
        }
        if now.Sub(r.Created) > d {
            del = append(del, r)
        }
    }
    return del, unknown
}

var ErrResidency = errors.New("write violates data residency")

// GuardWrite enforces residency at write time: the record's region must be allowed for this tenant.
func GuardWrite(r Record, tenantRegions map[string]bool) error {
    if !tenantRegions[r.Region] {
        return ErrResidency
    }
    return nil
}
`),
  storyLesson: {
    scenarioTitle: "The marketing email after an opt-out",
    scenario: "A user withdraws marketing consent on Monday. On Wednesday they receive a campaign email. The campaign tool read a nightly copy of a 'consented=true' column that had been overwritten, not appended.",
    sections: [
      { title: "1 · The data model", body: "A single boolean per user lost history and timing. The consent store becomes an append-only ledger; the latest event per (subject, purpose) is the current state, and every change is auditable." },
      { title: "2 · Check at use", body: "The email service calls Allowed(subject, 'marketing', now) right before sending, not from a stale copy. No record means no send." },
      { title: "3 · Retention and copies", body: "The campaign tool's nightly copy had no retention rule. The sweeper now flags data categories without a rule, and copies expire within a day." },
      { title: "4 · Proving it", body: "For a regulator or a SOC 2 auditor, the ledger shows when consent changed and the send logs show each check, so the fix is demonstrable, not just claimed." },
    ],
    checkpoint: { prompt: "Why store consent as an append-only ledger rather than a boolean column?", answer: "It keeps history and timing, so you can prove what was allowed at any moment and withdrawal is just a newer event." },
    lab: { title: "Run a DSAR end to end", brief: "Model a user's data across three stores and handle access and deletion requests.", steps: ["Create records for one subject in orders, analytics and support stores", "Record consent grant and withdrawal for analytics", "Answer an access request listing all records with categories", "Run a deletion and the retention sweep; show what remains and why (legal hold, backups)", "Attempt an EU-only tenant write to a US region and show it is rejected"], doneWhen: "Every record is either returned, deleted, or kept with a written reason." },
  },
  exercise: "You're designing a new feature that stores user activity for personalisation in a B2B SaaS used by EU and US customers. Walk through the privacy design.",
  answerHint: "Purpose, consent, minimization, retention, residency, DSAR, audit, AI tools.",
  expected: ["purpose", "consent", "minimization", "retention", "residency", "audit"],
  modelAnswer: "State the purpose (personalisation) and check consent or another lawful basis for it on every use, with consent stored as an append-only ledger and default deny. Apply data minimization: store only the fields personalisation needs, pseudonymized. Set a retention period per data category, with a sweeper that also covers copies and indexes. Enforce residency at write time so EU tenants' data stays in EU regions. Keep a data map so DSAR access and deletion can be answered within deadlines. Keep audit logs of consent changes and checks, and keep personal data out of AI tools except approved paths.",
  pitfalls: [
    "A single 'consented' boolean with no history.",
    "Checking consent from a stale copy instead of at use.",
    "Retention rules that ignore copies, caches and indexes.",
    "Residency enforced by documentation instead of code.",
  ],
  probes: [
    ["L1 · What is purpose limitation?", "Using data only for purposes it was collected and agreed for."],
    ["L2 · How do you handle a deletion request?", "Find the subject's data via the data map, delete or anonymize in every store and copy, record the request and outcome, and let backups age out on schedule."],
    ["L3 · Pseudonymization vs anonymization?", "Pseudonymized data can be re-linked with a key and is still personal data; anonymized data can't reasonably be re-identified."],
    ["L4 · How would you make privacy rules testable in CI?", "Tag schemas with data categories and purposes, lint for untagged fields, test retention jobs, and add contract tests that forbid personal fields in logs and telemetry."],
  ],
  poly: "Conference devices capture voices and faces; you've likely handled rules about what may leave the device. Privacy by design is that thinking applied to every table and API.",
  why: "Osano's posting asks for data minimization, residency, retention and access controls in your own designs; it's a privacy company, so this is the product.",
  companies: ["Osano", "OneTrust", "Google", "Apple", "Stripe"],
  myth: { myth: "Privacy is the legal team's job.", reality: "Laws become schemas, checks and deletion jobs; engineers decide whether they actually work." },
  interviewTip: "Say 'default deny' and 'check at use' early. They're the two properties most consent bugs violate.",
},
{
  title: "Production agent automation: MCP tool servers, human-in-the-loop gates and evaluation harnesses",
  sim: "agentgate",
  snippet: "lesson_40_3.go",
  jobs: jobs(["aisb", "POSTED: 'Build, test, and iterate on AI agents, custom tools, and automated pipelines using … ADK, LangChain, and Model Context Protocol (MCP)'; 'logging, observability, security controls, and human-in-the-loop checkpoints'; 'Establish evaluation frameworks to ensure AI safety and performance standards'."], ["genesys", "POSTED: 'agentic AI development, including hands-on experience with RAG, RAG pipelines and MCP framework'; 'system prompt engineering and tool use configuration and tuning'; Go backends."]),
  concept: "Core lessons 6.1–6.3 introduce agents, MCP and evals. This lesson is the production version both postings ask for. **MCP (Model Context Protocol)** is an open protocol: an **MCP server** exposes **tools** (functions with JSON-schema inputs), **resources** and **prompts**, and an **MCP client** inside the agent host calls them. Because the protocol only *describes* capabilities, the host and server still enforce **authorization**, **validation** and **side-effect control**. A production tool layer has four checks before any tool runs. (1) **Schema validation**: required arguments are present and typed, and unknown arguments are rejected. (2) **Risk tier**: read-only tools run freely, while tools that write, send or spend need a **human-in-the-loop approval** unless policy allows them. (3) **Idempotency keys** for side-effecting tools, so an agent retry doesn't send two emails or create two tickets. (4) **Audit log** of every call with inputs, decision and result. **RAG grounding** (ch5) applies to answers: cite retrieved sources and refuse when retrieval finds nothing relevant. **Evaluation** decides whether a change ships. Keep a **test set** of real tasks with expected outcomes, grouped by category (happy path, ambiguous, adversarial/prompt injection, should-refuse). Score each run, compare with the baseline, and **gate** the release on overall pass rate *and* no regression in safety categories. Track business impact separately (time saved, adoption), which the Google posting asks you to quantify with SQL.",
  analogy: "A new assistant with a company card. They can look anything up on their own, but they must ask before spending or sending anything, they write a receipt for every action, and before they're trusted with a new kind of task they pass a practice test that includes trick questions.",
  language: "Go 1.22+ · tool registry with schema checks, risk tiers, approvals and idempotency, plus an eval gate with per-category regressions",
  primer: {
    text: "AI agents call tools: search, create a ticket, send an email. At work, every call is checked and risky ones need a person to approve. Repeats must not run twice, and every agent change is tested on real tasks before release. This lesson builds that tool gate and the test gate.",
    terms: [
      ["MCP (Model Context Protocol)", "An open protocol for exposing tools, resources and prompts to AI applications."],
      ["Tool schema", "The description of a tool's inputs (names, types, required fields) that calls are validated against."],
      ["Human-in-the-loop", "A step where a person must approve before the agent's action happens."],
      ["Idempotency key", "A unique key for a request so that repeating it doesn't repeat the effect."],
      ["Evaluation harness", "A program that runs the agent on a fixed set of test tasks and scores the results."],
      ["Regression gate", "A rule that blocks a release if scores drop compared with the current version."],
      ["Prompt injection", "Text in data (a web page, an email) that tries to make the agent follow the attacker's instructions."],
    ],
  },
  lines: LNgo(`
package agent

import "fmt"

type Risk int

const (
    Read Risk = iota
    Write
    Send
)

type Tool struct {
    Name     string
    Required []string
    Risk     Risk
}

type Call struct {
    Tool     string
    Args     map[string]string
    Key      string // idempotency key, required for side effects
    Approved bool   // set by a human reviewer
}

type Gate struct {
    Tools map[string]Tool
    done  map[string]bool
    Audit []string
}

func NewGate(ts ...Tool) *Gate {
    g := &Gate{Tools: map[string]Tool{}, done: map[string]bool{}}
    for _, t := range ts {
        g.Tools[t.Name] = t
    }
    return g
}

// Check decides whether a call may run now: "run", "skip-duplicate", "needs-approval" or an error.
func (g *Gate) Check(c Call) (string, error) {
    t, ok := g.Tools[c.Tool]
    if !ok {
        return "", fmt.Errorf("unknown tool %q", c.Tool) //@ The model may invent tool names; never guess.
    }
    allowed := map[string]bool{}
    for _, r := range t.Required {
        allowed[r] = true
        if c.Args[r] == "" {
            return "", fmt.Errorf("%s: missing %s", c.Tool, r)
        }
    }
    for a := range c.Args {
        if !allowed[a] {
            return "", fmt.Errorf("%s: unexpected argument %s", c.Tool, a)
        }
    }
    decision := "run"
    if t.Risk > Read {
        if c.Key == "" {
            return "", fmt.Errorf("%s: side-effecting call needs an idempotency key", c.Tool)
        }
        switch {
        case g.done[c.Key]:
            decision = "skip-duplicate" //@ An agent retry must not send the email twice.
        case !c.Approved:
            decision = "needs-approval" //@ Human-in-the-loop for writes and sends.
        default:
            g.done[c.Key] = true
        }
    }
    g.Audit = append(g.Audit, c.Tool+" "+decision)
    return decision, nil
}

type Result struct {
    Category string
    Pass     bool
}

// Rates returns the pass rate per category and overall.
func Rates(rs []Result) (map[string]float64, float64) {
    pass, total := map[string]int{}, map[string]int{}
    p := 0
    for _, r := range rs {
        total[r.Category]++
        if r.Pass {
            pass[r.Category]++
            p++
        }
    }
    out := map[string]float64{}
    for c, n := range total {
        out[c] = float64(pass[c]) / float64(n)
    }
    if len(rs) == 0 {
        return out, 0
    }
    return out, float64(p) / float64(len(rs))
}

// Ship gates a candidate: overall at least min, and no drop in any safety category.
func Ship(base, cand []Result, min float64, safety []string) (bool, string) {
    bc, _ := Rates(base)
    cc, overall := Rates(cand)
    if overall < min {
        return false, fmt.Sprintf("overall %.2f below %.2f", overall, min)
    }
    for _, s := range safety {
        if cc[s] < bc[s] {
            return false, "regression in " + s //@ A better average can hide a worse injection score.
        }
    }
    return true, "ok"
}
`),
  storyLesson: {
    scenarioTitle: "The helpful agent that emailed a customer twice",
    scenario: "A support-automation agent drafts and sends follow-up emails. After a model update, a customer gets the same email twice, and a red-team test shows the agent will follow instructions hidden in a customer's message.",
    sections: [
      { title: "1 · Duplicate side effects", body: "The agent retried after a tool timeout. The send tool had no idempotency key, so the retry sent again. Every side-effecting tool now requires a key, and the gate skips duplicates." },
      { title: "2 · Approval and audit", body: "Sending to customers moves to the 'needs approval' tier until the eval set shows it's safe to automate; every call and decision goes to an audit log with the trace ID." },
      { title: "3 · Evals that block", body: "The eval set gets an adversarial category with prompt-injection cases. The new model scored higher overall but worse on that category, and the gate now blocks that release." },
      { title: "4 · Impact", body: "Adoption and time-saved are measured from the audit log with SQL: tasks completed, approvals per task and edits before sending. These numbers decide which workflows to automate next." },
    ],
    checkpoint: { prompt: "MCP exposes a 'send_email' tool to the agent. Does that make it safe for the agent to call it whenever it decides to?", answer: "No. MCP describes the tool; the host must still validate arguments, require approval for risky actions, use idempotency keys and log every call." },
    lab: { title: "Gate an agent", brief: "Put the gate in front of three tools and run an eval comparison.", steps: ["Register search (read), create_ticket (write) and send_email (send)", "Show a call with a missing argument and one with an extra argument rejected", "Send the same email call twice with one key and approval", "Build base and candidate eval results with an 'injection' category", "Make the candidate better overall but worse on injection and show the gate blocks it"], doneWhen: "Every risky path is blocked or approved, duplicates are skipped, and the eval gate explains its decision." },
  },
  exercise: "A business team wants an agent that reads support tickets, looks up account data and replies to customers. Design it for production.",
  answerHint: "Tools via MCP, schemas, risk tiers, approval, idempotency, RAG grounding, audit, evals, rollout.",
  expected: ["mcp", "schema", "approval", "idempotency", "eval", "audit"],
  modelAnswer: "Expose ticket search, account lookup and reply as tools on an MCP server with strict input schemas. The host validates every call against the schema and enforces risk tiers: reads run, while replies need human approval at first and carry idempotency keys so retries don't send twice. Answers are grounded with RAG over the knowledge base and cite sources. Every call goes to an audit log with trace IDs. Changes ship only through an eval harness with happy-path, ambiguous, should-refuse and prompt-injection categories, gated on overall score and no safety regression. Roll out to a pilot team, measure time saved and edits from the logs, then reduce approvals where the data supports it.",
  pitfalls: [
    "Trusting MCP to enforce authorization.",
    "Side-effecting tools without idempotency keys.",
    "Eval sets with only happy paths.",
    "Shipping on a higher average while a safety category regresses.",
  ],
  probes: [
    ["L1 · What does an MCP server provide?", "Tools, resources and prompts with schemas, which an MCP client in the agent host can call."],
    ["L2 · Why require idempotency keys for agent tools?", "Agents retry after timeouts and errors; keys stop repeated side effects."],
    ["L3 · How do you build an eval set for a new workflow?", "Collect real tasks, label expected outcomes with domain experts, add edge and adversarial cases, keep a held-out set, and version it like code."],
    ["L4 · How do you decide when to remove human approval?", "Track approval rate, edit distance and incidents per category; remove approval only for categories with sustained high pass rates and low-risk failure modes, with monitoring and an instant rollback."],
  ],
  poly: "Device control APIs at Poly have commands that change a room's state. Agent tools need the same discipline: validate input, confirm destructive actions, and make retries safe.",
  why: "Google's AI Solution Builder and Genesys's AI CX Agent postings both name MCP, tool configuration, human-in-the-loop checkpoints and evaluation frameworks.",
  companies: ["Google", "Genesys", "Anthropic", "Microsoft", "Salesforce"],
  myth: { myth: "If the agent's answers look good in a demo, it's ready.", reality: "Production agents need schema checks, approvals, idempotent tools and an eval gate with adversarial cases." },
  interviewTip: "Separate the protocol (MCP) from the policy (validation, approval, idempotency). Interviewers listen for whether you know MCP doesn't secure anything by itself.",
},
];
