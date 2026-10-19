// Oct 12 plugin. Runs AFTER the austin-pack and oct11-pack plugins inside the same bundle and extends their globals.
import { CH31 } from "./data/ch31.js";
import { SIMS31 } from "./sims/s31.jsx";
import { CH32 } from "./data/ch32.js";
import { SIMS32 } from "./sims/s32.jsx";
import { CH33 } from "./data/ch33.js";
import { SIMS33 } from "./sims/s33.jsx";
import { CH34 } from "./data/ch34.js";
import { SIMS34 } from "./sims/s34.jsx";
import { CH35 } from "./data/ch35.js";
import { SIMS35 } from "./sims/s35.jsx";
import { CH36 } from "./data/ch36.js";
import { SIMS36 } from "./sims/s36.jsx";
import { PLAIN_O12 } from "./plain.js";
import { DRILLS_O12, PLAIN_DRILLS_O12 } from "./drills.js";

export const CHAPTERS = [CH31, CH32, CH33, CH34, CH35, CH36];
export const SIMS = { ...SIMS31, ...SIMS32, ...SIMS33, ...SIMS34, ...SIMS35, ...SIMS36 };
const g = globalThis;
g.__AP_CH = [...(g.__AP_CH || []), ...CHAPTERS];
g.__AP_SIMS = { ...(g.__AP_SIMS || {}), ...SIMS };
g.__AP_PLAIN = { ...(g.__AP_PLAIN || {}), ...PLAIN_O12, ...PLAIN_DRILLS_O12 };
const prevTesla = g.__apTesla || ((T) => T);
g.__apTesla = (T) => {
  T = prevTesla(T);
  if (T && Array.isArray(T.drills)) for (const d of DRILLS_O12) if (!T.drills.some((x) => x.id === d.id)) T.drills.push(d);
  return T;
};
if (!g.__apGl) g.__apGl = (l) => l;
