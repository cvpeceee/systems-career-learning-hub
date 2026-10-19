import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function GpuHealth() {
  const [xid, setXid] = useState("31"), [jobs, setJobs] = useState(1), [crc, setCrc] = useState(0), [clean, setClean] = useState(2), [burn, setBurn] = useState(false), [hyst, setHyst] = useState(false);
  const sev = { none: 0, "31": 1, "74": 1, "63": 2, "48": 2, "79": 3 }[xid];
  let act = sev;
  if (xid === "31" && jobs >= 3) act = 2;
  if (crc > 100) act = Math.max(act, 2); else if (crc > 5) act = Math.max(act, 1);
  const names = ["Keep", "Watch", "Drain", "Repair"];
  const returns = act <= 1 && (!hyst || clean >= 6) && (!hyst || burn);
  const risk = act >= 2 ? 0 : (hyst ? (clean >= 6 ? 0 : 0) : 30) + (burn ? 0 : 20) + (act === 1 ? 15 : 0);
  const ok = hyst && burn && (act >= 2 ? true : clean >= 6);
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: one GPU's latest signals. Thresholds are illustrative; real ones come from your fleet's history and NVIDIA's XID documentation."),
    h(Choice, { label: "Latest XID", value: xid, onChange: setXid, options: [{ v: "none", l: "None" }, { v: "31", l: "31 page fault" }, { v: "74", l: "74 NVLink" }, { v: "63", l: "63 remap pending" }, { v: "48", l: "48 double-bit ECC" }, { v: "79", l: "79 fell off bus" }] }),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Different jobs that hit it", value: jobs, min: 1, max: 6, step: 1, onChange: setJobs }),
      h(Slider, { label: "NVLink errors per minute", value: crc, min: 0, max: 200, step: 5, onChange: setCrc }),
      h(Slider, { label: "Clean windows since last error", value: clean, min: 0, max: 12, step: 1, onChange: setClean })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Require clean windows (hysteresis)", value: hyst, onChange: setHyst }),
      h(Toggle, { label: "Burn-in passed", value: burn, onChange: setBurn })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Action"), h("dd", null, names[act]), h("dt", null, "Back in service now?"), h("dd", null, returns ? "yes" : "no")),
    h(Bar, { label: "Risk of hurting a big training job", value: act >= 2 ? 0 : clamp(risk, 0, 100), tone: risk <= 10 || act >= 2 ? "good" : "bad", text: act >= 2 ? "node held out" : `${fmt(risk, 0)}%` }),
    h(Verdict, { ok },
      ok ? tl(act >= 2 ? "The card is held out until it is fixed and tested." : "The card returns only after a calm period and a stress test.", act >= 2 ? `${names[act].toLowerCase()} with gated return` : "hysteresis + burn-in")
      : !hyst ? tl("A card could rejoin the moment errors stop, then fail again. Require a calm period.", "no hysteresis")
      : !burn ? tl("Test the card under stress before trusting it with big jobs.", "burn-in missing")
      : tl("Not calm long enough yet. Wait for more clean windows.", "hysteresis window not met")));
}

function Rollout() {
  const [canary, setCanary] = useState(10), [bake, setBake] = useState(1), [control, setControl] = useState(false), [strat, setStrat] = useState(false), [cap, setCap] = useState(50);
  const onset = 8; // bad driver shows failures after 8 h on model B only
  const coversB = strat || canary >= 30;
  const caught = coversB && bake >= onset && control;
  const hit = caught ? (strat ? 1 : canary) : 100;
  const poolDown = cap;
  const ok = caught && hit <= 2 && poolDown <= 10;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a bad driver that only hurts GPU model B, and only after 8 hours of load. Model B is a third of the fleet."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "First wave (% of fleet)", value: canary, min: 1, max: 50, step: 1, onChange: setCanary }),
      h(Slider, { label: "Bake time (hours)", value: bake, min: 1, max: 48, step: 1, onChange: setBake }),
      h(Slider, { label: "Max share of a pool down at once (%)", value: cap, min: 1, max: 100, step: 1, onChange: setCap })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Canaries from every hardware model", value: strat, onChange: setStrat }),
      h(Toggle, { label: "Compare against untouched nodes", value: control, onChange: setControl })),
    h(Bar, { label: "Fleet hit by the bad driver", value: hit, tone: hit <= 2 ? "good" : "bad", text: `${fmt(hit, 0)}%` }),
    h(Bar, { label: "Worst pool capacity offline during updates", value: poolDown, tone: poolDown <= 10 ? "good" : "bad", text: `${poolDown}%` }),
    h(Verdict, { ok },
      ok ? tl("The bad driver is caught on a handful of machines and every group keeps serving.", "caught at canary; blast radius capped")
      : !coversB ? tl("No machine of the affected type got the update early, so the problem slipped through.", "canary not stratified by hardware")
      : bake < onset ? tl("You moved on before the problem had time to appear. Wait longer.", "bake time < failure onset")
      : !control ? tl("Without untouched machines to compare, the slow rise looked like normal noise.", "no control group")
      : hit > 2 ? tl("Caught, but the first wave was large. Start smaller.", "canary too large")
      : tl("Too much of one group goes offline at once. Lower the cap.", "per-pool unavailability too high")));
}

