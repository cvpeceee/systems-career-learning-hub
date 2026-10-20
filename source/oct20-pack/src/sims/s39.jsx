import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function Autoscale() {
  const [win, setWin] = useState(1), [warm, setWarm] = useState(0), [cold, setCold] = useState(8);
  // replay: dip at t=0..2 (load 60), peak after (load 200); 10 per replica
  const keptDuringDip = win >= 3 ? 20 : 6;
  const short = Math.max(0, 20 - keptDuringDip - warm);
  const sloMinutes = short > 0 ? cold : 0;
  const idle = warm * 0.5 + (win >= 3 ? 1 : 0);
  const ok = sloMinutes === 0 && idle < 4;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 20 replicas at 9:00 need, a 2-minute dip just before. Replicas take the chosen cold-start time to become ready."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Scale-down window (minutes)", value: win, min: 1, max: 10, step: 1, onChange: setWin }),
      h(Slider, { label: "Warm-pool replicas", value: warm, min: 0, max: 10, step: 1, onChange: setWarm }),
      h(Slider, { label: "Cold start (minutes)", value: cold, min: 1, max: 15, step: 1, onChange: setCold })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Replicas kept through the dip"), h("dd", null, `${keptDuringDip}`), h("dt", null, "Short at the peak"), h("dd", null, `${short}`), h("dt", null, "Minutes missing the latency SLO"), h("dd", null, `${sloMinutes}`), h("dt", null, "Extra idle replica-hours / day"), h("dd", null, fmt(idle, 1))),
    h(Bar, { label: "SLO at the peak", value: short === 0 ? 100 : clamp(100 - short * 5, 0, 100), tone: ok ? "good" : "bad", text: short === 0 ? "met" : "missed" }),
    h(Verdict, { ok },
      ok ? tl("The dip doesn't remove capacity, and the peak is covered without much idle cost.", "stabilized scale-down")
      : short > 0 ? tl("The fleet shrank during the dip, and new replicas take too long to start for the peak.", "symmetric scaling + cold start")
      : tl("The SLO is met, but you're paying for a lot of idle replicas. Use a smaller warm pool.", "excess headroom")));
}

function K8sUpgrade() {
  const [budget, setBudget] = useState(0), [skipLong, setSkipLong] = useState(false), [skew, setSkew] = useState(false);
  const longNodes = 12, total = 40;
  const drainable = budget === 0 ? 0 : Math.min(total - (skipLong ? longNodes : 0), budget * 4);
  const killed = skipLong ? 0 : Math.min(longNodes, drainable);
  const ok = budget > 0 && skipLong && skew;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 40 nodes, 12 running multi-day EDA jobs. Each node hosts replicas of several apps; the budget is per app."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "PodDisruptionBudget (max unavailable per app)", value: budget, min: 0, max: 3, step: 1, onChange: setBudget }),
      h(Toggle, { label: "Skip nodes running long jobs", value: skipLong, onChange: setSkipLong }),
      h(Toggle, { label: "Check kubelet skew before control-plane step", value: skew, onChange: setSkew })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Nodes drained this wave"), h("dd", null, `${drainable}`), h("dt", null, "Long jobs killed"), h("dd", null, `${killed}`), h("dt", null, "Control-plane step"), h("dd", null, skew ? "safe" : "may leave kubelets 4 minors behind")),
    h(Bar, { label: "Upgrade progress without harm", value: ok ? 100 : budget === 0 ? 0 : 40, tone: ok ? "good" : "bad", text: ok ? "safe progress" : budget === 0 ? "stuck" : "risky" }),
    h(Verdict, { ok },
      ok ? tl("Idle nodes upgrade now, long jobs finish first, and versions stay within the rules.", "job-aware, budget-respecting, skew-checked")
      : budget === 0 ? tl("A budget of zero means no node can ever be drained.", "PDB maxUnavailable 0")
      : !skipLong ? tl("Draining busy nodes kills jobs that ran for days.", "not job-aware")
      : tl("Check node versions before upgrading the control plane again.", "skew policy unchecked")));
}

function Otel() {
  const [tail, setTail] = useState(false), [pct, setPct] = useState(1), [budget, setBudget] = useState(false), [redact, setRedact] = useState(false);
  const errKept = tail ? 100 : pct;
  const series = budget ? 2000 : 4000000;
  const cost = series / 40000 + (tail ? pct * 2 + 10 : pct * 2);
  const ok = tail && budget && redact && cost < 40;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 300 services; one team added customer_id as a metric label; 0.5% of requests fail."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Tail sampling (keep errors and slow)", value: tail, onChange: setTail }),
      h(Slider, { label: "Keep % of normal traces", value: pct, min: 1, max: 20, step: 1, onChange: setPct })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Cardinality budget per metric", value: budget, onChange: setBudget }),
      h(Toggle, { label: "Redact sensitive attributes in the collector", value: redact, onChange: setRedact })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Failed requests you can find"), h("dd", null, `${errKept}%`), h("dt", null, "Metric series"), h("dd", null, fmt(series, 0)), h("dt", null, "Relative cost"), h("dd", null, fmt(cost, 0)), h("dt", null, "Account numbers leaving the network"), h("dd", null, redact ? "none" : "some")),
    h(Bar, { label: "Useful and affordable", value: ok ? 100 : clamp(errKept - cost / 2, 0, 90), tone: ok ? "good" : "bad", text: ok ? "good" : "not yet" }),
    h(Verdict, { ok },
      ok ? tl("Every failing request is kept, costs are under control, and sensitive data stays inside.", "tail sampling + cardinality budget + redaction")
      : !tail ? tl("Most failed requests are thrown away before anyone looks for them.", "head sampling")
      : !budget ? tl("One label with customer numbers made millions of separate series.", "cardinality explosion")
      : !redact ? tl("Sensitive values in traces leave the network.", "no redaction processor")
      : tl("Keeping this much normal traffic costs too much. Lower the percent.", "sampling rate too high")));
}

export const SIMS39 = {
  autoscale: { title: "Survive the morning peak", goal: "Zero SLO-missing minutes with little idle cost.", C: Autoscale },
  k8supgrade: { title: "Upgrade without killing jobs", goal: "Make progress, kill no long jobs, keep versions legal.", C: K8sUpgrade },
  otel: { title: "Find every failure without the huge bill", goal: "All errors kept, cardinality capped, data redacted.", C: Otel },
};
