import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function Chunking() {
  const [lat, setLat] = useState(180), [skip, setSkip] = useState(false), [ens, setEns] = useState(false), [k, setK] = useState(0.01), [stall, setStall] = useState(false), [hold, setHold] = useState(false);
  const ticks = lat / 20; // 50 Hz
  const jumpBase = skip ? 0.4 : 0.4 + ticks * 0.6;
  const jump = ens ? jumpBase * (0.25 + clamp(0.1 - k, 0, 0.1) * 0) : jumpBase;
  const react = ens ? 40 + 400 * clamp(0.1 - k, 0, 0.1) * 10 / 4 : 20;
  const overrun = stall && !hold;
  const ok = skip && ens && jump <= 1 && react <= 150 && (!stall || hold) && hold;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 50 Hz control loop, 50-step chunks. Jump is the largest change between commands (degrees); reaction is the delay before a new instruction shows in motion."),
    h(Slider, { label: "Inference latency (ms)", value: lat, min: 20, max: 400, step: 20, onChange: setLat }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Skip actions for elapsed time", value: skip, onChange: setSkip }),
      h(Toggle, { label: "Temporal ensembling", value: ens, onChange: setEns }),
      h(Slider, { label: "Ensembling weight k", value: k, min: 0, max: 0.1, step: 0.01, onChange: setK })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Inference server stalls", value: stall, onChange: setStall }),
      h(Toggle, { label: "Hold when the plan runs out", value: hold, onChange: setHold })),
    h(Bar, { label: "Largest jump between commands", value: clamp(jump / 6, 0, 1) * 100, tone: jump <= 1 ? "good" : "bad", text: `${fmt(jump, 1)}°` }),
    h(Bar, { label: "Reaction to a new instruction", value: clamp(react / 300, 0, 1) * 100, tone: react <= 150 ? "good" : "bad", text: `${fmt(react, 0)} ms` }),
    h("dl", { className: "sim-kv" }, h("dt", null, "If the model stalls"), h("dd", null, !stall ? "n/a" : overrun ? "arm keeps moving on an old plan" : "arm holds position")),
    h(Verdict, { ok },
      ok ? tl("Motion is smooth, reacts quickly, and stops safely if the planner goes quiet.", "latency skip + ensembling + staleness hold")
      : !skip ? tl("New plans start from moves that are already in the past, so the arm jerks back.", "no latency compensation")
      : !ens ? tl("Switching between plans still causes small jumps. Blend overlapping plans.", "no temporal ensembling")
      : react > 150 ? tl("Too much blending makes the arm slow to follow new instructions. Lower the blend.", "over-smoothing")
      : tl("If plans stop arriving, the arm would keep going. Make it hold.", "no staleness handling")));
}

function Simplex() {
  const [v, setV] = useState(1.4), [dist, setDist] = useState(1.0), [guard, setGuard] = useState(false), [react, setReact] = useState(0.1), [hyst, setHyst] = useState(false), [noisy, setNoisy] = useState(true);
  const a = 2.0, margin = 0.3;
  const stop = v * react + v * v / (2 * a);
  const unsafe = stop + margin > dist || v > 1.5;
  const breach = unsafe && !guard;
  const flicker = guard && noisy && !hyst ? 14 : 0;
  const ok = guard && hyst;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: braking at 2 m/s², 0.3 m margin, 1.5 m/s cap near people. The learned policy proposes a speed; a person stands ahead."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Proposed speed (m/s)", value: v, min: 0, max: 2, step: 0.1, onChange: setV }),
      h(Slider, { label: "Distance to person (m)", value: dist, min: 0.2, max: 3, step: 0.1, onChange: setDist }),
      h(Slider, { label: "Reaction time (s)", value: react, min: 0.05, max: 0.5, step: 0.05, onChange: setReact })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Safety supervisor", value: guard, onChange: setGuard }),
      h(Toggle, { label: "Calm period before handing back", value: hyst, onChange: setHyst }),
      h(Toggle, { label: "Noisy distance sensor", value: noisy, onChange: setNoisy })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Stopping distance + margin"), h("dd", null, `${fmt(stop + margin, 2)} m`), h("dt", null, "Command"), h("dd", null, unsafe ? (guard ? "overridden: braking" : "passed through") : "allowed")),
    h(Bar, { label: "Space left after stopping", value: clamp((dist - stop) / 3, 0, 1) * 100, tone: breach ? "bad" : "good", text: breach ? "would not stop in time" : `${fmt(Math.max(0, unsafe ? dist - (v * react) : dist - stop), 2)} m` }),
    h(Bar, { label: "Mode switches per minute", value: flicker / 14 * 100, tone: flicker ? "bad" : "good", text: String(flicker) }),
    h(Verdict, { ok },
      ok ? tl(unsafe ? "The unsafe speed is caught and the robot brakes in time, without stuttering." : "This speed is safe here, and the guard is ready if that changes.", unsafe ? "envelope violation → fallback" : "inside envelope")
      : !guard ? tl(unsafe ? "Nothing stops the robot, and it can't brake before reaching the person." : "Safe right now, but nothing would stop a bad command.", unsafe ? "no safety supervisor: breach" : "no supervisor")
      : tl("Sensor noise makes control flip back and forth. Wait for a calm period first.", "no hysteresis: mode flicker")));
}

