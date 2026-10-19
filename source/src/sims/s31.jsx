import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function Goodput() {
  const [nodes, setNodes] = useState(4096), [mtbfK, setMtbfK] = useState(50), [blockMin, setBlockMin] = useState(12), [restartMin, setRestartMin] = useState(40), [intMin, setIntMin] = useState(240), [async, setAsync] = useState(false), [spares, setSpares] = useState(false), [young, setYoung] = useState(false);
  const M = (mtbfK * 1000) / nodes; // hours
  const C = (async ? 0.5 : blockMin) / 60, R = (spares ? Math.min(restartMin, 8) : restartMin) / 60;
  const tau = young ? Math.sqrt(2 * C * M) : intMin / 60;
  const waste = C / tau + (tau + C) / (2 * M) + R / M;
  const g = clamp(1 - waste, 0, 1);
  const ok = g >= 0.9;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: first-order goodput = 1 − C/τ − (τ+C)/2M − R/M. Async checkpoints block for 30 s; hot spares cap restart at 8 min."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Nodes in the job", value: nodes, min: 256, max: 32768, step: 256, onChange: setNodes }),
      h(Slider, { label: "Node MTBF (thousand hours)", value: mtbfK, min: 5, max: 200, step: 5, onChange: setMtbfK })),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Checkpoint blocks training (min)", value: blockMin, min: 1, max: 30, step: 1, onChange: setBlockMin }),
      h(Slider, { label: "Restart time (min)", value: restartMin, min: 2, max: 60, step: 1, onChange: setRestartMin }),
      h(Slider, { label: "Checkpoint every (min)", value: intMin, min: 10, max: 600, step: 10, onChange: setIntMin })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Use Young's interval", value: young, onChange: setYoung }),
      h(Toggle, { label: "Async sharded checkpoints", value: async, onChange: setAsync }),
      h(Toggle, { label: "Hot spares with cached images", value: spares, onChange: setSpares })),
    h("dl", { className: "sim-kv" },
      h("dt", null, "Job MTBF"), h("dd", null, `${fmt(M, 1)} h (${fmt(720 / M, 0)} failures in 30 days)`),
      h("dt", null, "Interval used"), h("dd", null, `${fmt(tau * 60, 0)} min`)),
    h(Bar, { label: "Goodput (target 90%)", value: g * 100, tone: ok ? "good" : "bad", text: `${fmt(g * 100, 1)}%` }),
    h(Verdict, { ok },
      ok ? tl("Most of the machine time now goes into training that is kept.", "goodput ≥ 90%")
      : !young ? tl("The save schedule doesn't match how often this job breaks. Try Young's interval.", "interval far from √(2CM)")
      : !async ? tl("Saving stops training for too long. Save in the background.", "blocking checkpoint cost dominates")
      : !spares ? tl("Each crash takes too long to recover from. Keep spare machines ready.", "restart time R/M dominates")
      : tl("This job is too big for this hardware's failure rate. Improve node health first.", "job MTBF too low")));
}

