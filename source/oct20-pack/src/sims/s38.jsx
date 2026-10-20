import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function Distro() {
  const [check, setCheck] = useState(false), [sign, setSign] = useState(false), [rb, setRb] = useState(false), [ab, setAb] = useState(false);
  const score = (check ? 25 : 0) + (sign ? 25 : 0) + (rb ? 25 : 0) + (ab ? 25 : 0);
  const ok = score === 100;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: shipping a kernel security fix to an air-gapped site. The fix's config fragment enables an option whose dependency is off in the base config."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Fail build if a requested CONFIG_ option didn't survive", value: check, onChange: setCheck }),
      h(Toggle, { label: "Signed bundle, verified on site", value: sign, onChange: setSign })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Reject bundles older than installed", value: rb, onChange: setRb }),
      h(Toggle, { label: "A/B image with canary and automatic fallback", value: ab, onChange: setAb })),
    h("dl", { className: "sim-kv" },
      h("dt", null, "Security option actually on"), h("dd", null, check ? "yes (dependency fixed before release)" : "no: silently dropped"),
      h("dt", null, "Tampered bundle"), h("dd", null, sign ? "rejected" : "installed"),
      h("dt", null, "Old vulnerable bundle replayed"), h("dd", null, rb ? "rejected" : "installed"),
      h("dt", null, "Bad kernel"), h("dd", null, ab ? "rolls back by itself" : "node stuck until someone visits")),
    h(Bar, { label: "Update safety", value: score, tone: ok ? "good" : "bad", text: `${score}%` }),
    h(Verdict, { ok },
      ok ? tl("The fix really is in the kernel, only trusted bundles install, and a bad kernel undoes itself.", "verified config + signed, monotonic bundles + A/B")
      : !check ? tl("The build succeeded, but the security setting you asked for was quietly dropped.", "requested ≠ final .config")
      : !sign ? tl("Anyone with access to the transfer could swap the update.", "unsigned bundle")
      : !rb ? tl("An attacker could reinstall an older, vulnerable update.", "no rollback protection")
      : tl("If the new kernel won't boot, there's no automatic way back.", "no A/B fallback")));
}

function Vxlan() {
  const [under, setUnder] = useState(1500), [inner, setInner] = useState(1500);
  const need = inner + 50, ok = need <= under;
  return h("div", null,
    h("p", { className: "sim-note" }, "VXLAN over IPv4 adds 50 bytes: outer IPv4 20 + UDP 8 + VXLAN 8 + inner Ethernet header 14."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Underlay (physical) MTU", value: under, min: 1500, max: 9000, step: 50, onChange: setUnder }),
      h(Slider, { label: "VM interface MTU", value: inner, min: 1200, max: 9000, step: 10, onChange: setInner })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Outer packet for a full-size frame"), h("dd", null, `${fmt(need, 0)} bytes`), h("dt", null, "Largest VM MTU that fits"), h("dd", null, `${fmt(under - 50, 0)} bytes`), h("dt", null, "Ping and SSH login"), h("dd", null, "work"), h("dt", null, "Large transfers"), h("dd", null, ok ? "work" : "hang (dropped, ICMP never reaches the VM)")),
    h(Bar, { label: "Headroom", value: clamp(((under - need) / under) * 100 + 50, 0, 100), tone: ok ? "good" : "bad", text: ok ? `${under - need} bytes spare` : `${need - under} bytes too big` }),
    h(Verdict, { ok },
      ok ? tl("Full-size packets fit inside the outer envelope.", "inner MTU + 50 ≤ underlay MTU")
      : tl("Small packets work and big ones vanish. Shrink the inner packet size limit to 1450 or use jumbo frames underneath.", "MTU black hole")));
}

function Sensor() {
  const [validate, setValidate] = useState(false), [bounds, setBounds] = useState(false), [rings, setRings] = useState(false), [fallback, setFallback] = useState(false);
  const crashes = validate ? 0 : bounds ? 0 : rings ? 0.5 : 100;
  const ok = validate && bounds && rings && fallback;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a new rule template references field 21; the deployed sensor supplies 20. Percent of the fleet that crashes."),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Validate field references per sensor version", value: validate, onChange: setValidate }),
      h(Toggle, { label: "Bounds checks in the interpreter", value: bounds, onChange: setBounds })),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Staged rings (internal → canary → wider)", value: rings, onChange: setRings }),
      h(Toggle, { label: "Fall back to last good content after repeat crashes", value: fallback, onChange: setFallback })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Machines that crash"), h("dd", null, `${fmt(crashes, 1)}% of the fleet`), h("dt", null, "Recovery"), h("dd", null, fallback ? "automatic on next boot" : "manual, machine by machine")),
    h(Bar, { label: "Fleet protected", value: 100 - crashes, tone: ok ? "good" : "bad", text: `${fmt(100 - crashes, 1)}%` }),
    h(Verdict, { ok },
      ok ? tl("The bad rule is rejected before release, and every other layer would still catch it.", "defence in depth for content")
      : crashes >= 100 ? tl("The faulty rule reaches every machine at once and crashes it.", "no validation, no bounds check, global rollout")
      : !validate ? tl("Something catches it, but the bad rule should never have been released.", "validator missing")
      : tl("Add the remaining layers so one missed check can't take the fleet down.", "single layer of defence")));
}

export const SIMS38 = {
  distro: { title: "Ship a kernel fix to an offline site", goal: "The fix is really applied, only trusted bundles install, and bad kernels roll back.", C: Distro },
  vxlan: { title: "Make big packets fit the tunnel", goal: "Full-size VM packets cross the overlay.", C: Vxlan },
  sensor: { title: "Release a detection rule safely", goal: "Zero crashes and automatic recovery.", C: Sensor },
};
