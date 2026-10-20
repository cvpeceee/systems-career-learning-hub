// Oct 20 plugin. Runs AFTER austin-pack, oct11-pack and oct12-pack inside the same bundle and extends their globals.
import { CH37 } from "./data/ch37.js";
import { SIMS37 } from "./sims/s37.jsx";
import { CH38 } from "./data/ch38.js";
import { SIMS38 } from "./sims/s38.jsx";
import { CH39 } from "./data/ch39.js";
import { SIMS39 } from "./sims/s39.jsx";
import { CH40 } from "./data/ch40.js";
import { SIMS40 } from "./sims/s40.jsx";
import { CH41 } from "./data/ch41.js";
import { SIMS41 } from "./sims/s41.jsx";
import { PLAIN_O20 } from "./plain.js";

export const CHAPTERS = [CH37, CH38, CH39, CH40, CH41];
export const SIMS = { ...SIMS37, ...SIMS38, ...SIMS39, ...SIMS40, ...SIMS41 };
const g = globalThis;
g.__AP_CH = [...(g.__AP_CH || []), ...CHAPTERS];
g.__AP_SIMS = { ...(g.__AP_SIMS || {}), ...SIMS };
g.__AP_PLAIN = { ...(g.__AP_PLAIN || {}), ...PLAIN_O20 };
if (!g.__apGl) g.__apGl = (l) => l;
