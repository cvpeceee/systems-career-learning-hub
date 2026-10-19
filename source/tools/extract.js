import { CHAPTERS } from "../src/entry.js";
import { writeFileSync } from "fs";
for (const c of CHAPTERS) for (const l of c.lessons) writeFileSync(`snippets/${l.snippet}`, l.code + "\n");
console.log("ok");