function Ckpt() {
  const [crash, setCrash] = useState("shards"), [last, setLast] = useState(false), [sums, setSums] = useState(false), [corrupt, setCorrupt] = useState(false), [delFirst, setDelFirst] = useState(false), [async, setAsync] = useState(false);
  let loads, ok = true, why;
  if (crash === "shards" && !last) { loads = "step 100 (half written)"; ok = false; why = tl("The save was cut off halfway, but the list file already said it was complete.", "manifest written before shards"); }
  else if (corrupt && !sums) { loads = "step 100 (corrupted shard)"; ok = false; why = tl("A damaged piece loaded without anyone noticing.", "no checksum verification"); }
  else if (corrupt && crash === "cleanup" && !delFirst) { loads = "step 99 (half deleted)"; ok = false; why = tl("The fallback save was half deleted but still looked complete.", "retention deleted shards before manifest"); }
  else if (corrupt || crash === "shards" || crash === "manifest") { loads = "step 99 (previous good save)"; why = tl("The unfinished or damaged save is skipped and the previous one loads.", "fallback to newest valid step"); }
  else { loads = "step 100 (newest)"; why = tl("The newest save is complete and checked.", "valid manifest, checksums match"); }
  const blocked = async ? 30 : 540;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: step 99 is committed; step 100 is being saved by 64 workers when something goes wrong. Choose where the crash lands and which safeguards exist."),
    h(Choice, { label: "Crash lands", value: crash, onChange: setCrash, options: [{ v: "none", l: "No crash" }, { v: "shards", l: "During shard upload" }, { v: "manifest", l: "Before the manifest" }, { v: "cleanup", l: "During old-step cleanup" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Write manifest last", value: last, onChange: setLast }),
      h(Toggle, { label: "Verify checksums", value: sums, onChange: setSums }),
      h(Toggle, { label: "Delete manifest first on cleanup", value: delFirst, onChange: setDelFirst })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "A shard of step 100 is silently corrupted", value: corrupt, onChange: setCorrupt }),
      h(Toggle, { label: "Async snapshot", value: async, onChange: setAsync })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Restore loads"), h("dd", null, loads), h("dt", null, "Training blocked per save"), h("dd", null, `${blocked} s`)),
    h(Bar, { label: "Training time lost to saving (every 45 min)", value: blocked / 2700 * 100, tone: async ? "good" : "bad", text: `${fmt(blocked / 2700 * 100, 1)}%` }),
    h(Verdict, { ok: ok && async }, ok && !async ? tl("Restore is safe, but every save still stops training for 9 minutes. Copy to memory and upload in the background.", "synchronous checkpoint") : why));
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function runGang(gang, maxSkips, rate) {
  const N = 64, r = rng(7);
  let free = N, run = [], q = [], idleHeld = 0, busy = 0, startA = -1, startB = -1, skipsA = 0, skipsB = 0;
  const big = { A: { need: 32, have: 0 }, B: { need: 32, have: 0 } };
  for (let t = 0; t < 200; t++) {
    run = run.filter((j) => { if (j.end <= t) { free += j.n; return false; } return true; });
    for (let k = 0; k < rate; k++) if (r() < 0.6) q.push({ n: 1 + Math.floor(r() * 4), d: 3 + Math.floor(r() * 6) });
    for (const [id, at] of [["A", 10], ["B", 12]]) {
      const b = big[id]; if (t < at || b.started) continue;
      if (gang) {
        if (free >= b.need) { free -= b.need; b.started = true; run.push({ n: b.need, end: t + 30 }); if (id === "A") startA = t; else startB = t; }
        else if (id === "A") skipsA++; else skipsB++;
      } else {
        const take = Math.min(free, b.need - b.have); b.have += take; free -= take;
        if (b.have === b.need) { b.started = true; run.push({ n: b.need, end: t + 30 }); if (id === "A") startA = t; else startB = t; } else idleHeld += b.have;
      }
    }
    const hold = gang && ((startA < 0 && t >= 10 && skipsA > maxSkips) || (startB < 0 && t >= 12 && skipsB > maxSkips));
    if (!hold) q = q.filter((j) => { if (j.n <= free) { free -= j.n; run.push({ n: j.n, end: t + j.d }); return false; } return true; });
    busy += N - free - (gang ? 0 : (big.A.started ? 0 : big.A.have) + (big.B.started ? 0 : big.B.have));
  }
  return { startA, startB, idleHeld, util: busy / (200 * N) };
}

function Gang() {
  const [gang, setGang] = useState(false), [maxSkips, setMaxSkips] = useState(1000), [rate, setRate] = useState(6);
  const r = runGang(gang, maxSkips, rate);
  const fmtT = (x) => (x < 0 ? "never (in 200 ticks)" : `tick ${x}`);
  const ok = gang && r.startA >= 0 && r.startB >= 0 && r.startA <= 60 && r.startB <= 90 && r.util > 0.5;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 64 nodes, a stream of 1–4-node jobs, and two 32-node training jobs (A at tick 10, B at tick 12) that each need all their nodes at once."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "All-or-nothing start (gang)", value: gang, onChange: setGang }),
      h(Slider, { label: "Small-job arrivals per tick", value: rate, min: 0, max: 12, step: 1, onChange: setRate }),
      h(Slider, { label: "Skips before reserving nodes", value: maxSkips, min: 0, max: 1000, step: 5, onChange: setMaxSkips })),
    h("dl", { className: "sim-kv" },
      h("dt", null, "Job A starts"), h("dd", null, fmtT(r.startA)),
      h("dt", null, "Job B starts"), h("dd", null, fmtT(r.startB)),
      h("dt", null, "Node-ticks held idle by half-started jobs"), h("dd", null, fmt(r.idleHeld, 0))),
    h(Bar, { label: "Useful utilization", value: r.util * 100, tone: r.util > 0.5 ? "good" : "bad", text: `${fmt(r.util * 100, 0)}%` }),
    h(Verdict, { ok },
      ok ? tl("Both big jobs start in reasonable time and the machines stay busy.", "gang + reservation")
      : !gang ? tl("Big jobs grab machines piece by piece and sit idle waiting for the rest, sometimes forever.", "partial gangs: idle allocation, possible deadlock")
      : r.startA < 0 || r.startA > 60 || r.startB < 0 || r.startB > 90 ? tl("Small jobs keep filling every gap, so the big jobs never get their turn. Reserve sooner.", "starvation by backfill")
      : tl("Too many machines sit reserved. Allow a little more backfill.", "over-reservation")));
}

