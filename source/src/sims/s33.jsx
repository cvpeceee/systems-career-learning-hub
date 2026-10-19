import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function BuildCache() {
  const [stamp, setStamp] = useState(true), [paths, setPaths] = useState(true), [pin, setPin] = useState(false), [laptops, setLaptops] = useState(true), [declared, setDeclared] = useState(false), [changed, setChanged] = useState(5);
  let hit = (100 - changed) / 100;
  if (stamp) hit *= 0.35;
  if (paths) hit *= 0.6;
  if (!pin) hit *= 0.85;
  const poison = (laptops ? 1 : 0) + (declared ? 0 : 1);
  const ci = 4 + 26 * (1 - hit);
  const ok = hit >= 0.8 && poison === 0;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a 30-minute uncached CI build. Each hidden input cuts the hit rate; untrusted writers and undeclared inputs risk wrong results."),
    h(Slider, { label: "Share of code changed per commit (%)", value: changed, min: 1, max: 50, step: 1, onChange: setChanged }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Build time stamped into a header", value: stamp, onChange: setStamp }),
      h(Toggle, { label: "Absolute paths in compiler flags", value: paths, onChange: setPaths }),
      h(Toggle, { label: "Toolchain pinned by digest", value: pin, onChange: setPin })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Laptops can write to the cache", value: laptops, onChange: setLaptops }),
      h(Toggle, { label: "All inputs declared (sandboxed)", value: declared, onChange: setDeclared })),
    h(Bar, { label: "Cache hit rate", value: hit * 100, tone: hit >= 0.8 ? "good" : "bad", text: `${fmt(hit * 100, 0)}%` }),
    h(Bar, { label: "Typical CI time", value: ci / 30 * 100, tone: ci <= 10 ? "good" : "bad", text: `${fmt(ci, 0)} min` }),
    h(Verdict, { ok },
      ok ? tl("Builds reuse almost everything, and stored results can be trusted.", "hermetic actions, trusted writers")
      : poison ? tl("The cache could hand back a wrong result. Only let CI write, and declare every input.", "cache poisoning risk")
      : tl("Something changes every build, so results are rarely reused. Remove the changing inputs.", "non-hermetic inputs lower hit rate")));
}

function MergeQ() {
  const [p, setP] = useState(5), [B, setB] = useState(1), [queue, setQueue] = useState(false), [spec, setSpec] = useState(1);
  const pass = Math.pow(1 - p / 100, B);
  const runsPer = B > 1 ? (1 + (1 - pass) * Math.log2(B) * 2) / B : 1;
  const perHour = (60 / 20) * spec / Math.max(runsPer, 0.05) * (spec > 1 ? 0.85 : 1);
  const t75 = queue ? clamp(30 * (40 / Math.max(perHour, 1)), 20, 600) : 25;
  const breaks = queue ? 0 : 3;
  const ok = queue && t75 <= 60 && perHour >= 15;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 40 approved changes per hour, 20-minute CI runs. Without a queue, interacting changes break main about 3 times a day."),
    h(Toggle, { label: "Use a merge queue", value: queue, onChange: setQueue }),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Changes that fail CI (%)", value: p, min: 1, max: 30, step: 1, onChange: setP }),
      h(Slider, { label: "Batch size", value: B, min: 1, max: 16, step: 1, onChange: setB }),
      h(Slider, { label: "Batches tested in parallel", value: spec, min: 1, max: 4, step: 1, onChange: setSpec })),
    h("dl", { className: "sim-kv" },
      h("dt", null, "Batch pass chance"), h("dd", null, `${fmt(pass * 100, 0)}%`),
      h("dt", null, "Changes landed per hour"), h("dd", null, queue ? fmt(perHour, 0) : "no limit (no queue)"),
      h("dt", null, "Main breaks per day"), h("dd", null, String(breaks))),
    h(Bar, { label: "p75 time to land", value: clamp(t75 / 240, 0, 1) * 100, tone: t75 <= 60 ? "good" : "bad", text: `${fmt(t75, 0)} min` }),
    h(Verdict, { ok },
      ok ? tl("Main stays working and changes still land within the hour.", "batched queue keeps up")
      : !queue ? tl("Changes that work alone still break the shared code together.", "no merge queue: main breaks")
      : perHour < 15 ? tl("The line moves too slowly. Test changes in groups or run groups side by side.", "queue throughput too low")
      : tl("Groups fail too often and splitting them takes time. Use smaller groups.", "batch too large for failure rate")));
}

