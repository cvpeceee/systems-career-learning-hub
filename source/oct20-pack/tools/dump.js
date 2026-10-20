import { CHAPTERS } from "../src/entry.js";
import { PLAIN_O20 as PLAIN_O12 } from "../src/plain.js";
const DRILLS_O12 = [], PLAIN_DRILLS_O12 = {};
import { readFileSync, readdirSync, writeFileSync } from "fs";
const tls = [];
for (const f of readdirSync("src/sims")) {
  const s = readFileSync("src/sims/" + f, "utf8");
  const re = /tl\(\s*(["`])((?:\\.|(?!\1).)*)\1/gs; let m;
  while ((m = re.exec(s))) tls.push({ file: f, text: m[2].replace(/\$\{[^}]*\}/g, "N") });
}
const out = { chapters: CHAPTERS.map((c) => ({ number: c.number, captions: c.captions, promise: c.promise, lessons: c.lessons.map((l) => ({ title: l.title, primer: l.primer, concept: l.concept, analogy: l.analogy })) })), plain: { ...PLAIN_O12, ...PLAIN_DRILLS_O12 }, tls, drills: DRILLS_O12.map((d) => ({ id: d.id, prompt: d.prompt })) };
writeFileSync("out/dump.json", JSON.stringify(out, null, 1)); console.log("tl strings", tls.length);
