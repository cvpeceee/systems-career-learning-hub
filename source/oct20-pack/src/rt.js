// Runtime bridge: the patched bundle sets globalThis.__APRT to its own React + sim helpers before this plugin runs,
// so these components share the page's single React instance and the exact sim-helper markup the tests expect.
const R = globalThis.__APRT || {};
export function h(type, props, ...children) {
  const p = { ...(props || {}) };
  const key = p.key; delete p.key;
  const kids = children.flat ? children.flat(Infinity).filter((c) => c !== false && c !== null && c !== undefined) : children;
  if (kids.length === 1) p.children = kids[0]; else if (kids.length > 1) p.children = kids;
  return R.jsx(type, p, key === undefined ? undefined : String(key));
}
export const Frag = (p) => R.jsx("div", { className: "ap-frag", children: p.children });
export const useState = (v) => R.useState(v);
export const useMemo = (f, d) => R.useMemo(f, d);
export const useRef = (v) => R.useRef(v);
export const useEffect = (f, d) => R.useEffect(f, d);
export const Slider = R.Slider, Toggle = R.Toggle, Choice = R.Choice, Bar = R.Bar, Verdict = R.Verdict;
// two-layer status: plain sentence first, then the technical term (same component the existing sims use)
export const tl = (plain, term) => R.TL(plain, term);
export const fmt = (x, d = 1) => (Number.isFinite(x) ? x.toLocaleString("en-US", { maximumFractionDigits: d }) : "n/a");
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