function Flaky() {
  const [retries, setRetries] = useState(3), [quar, setQuar] = useState(false), [owners, setOwners] = useState(false), [minRuns, setMinRuns] = useState(5);
  const flakyTests = 140;
  const hidden = retries >= 2 ? 0.6 : retries === 1 ? 0.2 : 0;
  const falseQ = minRuns < 15 ? (15 - minRuns) * 2 : 0;
  const blockRate = quar ? 1 : retries === 0 ? 12 : retries === 1 ? 5 : 2;
  const fixed = quar && owners ? 0.7 : quar ? 0.15 : 0.05;
  const ok = quar && owners && retries <= 1 && falseQ === 0;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: 140 flaky tests in a large repository, plus a few real intermittent bugs that retries can hide."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Automatic retries", value: retries, min: 0, max: 5, step: 1, onChange: setRetries }),
      h(Slider, { label: "Commits seen before quarantine", value: minRuns, min: 1, max: 40, step: 1, onChange: setMinRuns })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Quarantine flaky tests", value: quar, onChange: setQuar }),
      h(Toggle, { label: "Owner and deadline per quarantined test", value: owners, onChange: setOwners })),
    h(Bar, { label: "Merges blocked by flakes", value: blockRate / 12 * 100, tone: blockRate <= 2 ? "good" : "bad", text: `${blockRate}%` }),
    h(Bar, { label: "Real intermittent bugs hidden", value: hidden * 100, tone: hidden <= 0.2 ? "good" : "bad", text: `${fmt(hidden * 100, 0)}%` }),
    h(Bar, { label: "Flaky tests fixed in 60 days", value: fixed * 100, tone: fixed >= 0.5 ? "good" : "bad", text: `${fmt(fixed * flakyTests, 0)} of ${flakyTests}` }),
    h(Bar, { label: "Good tests wrongly quarantined", value: clamp(falseQ * 3, 0, 100), tone: falseQ === 0 ? "good" : "bad", text: `${falseQ}` }),
    h(Verdict, { ok },
      ok ? tl("Unreliable tests stop blocking work, real bugs stay visible, and someone fixes each one.", "quarantine + ownership + ≤1 retry")
      : retries > 1 ? tl("Retrying many times hides real bugs. Retry once at most.", "excessive retries mask failures")
      : !quar ? tl("Unreliable tests still block people. Set them aside while they're fixed.", "no quarantine")
      : !owners ? tl("Set-aside tests are never fixed. Give each an owner and a date.", "quarantine without ownership")
      : tl("You're judging tests on too little evidence. Wait for more runs.", "minimum sample too small")));
}

function Trigram() {
  const [files, setFiles] = useState(200000), [q, setQ] = useState("mu"), [index, setIndex] = useState(false), [verify, setVerify] = useState(false), [shards, setShards] = useState(1);
  const qlen = q.length;
  const sel = qlen < 3 ? 1 : Math.pow(0.08, Math.min(qlen - 2, 4));
  const cand = index ? Math.max(1, files * sel) : files;
  const real = Math.max(0, Math.round(files * Math.pow(0.08, Math.min(qlen - 2, 5)) * 0.3));
  const ms = (index ? 2 : 0) + cand * 0.05 / shards;
  const fp = index && !verify ? Math.max(0, Math.round(cand) - real) : 0;
  const ok = index && verify && qlen >= 3 && ms <= 200;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: each extra character of query keeps about 8% of candidate files. Checking one file costs 0.05 ms."),
    h(Slider, { label: "Files in the repository", value: files, min: 10000, max: 2000000, step: 10000, onChange: setFiles }),
    h(Choice, { label: "Query", value: q, onChange: setQ, options: [{ v: "mu", l: "mu" }, { v: "mute", l: "mute" }, { v: "mutex_lo", l: "mutex_lo" }, { v: "mutex_lock(", l: "mutex_lock(" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Trigram index", value: index, onChange: setIndex }),
      h(Toggle, { label: "Verify candidates", value: verify, onChange: setVerify }),
      h(Slider, { label: "Shards searched in parallel", value: shards, min: 1, max: 32, step: 1, onChange: setShards })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Files checked"), h("dd", null, fmt(cand, 0)), h("dt", null, "Wrong results shown"), h("dd", null, fmt(fp, 0))),
    h(Bar, { label: "Query time", value: clamp(ms / 2000, 0, 1) * 100, tone: ms <= 200 ? "good" : "bad", text: ms >= 1000 ? `${fmt(ms / 1000, 1)} s` : `${fmt(ms, 0)} ms` }),
    h(Verdict, { ok },
      ok ? tl("Results come back fast and every one is a real match.", "index + verification")
      : !index ? tl("Every file is read for every search. Build an index of three-letter pieces.", "full scan")
      : !verify ? tl("Some results only contain the pieces, not the phrase. Check each one.", "unverified candidates (false positives)")
      : qlen < 3 ? tl("The search is too short to use the index. Type more.", "query shorter than a trigram")
      : tl("Too slow still. Split the index across more machines.", "add shards")));
}

export const SIMS33 = {
  buildcache: { title: "Make the build cache work", goal: "Reach an 80% hit rate with no risk of wrong cached results.", C: BuildCache },
  mergeq: { title: "Tune a merge queue", goal: "Keep main green and p75 time to land under an hour.", C: MergeQ },
  flaky: { title: "Tame flaky tests", goal: "Stop flakes from blocking merges without hiding real bugs, and get them fixed.", C: Flaky },
  trigram: { title: "Instant code search", goal: "Return only real matches in under 200 ms.", C: Trigram },
};
