import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function Outbox() {
  const [crash, setCrash] = useState("between"), [outbox, setOutbox] = useState(false), [dedupe, setDedupe] = useState(false);
  let lost = false, dup = false;
  if (crash === "between") lost = !outbox;
  if (crash === "relay") dup = outbox && !dedupe;
  const ok = outbox && dedupe;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: create an order, then tell the flight planner. Pick where the service crashes."),
    h(Choice, { label: "Crash happens", value: crash, onChange: setCrash, options: [{ v: "none", l: "Never" }, { v: "between", l: "After commit, before publish" }, { v: "relay", l: "After publish, before marking sent" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Transactional outbox", value: outbox, onChange: setOutbox }),
      h(Toggle, { label: "Consumer dedupes by event ID", value: dedupe, onChange: setDedupe })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Order paid but never scheduled"), h("dd", null, lost ? "yes" : "no"), h("dt", null, "Aircraft reserved twice"), h("dd", null, dup ? "yes" : "no")),
    h(Bar, { label: "Correct under crashes", value: (outbox ? 50 : 0) + (dedupe ? 50 : 0), tone: ok ? "good" : "bad", text: ok ? "safe" : "unsafe" }),
    h(Verdict, { ok },
      ok ? tl("Every order is announced at least once, and repeats change nothing.", "outbox + idempotent consumer")
      : !outbox ? tl("A crash between saving and sending loses the message.", "dual write")
      : tl("Retries send the message again and the planner acts twice.", "non-idempotent consumer")));
}

function Privacy() {
  const [ledger, setLedger] = useState(false), [atUse, setAtUse] = useState(false), [ret, setRet] = useState(false), [res, setRes] = useState(false);
  const sent = !(ledger && atUse);
  const ok = ledger && atUse && ret && res;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a user withdrew marketing consent on Monday; a campaign runs Wednesday from a nightly copy. An EU tenant writes data."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Append-only consent ledger", value: ledger, onChange: setLedger }),
      h(Toggle, { label: "Check consent at the moment of use", value: atUse, onChange: setAtUse })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Retention rule for every copy", value: ret, onChange: setRet }),
      h(Toggle, { label: "Residency enforced on write", value: res, onChange: setRes })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Email sent after opt-out"), h("dd", null, sent ? "yes" : "no"), h("dt", null, "Stale copies kept"), h("dd", null, ret ? "expire in a day" : "forever"), h("dt", null, "EU data stored in US"), h("dd", null, res ? "rejected" : "possible")),
    h(Bar, { label: "Privacy controls in code", value: [ledger, atUse, ret, res].filter(Boolean).length * 25, tone: ok ? "good" : "bad", text: ok ? "complete" : "gaps" }),
    h(Verdict, { ok },
      ok ? tl("The opt-out is respected, old copies expire, and EU data stays in the EU.", "ledger + check at use + retention + residency")
      : sent ? tl("The campaign used an old copy, so the person who opted out still got the email.", "stale consent")
      : !ret ? tl("Copies with no deletion date pile up forever.", "no retention rule")
      : tl("Nothing stops an EU customer's data from being written in the US.", "residency by policy only")));
}

function AgentGate() {
  const [schema, setSchema] = useState(false), [approval, setApproval] = useState(false), [idem, setIdem] = useState(false), [evals, setEvals] = useState(false);
  const ok = schema && approval && idem && evals;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a support agent with search, create_ticket and send_email tools. It retries after a timeout, and one customer message contains hidden instructions."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Schema validation on every call", value: schema, onChange: setSchema }),
      h(Toggle, { label: "Human approval for sends", value: approval, onChange: setApproval })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Idempotency keys on side effects", value: idem, onChange: setIdem }),
      h(Toggle, { label: "Eval gate with prompt-injection cases", value: evals, onChange: setEvals })),
    h("dl", { className: "sim-kv" },
      h("dt", null, "Invented tool or extra argument"), h("dd", null, schema ? "rejected" : "runs"),
      h("dt", null, "Email sent twice after retry"), h("dd", null, idem ? "no" : "yes"),
      h("dt", null, "Unreviewed email to a customer"), h("dd", null, approval ? "no" : "yes"),
      h("dt", null, "Model update that follows hidden instructions"), h("dd", null, evals ? "blocked before release" : "ships")),
    h(Bar, { label: "Production-ready", value: [schema, approval, idem, evals].filter(Boolean).length * 25, tone: ok ? "good" : "bad", text: ok ? "ready" : "not yet" }),
    h(Verdict, { ok },
      ok ? tl("Every call is checked, risky actions wait for a person, retries are harmless, and unsafe updates don't ship.", "validated, approved, idempotent, eval-gated")
      : !idem ? tl("A retry sends the same email again.", "no idempotency key")
      : !approval ? tl("The agent can email customers without anyone checking.", "no human-in-the-loop")
      : !schema ? tl("The agent can call tools or pass arguments that don't exist.", "no schema validation")
      : tl("A model update that falls for hidden instructions could still ship.", "no safety regression gate")));
}

export const SIMS40 = {
  outbox: { title: "Never lose or double an order", goal: "Correct at every crash point.", C: Outbox },
  privacy: { title: "Respect an opt-out", goal: "All four privacy controls enforced in code.", C: Privacy },
  agentgate: { title: "Put an agent into production", goal: "Every gate in place.", C: AgentGate },
};