const PROF = [[1, 10], [2, 20], [3, 40], [7, 80]];
function MigPack() {
  const [small, setSmall] = useState(14), [mid, setMid] = useState(4), [big, setBig] = useState(3), [mode, setMode] = useState("whole"), [sorted, setSorted] = useState(false);
  const items = [...Array(big).fill(3), ...Array(mid).fill(2), ...Array(small).fill(1)];
  const order = sorted ? items : [...items].reverse();
  const starts = { 1: [0, 1, 2, 3, 4, 5, 6], 2: [0, 2, 4], 3: [0, 4] };
  let gpus;
  if (mode === "whole") gpus = items.length;
  else {
    const G = [];
    for (const s of order) {
      let done = false;
      for (const g of G) { for (const st of starts[s]) { if (st + s <= 7 && g.slice(st, st + s).every((x) => !x)) { for (let i = st; i < st + s; i++) g[i] = true; done = true; break; } } if (done) break; }
      if (!done) { const g = Array(7).fill(false); for (let i = 0; i < s; i++) g[i] = true; G.push(g); }
    }
    gpus = G.length;
  }
  const need = items.reduce((a, s) => a + s, 0) / 7;
  const util = gpus ? need / gpus : 0;
  const ok = mode === "mig" && sorted && util >= 0.75;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 7-slice GPUs with simplified MIG alignment (2-slice at 0/2/4, 3-slice at 0/4). Small = 1 slice, medium = 2, large = 3."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Small models", value: small, min: 0, max: 30, step: 1, onChange: setSmall }),
      h(Slider, { label: "Medium models", value: mid, min: 0, max: 12, step: 1, onChange: setMid }),
      h(Slider, { label: "Large models", value: big, min: 0, max: 10, step: 1, onChange: setBig })),
    h(Choice, { label: "Sharing", value: mode, onChange: setMode, options: [{ v: "whole", l: "One model per GPU" }, { v: "mig", l: "MIG partitions" }] }),
    h(Toggle, { label: "Place largest first", value: sorted, onChange: setSorted }),
    h("dl", { className: "sim-kv" }, h("dt", null, "GPUs used"), h("dd", null, fmt(gpus, 0)), h("dt", null, "Lower bound"), h("dd", null, fmt(Math.ceil(need), 0))),
    h(Bar, { label: "Slice utilization", value: util * 100, tone: util >= 0.75 ? "good" : "bad", text: `${fmt(util * 100, 0)}%` }),
    h(Verdict, { ok },
      items.length === 0 ? tl("Add some models to pack.", "empty catalogue")
      : ok ? tl("Models share cards with walls between them, and few spaces are wasted.", "MIG + first-fit decreasing")
      : mode === "whole" ? tl("Each small model gets a whole card and most of it sits empty.", "one model per GPU")
      : !sorted ? tl("Small pieces were placed first and left gaps big ones can't use.", "fragmentation from packing order")
      : tl("This mix just doesn't fill the cards well. Rebalance the pools.", "low utilization for this mix")));
}

export const SIMS32 = {
  gpuhealth: { title: "Triage a GPU's errors", goal: "Choose the right action for each signal and only return cards after a calm period and a stress test.", C: GpuHealth },
  rollout: { title: "Roll out a driver safely", goal: "Catch a bad driver on 2% of the fleet or less while keeping every pool serving.", C: Rollout },
  migpack: { title: "Pack models onto GPUs", goal: "Reach at least 75% slice utilization with isolation between models.", C: MigPack },
};