function wilson(k, n) { if (!n) return [0, 1]; const z2 = 3.8416, p = k / n, d = 1 + z2 / n, c = (p + z2 / (2 * n)) / d, hw = 1.96 * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / d; return [Math.max(0, c - hw), Math.min(1, c + hw)]; }
function Capability() {
  const [n, setN] = useState(25), [rateNew, setRateNew] = useState(92), [crit, setCrit] = useState(true), [perTask, setPerTask] = useState(false), [useLo, setUseLo] = useState(false);
  const k = Math.round(n * rateNew / 100);
  const [lo, hi] = wilson(k, n);
  const old = 0.85;
  const sig = lo > old;
  const shipBad = (!useLo && rateNew / 100 > old && !sig) || (!perTask && crit);
  const decision = (useLo ? sig : rateNew / 100 > old) && (!perTask || !crit);
  const ok = useLo && perTask && (decision ? sig && !crit : true) && (decision || crit || !sig ? true : false);
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: the current policy succeeds 85% of the time. The new one is tested on n real trials."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Real trials", value: n, min: 10, max: 400, step: 5, onChange: setN }),
      h(Slider, { label: "New policy success (%)", value: rateNew, min: 70, max: 99, step: 1, onChange: setRateNew })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "New policy is worse on a critical task", value: crit, onChange: setCrit }),
      h(Toggle, { label: "Check every task separately", value: perTask, onChange: setPerTask }),
      h(Toggle, { label: "Require the low end to beat 85%", value: useLo, onChange: setUseLo })),
    h(Bar, { label: "95% range for the true success rate", value: lo * 100, tone: sig ? "good" : "bad", text: `${fmt(lo * 100, 0)}% – ${fmt(hi * 100, 0)}%` }),
    h("dl", { className: "sim-kv" }, h("dt", null, "Gate decision"), h("dd", null, decision ? "promote" : "hold"), h("dt", null, "Risky promotion?"), h("dd", null, decision && shipBad ? "yes" : "no")),
    h(Verdict, { ok: ok && !(decision && shipBad) },
      !useLo ? tl("A higher average from a few tests can be luck. Require the low end to win.", "point estimate, no interval")
      : !perTask ? tl("The average hides a task that got worse. Check each task.", "no per-task regression check")
      : decision ? tl("The new version is clearly better and worse at nothing important.", "gate passed with confidence")
      : crit ? tl("Correctly held back: it got worse at a task that matters.", "critical-task regression blocks release")
      : tl("Correctly held back for now. Run more trials to be sure.", "not yet significant")));
}

export const SIMS35 = {
  chunking: { title: "From slow model to fast motors", goal: "Smooth, responsive motion that stops safely if the model stalls.", C: Chunking },
  simplex: { title: "A safety guard around a learned policy", goal: "Never fail to stop in time, without stuttering.", C: Simplex },
  capability: { title: "Is the new policy really better?", goal: "Promote only with confidence and no critical-task regression.", C: Capability },
};