function ApiServer() {
  const [clients, setClients] = useState(18000), [jitter, setJitter] = useState(false), [cache, setCache] = useState(false), [narrow, setNarrow] = useState(false), [apf, setApf] = useState(false);
  const window = jitter ? 60 : 2; // seconds over which restarts' lists arrive
  const costPerList = (narrow ? 0.001 : 1) * (cache ? 0.2 : 1); // relative cost of one list
  const capacity = 600; // full uncached lists per second the server can absorb
  const load = (clients / window) * costPerList / capacity;
  const etcd = cache ? 0.05 * load : load;
  const vitalMs = apf ? 40 + 20 * clamp(load, 0, 1) : load < 0.8 ? 50 : 50 + 2000 * (load - 0.8);
  const down = load > 1.5;
  const ok = load <= 1 && vitalMs < 200;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: every node's daemon restarts during a rollout and lists pods. The server absorbs about 600 full, uncached lists per second."),
    h(Slider, { label: "Clients restarting", value: clients, min: 1000, max: 30000, step: 1000, onChange: setClients }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Backoff with jitter", value: jitter, onChange: setJitter }),
      h(Toggle, { label: "Serve lists from watch cache", value: cache, onChange: setCache }),
      h(Toggle, { label: "List only own node's pods", value: narrow, onChange: setNarrow }),
      h(Toggle, { label: "Priority and fairness", value: apf, onChange: setApf })),
    h(Bar, { label: "API server load", value: clamp(load, 0, 2) / 2 * 100, tone: load <= 1 ? "good" : "bad", text: down ? `${fmt(load * 100, 0)}% · crashing` : `${fmt(load * 100, 0)}%` }),
    h(Bar, { label: "etcd load", value: clamp(etcd, 0, 2) / 2 * 100, tone: etcd <= 1 ? "good" : "bad", text: `${fmt(etcd * 100, 0)}%` }),
    h(Bar, { label: "Node heartbeat latency", value: clamp(vitalMs / 2000, 0, 1) * 100, tone: vitalMs < 200 ? "good" : "bad", text: `${fmt(vitalMs, 0)} ms` }),
    h(Verdict, { ok },
      ok ? tl("The rollout passes without hurting the cluster, and heartbeats stay fast.", "storm absorbed; vital flows protected")
      : !jitter ? tl("Everyone asks at the same moment. Spread the retries out.", "synchronized list storm")
      : !narrow && !cache ? tl("Each request asks for far more than it needs. Narrow it and answer from memory.", "full uncached lists")
      : !apf ? tl("Vital heartbeats wait behind the crowd. Give them their own lane.", "no priority and fairness")
      : tl("Still too much load. Roll out in smaller waves or split the cluster.", "capacity exceeded")));
}

export const SIMS31 = {
  goodput: { title: "Goodput of a giant training job", goal: "Reach 90% goodput by choosing the checkpoint interval and making saves and restarts cheaper.", C: Goodput },
  ckpt: { title: "Crash-proof checkpoints", goal: "Make every crash point safe: restore must never load a half-written or corrupted save.", C: Ckpt },
  gang: { title: "Gangs, backfill and starvation", goal: "Start both 32-node jobs promptly without leaving the cluster idle.", C: Gang },
  apiserver: { title: "Surviving a list storm", goal: "Roll a daemon out to every node without overloading the API server or delaying heartbeats.", C: ApiServer },
};
