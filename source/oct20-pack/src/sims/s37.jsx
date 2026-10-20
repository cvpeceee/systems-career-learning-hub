import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function March() {
  const [fault, setFault] = useState("coupdown"), [both, setBoth] = useState(false), [hot, setHot] = useState(false);
  // which tests catch which fault (teaching model consistent with lesson 37.1)
  const marginal = fault === "weak";
  const caughtBy = { none: "n/a", stuck: "element 1 (⇑ r0,w1)", trans: "element 3 (⇓ r0,w1)", coupup: "element 1 (⇑ r0,w1)", coupdown: "element 2 (⇑ r1,w0)", weak: "element 3, only when hot" }[fault];
  const caught = fault === "none" ? true : fault === "coupup" ? both : marginal ? both && hot : true;
  const ok = both && hot && caught;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a simple test (write every cell, then read every cell) vs March C- (read before each write, both directions). The weak cell fails only when hot."),
    h(Choice, { label: "Injected defect", value: fault, onChange: setFault, options: [{ v: "none", l: "None" }, { v: "stuck", l: "Stuck-at 1" }, { v: "trans", l: "Can't go 1→0" }, { v: "coupup", l: "Coupling, aggressor below" }, { v: "coupdown", l: "Coupling, aggressor above" }, { v: "weak", l: "Weak cell (heat)" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Use March C- instead of write-all/read-all", value: both, onChange: setBoth }),
      h(Toggle, { label: "Run in the hot chamber", value: hot, onChange: setHot })),
    h("dl", { className: "sim-kv" }, h("dt", null, "March C- catches it in"), h("dd", null, caughtBy), h("dt", null, "Caught with current settings"), h("dd", null, caught ? "yes" : "no")),
    h(Bar, { label: "Screen coverage", value: (both ? 60 : 30) + (hot ? 40 : 0), tone: ok ? "good" : "bad", text: ok ? "full" : "gaps" }),
    h(Verdict, { ok },
      ok ? tl("Every defect type is found, including the one that only shows up when hot.", "March C- at temperature corners")
      : !both ? tl("Writing everything and then reading hides a defect whose victim gets rewritten after it was disturbed.", "write-all/read-all misses coupling faults")
      : tl("Some parts only fail when hot. Test at the temperature edges too.", "no stress corner")));
}

function WarpSim() {
  const [W, setW] = useState(4), [m, setM] = useState(9), [L, setL] = useState(200);
  const one = (m + 1) / (m + L), u = clamp(W * one, 0, 1), need = Math.ceil((m + L) / (m + 1));
  const ok = u >= 0.95;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: each warp does m compute instructions, then waits L cycles for memory. One instruction issues per cycle."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Resident warps", value: W, min: 1, max: 64, step: 1, onChange: setW }),
      h(Slider, { label: "Compute instructions per load (m)", value: m, min: 1, max: 60, step: 1, onChange: setM }),
      h(Slider, { label: "Memory latency (cycles)", value: L, min: 20, max: 800, step: 10, onChange: setL })),
    h("dl", { className: "sim-kv" }, h("dt", null, "One warp keeps the pipe busy"), h("dd", null, `${fmt(one * 100, 1)}% of the time`), h("dt", null, "Warps needed"), h("dd", null, `≈ ${need}`)),
    h(Bar, { label: "Issue-slot utilisation", value: u * 100, tone: ok ? "good" : "bad", text: `${fmt(u * 100, 0)}%` }),
    h(Verdict, { ok },
      ok ? tl("There is always a ready thread group while others wait for memory.", "latency hidden")
      : tl(`The scheduler runs out of ready thread groups. You need about ${need}: more groups resident or more work per load.`, "latency-bound")));
}

function Tiling() {
  const [T, setT] = useState(1000), [halo, setHalo] = useState(0), [r, setR] = useState(60), [keep, setKeep] = useState(false);
  const overhead = ((T + 2 * halo) ** 2 / (T * T) - 1) * 100;
  const exact = halo >= r && keep;
  const ok = exact && overhead < 40;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: an operation looks r nm around each point. Tiles of side T read a border (halo) from their neighbours."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Tile side T", value: T, min: 100, max: 4000, step: 100, onChange: setT }),
      h(Slider, { label: "Halo width", value: halo, min: 0, max: 400, step: 10, onChange: setHalo }),
      h(Slider, { label: "Interaction radius r", value: r, min: 0, max: 300, step: 10, onChange: setR })),
    h(Toggle, { label: "Keep results only inside each tile's core", value: keep, onChange: setKeep }),
    h("dl", { className: "sim-kv" }, h("dt", null, "Extra work from halos"), h("dd", null, `${fmt(overhead, 1)}%`), h("dt", null, "Tiled answer equals single run"), h("dd", null, exact ? "yes" : "no")),
    h(Bar, { label: "Exact and efficient", value: exact ? 100 - clamp(overhead, 0, 100) : 10, tone: ok ? "good" : "bad", text: ok ? "good" : exact ? "costly" : "seams" }),
    h(Verdict, { ok },
      ok ? tl("No seams, and the borders cost a small share of the work.", "halo ≥ r, keep-core, low overhead")
      : halo < r ? tl("The border is thinner than what each point needs to see, so edges come out wrong.", "halo < interaction radius")
      : !keep ? tl("Border results are counted twice and were computed with missing neighbours.", "keep-core rule missing")
      : tl("Correct, but the borders cost too much. Use bigger tiles.", "halo overhead ≈ 4r/T too high")));
}

export const SIMS37 = {
  march: { title: "Find the broken memory cell", goal: "Catch every injected defect, including the heat-sensitive one.", C: March },
  warpsim: { title: "Keep the GPU busy", goal: "Reach at least 95% issue-slot use.", C: WarpSim },
  tiling: { title: "Split a chip layout across a cluster", goal: "Exact answer with under 40% halo overhead.", C: Tiling },
};
