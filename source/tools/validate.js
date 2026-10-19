import { CHAPTERS, SIMS } from "../src/entry.js";
import { PLAIN_O12 } from "../src/plain.js";
import { DRILLS_O12, PLAIN_DRILLS_O12 } from "../src/drills.js";
const Ng = (e) => " " + String(e).toLowerCase().replace(/c\+\+/g, "cpp").replace(/(\d)\.(\d)/g, "$1DOT$2").replace(/[^a-z0-9]+/gi, " ").replace(/dot/gi, ".").trim() + " ";
const Eg = (e, t) => { const a = Ng(e), n = Ng(t).trim(); if (!n) return false; if (n.length <= 3 || /^[\d.]+$/.test(n)) return a.includes(" " + n + " "); return a.includes(" " + n) || a.replace(/ /g, "").includes(n.replace(/ /g, "")); };
const errs = []; let lessons = 0, quiz = 0;
const LF = ["title", "sim", "snippet", "jobs", "concept", "analogy", "language", "primer", "lines", "storyLesson", "exercise", "answerHint", "expected", "modelAnswer", "pitfalls", "probes", "poly", "why", "companies", "myth", "interviewTip", "code"];
for (const c of CHAPTERS) {
  for (const k of ["id", "number", "title", "shortTitle", "duration", "promise", "flowStages", "captions", "phases", "lessons", "lab", "quiz", "interviewRoom"]) if (c[k] === undefined) errs.push(`ch${c.number} missing ${k}`);
  if (c.captions.length !== c.flowStages.length) errs.push(`ch${c.number} captions/flow mismatch`);
  const idx = c.phases.flatMap((p) => p.lessons).sort(); if (idx.join() !== c.lessons.map((_, i) => i).join()) errs.push(`ch${c.number} phases don't cover lessons`);
  if (!PLAIN_O12["lab:" + c.id]) errs.push(`ch${c.number} no lab plain`);
  for (const q of c.quiz) { quiz++; if (!(q.answer >= 0 && q.answer < q.options.length) || !q.explanation) errs.push(`ch${c.number} bad quiz ${q.prompt}`); }
  c.lessons.forEach((l, i) => {
    lessons++;
    for (const k of LF) if (l[k] === undefined || l[k] === "") errs.push(`${c.number}.${i + 1} missing ${k}`);
    if (!SIMS[l.sim]) errs.push(`${c.number}.${i + 1} sim ${l.sim} not registered`);
    if (!PLAIN_O12[l.sim]?.a || !PLAIN_O12[l.sim]?.t) errs.push(`${c.number}.${i + 1} plain missing for ${l.sim}`);
    if (l.storyLesson.sections.length < 3) errs.push(`${c.number}.${i + 1} story short`);
    if (l.primer.terms.length < 5) errs.push(`${c.number}.${i + 1} few terms`);
    const hits = l.expected.filter((k) => Eg(l.modelAnswer, k));
    if (hits.length < Math.max(1, Math.ceil(l.expected.length / 2))) errs.push(`${c.number}.${i + 1} model answer fails grader: ${hits.length}/${l.expected.length}`);
    if (hits.length !== l.expected.length) console.log(`note ${c.number}.${i + 1} model hits ${hits.length}/${l.expected.length}: missing ${l.expected.filter((k) => !Eg(l.modelAnswer, k))}`);
    const wrong = "I don't know"; if (l.expected.filter((k) => Eg(wrong, k)).length >= Math.ceil(l.expected.length / 2)) errs.push(`${c.number}.${i + 1} trivial answer passes`);
  });
}
for (const d of DRILLS_O12) {
  if (!PLAIN_DRILLS_O12["drill:" + d.id]) errs.push(`drill ${d.id} no plain`);
  if (!d.components.some((x) => !x.need)) errs.push(`drill ${d.id} no distractor`);
  if (d.deepdives.length < 3) errs.push(`drill ${d.id} deep dives`);
  const lo = Object.fromEntries(d.numbers.inputs.map((i) => [i.k, i.min])), df = Object.fromEntries(d.numbers.inputs.map((i) => [i.k, i.v]));
  for (const v of [lo, df]) for (const [, x] of d.numbers.calc(v)) if (/NaN|Infinity|undefined/.test(x)) errs.push(`drill ${d.id} bad calc ${x}`);
}
console.log(`chapters ${CHAPTERS.length} lessons ${lessons} quiz ${quiz} sims ${Object.keys(SIMS).length} drills ${DRILLS_O12.length}`);
console.log(errs.length ? errs.join("\n") : "VALID: 0 errors");
