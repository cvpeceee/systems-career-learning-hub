import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function MapSearch() {
  const [cell, setCell] = useState(10000), [n, setN] = useState(400), [grid, setGrid] = useState(false);
  // POIs uniform over 400 km × 400 km; n thousand POIs
  const area = 400000 * 400000, density = (n * 1000) / area;
  const perCell = density * cell * cell;
  const cellsVisited = Math.max(1, Math.ceil(Math.pow(Math.sqrt(1 / Math.max(perCell, 1e-9)) + 1, 2)) * 2 + 7);
  const reads = grid ? cellsVisited * Math.max(1, perCell / 200) : (n * 1000) / 200;
  const ms = reads * 0.08;
  const ram = grid ? Math.ceil(area / (cell * cell)) * 8 / 1024 : 0;
  const ok = grid && ms < 50 && ram < 128;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: POIs spread over a 400 km region, stored on flash at 200 per page (0.08 ms per page). The cell directory uses 8 bytes per cell in RAM."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Use a grid index", value: grid, onChange: setGrid }),
      h(Slider, { label: "Cell size (m)", value: cell, min: 500, max: 50000, step: 500, onChange: setCell }),
      h(Slider, { label: "POIs (thousands)", value: n, min: 10, max: 4000, step: 10, onChange: setN })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Flash pages read per query"), h("dd", null, fmt(reads, 0)), h("dt", null, "Query time"), h("dd", null, `${fmt(ms, 1)} ms`), h("dt", null, "RAM for the cell directory"), h("dd", null, `${fmt(ram, 0)} KB`), h("dt", null, "Answer"), h("dd", null, "exact (ring stop rule)")),
    h(Bar, { label: "Within budget (50 ms, 128 KB)", value: ok ? 100 : clamp(100 - ms, 0, 90), tone: ok ? "good" : "bad", text: ok ? "fits" : "over" }),
    h(Verdict, { ok },
      ok ? tl("Searches touch a few nearby blocks and the index fits in memory.", "grid index, balanced cell size")
      : !grid ? tl("Every search reads every place from flash.", "full scan")
      : ram >= 128 ? tl("Blocks this small need too much memory for the index.", "directory exceeds RAM budget")
      : tl("Blocks this big hold too many places to read per search.", "cells too coarse")));
}

function Mcdc() {
  const [t1, s1] = useState(true), [t2, s2] = useState(true), [t3, s3] = useState(false), [t4, s4] = useState(false), [t5, s5] = useState(false);
  // decision (a && b) || c ; candidate tests
  const T = [["TTF", [1, 1, 0], t1, s1], ["FTF", [0, 1, 0], t2, s2], ["TFF", [1, 0, 0], t3, s3], ["TFT", [1, 0, 1], t4, s4], ["FFF", [0, 0, 0], t5, s5]];
  const d = (v) => (v[0] && v[1]) || v[2];
  const on = T.filter((x) => x[2]);
  const has = [0, 1, 2].map((c) => on.some((a) => on.some((b) => a !== b && a[1].every((v, k) => (k === c) !== (v === b[1][k])) && !!d(a[1]) !== !!d(b[1]))));
  const ok = has.every(Boolean) && on.length === 4;
  return h("div", null,
    h("p", { className: "sim-note" }, "Decision: (a && b) || c. Pick tests (a, b, c values). MC/DC needs a pair for each condition that differs only in it and flips the result."),
    h("div", { className: "sim-row" }, ...T.map((x) => h(Toggle, { label: `${x[0]} → ${d(x[1]) ? "true" : "false"}`, value: x[2], onChange: x[3] }))),
    h("dl", { className: "sim-kv" }, ...["a", "b", "c"].flatMap((c, i) => [h("dt", null, `Condition ${c}`), h("dd", null, has[i] ? "independence shown" : "no pair yet")]), h("dt", null, "Tests used"), h("dd", null, `${on.length} (minimum is 4)`)),
    h(Bar, { label: "MC/DC", value: (has.filter(Boolean).length / 3) * 100, tone: ok ? "good" : "bad", text: `${has.filter(Boolean).length}/3` }),
    h(Verdict, { ok },
      ok ? tl("Every condition is proven to matter, with the fewest tests.", "MC/DC with n+1 tests")
      : has.every(Boolean) ? tl("Coverage is complete, but you're using more tests than needed.", "MC/DC, not minimal")
      : tl("At least one condition hasn't been shown to change the result on its own.", "MC/DC incomplete")));
}

function Bus1553() {
  const [spread, setSpread] = useState(false), [words, setWords] = useState(32), [n10, setN10] = useState(8);
  const t = (w) => 20 * (w + 2) + 16;
  const fast = 10 * t(16); // ten 50 Hz messages each frame
  const slowTotal = n10 * t(words);
  const worst = fast + (spread ? Math.ceil(n10 / 5) * t(words) : slowTotal);
  const cap = 20000 * 0.8;
  const ok = worst <= cap;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 50 Hz minor frames (20 ms). Ten 50 Hz messages of 16 words, plus some 10 Hz messages. Target: under 80% of each frame."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "10 Hz messages", value: n10, min: 0, max: 30, step: 1, onChange: setN10 }),
      h(Slider, { label: "Words per 10 Hz message", value: words, min: 1, max: 32, step: 1, onChange: setWords }),
      h(Toggle, { label: "Spread 10 Hz messages with offsets", value: spread, onChange: setSpread })),
    h("dl", { className: "sim-kv" }, h("dt", null, "One 32-word message"), h("dd", null, `${t(32)} µs`), h("dt", null, "Worst minor frame"), h("dd", null, `${fmt(worst / 1000, 2)} ms of 20 ms`)),
    h(Bar, { label: "Worst-frame load", value: clamp((worst / 20000) * 100, 0, 100), tone: ok ? "good" : "bad", text: `${fmt((worst / 20000) * 100, 0)}%` }),
    h(Verdict, { ok },
      ok ? tl("Every slot finishes with time to spare for retries.", "schedule fits with margin")
      : !spread ? tl("All the slow messages are stacked in the same slot. Spread them out.", "offsets all 0")
      : tl("Even spread out, there's too much traffic. Shorten or slow some messages.", "bus over capacity")));
}

export const SIMS41 = {
  mapsearch: { title: "Fast map search on a watch", goal: "Under 50 ms per query with under 128 KB of index RAM.", C: MapSearch },
  mcdc: { title: "Prove every condition matters", goal: "MC/DC for (a && b) || c with exactly 4 tests.", C: Mcdc },
  bus1553: { title: "Fit the bus timetable", goal: "Every minor frame under 80% load.", C: Bus1553 },
};
