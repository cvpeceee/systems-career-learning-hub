import { h, useState, Slider, Toggle, Choice, Bar, Verdict, tl, fmt, clamp } from "../rt.js";

function BootPath() {
  const [bad, setBad] = useState("modem"), [tries, setTries] = useState(0), [health, setHealth] = useState("kernel"), [floor, setFloor] = useState("install"), [defer, setDefer] = useState(false);
  const notBoot = bad === "kernel";
  const markedGood = bad === "none" ? true : notBoot ? false : health === "kernel";
  const rollsBack = !markedGood && tries > 0;
  const stuck = !markedGood && tries === 0;
  const brokenInField = bad !== "none" && (markedGood || stuck);
  const floorBlocks = floor === "install" && rollsBack;
  const bootMs = 900 + (health === "full" ? 900 : 0) - (defer ? 700 : 0);
  const ok = !brokenInField && !floorBlocks && tries > 0 && bootMs <= 2000 && health === "full";
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: an OTA writes slot B. Pick what's wrong with the new image and how the boot logic is configured. Critical services must be up within 2 seconds."),
    h(Choice, { label: "New image problem", value: bad, onChange: setBad, options: [{ v: "none", l: "None" }, { v: "kernel", l: "Kernel won't boot" }, { v: "modem", l: "Boots, but no network" }] }),
    h(Slider, { label: "Tries for a new slot", value: tries, min: 0, max: 5, step: 1, onChange: setTries }),
    h(Choice, { label: "Mark successful when", value: health, onChange: setHealth, options: [{ v: "kernel", l: "Kernel reaches user space" }, { v: "full", l: "Services + modem link check pass" }] }),
    h(Choice, { label: "Raise anti-rollback floor", value: floor, onChange: setFloor, options: [{ v: "install", l: "At install" }, { v: "good", l: "After mark-successful" }] }),
    h(Toggle, { label: "Defer non-critical checks past the fast path", value: defer, onChange: setDefer }),
    h("dl", { className: "sim-kv" }, h("dt", null, "Outcome"), h("dd", null, brokenInField ? (stuck ? "stuck on the broken slot" : "broken slot accepted as good") : floorBlocks ? "fallback refused by version floor" : rollsBack ? "rolled back to slot A" : "slot B running")),
    h(Bar, { label: "Time to critical services", value: clamp(bootMs / 3000, 0, 1) * 100, tone: bootMs <= 2000 ? "good" : "bad", text: `${bootMs} ms` }),
    h(Verdict, { ok },
      ok ? tl("Any bad new version is reversed by itself, and the car is ready on time.", "A/B with health-gated success")
      : tries === 0 ? tl("With no retry limit set up, a bad copy is never given up on.", "no try counter")
      : health !== "full" ? tl("A copy that starts but can't connect is wrongly accepted. Check the network too.", "success marked too early")
      : floorBlocks ? tl("The safety floor rose too early and now blocks going back.", "anti-rollback raised before success")
      : tl("The extra checks make start-up too slow. Move non-urgent ones later.", "boot-time budget exceeded")));
}

function NandBoot() {
  const [years, setYears] = useState(8), [temp, setTemp] = useState(85), [copies, setCopies] = useState(1), [scrub, setScrub] = useState(false), [ecc, setEcc] = useState(8);
  const accel = Math.pow(2, (temp - 40) / 10);
  const flips = years * 0.15 * accel * (scrub ? 0.12 : 1);
  const pCopy = clamp(Math.pow(flips / ecc, 3) * 0.5, 0, 1);
  const pFail = Math.pow(pCopy, copies);
  const ok = pFail < 0.001 && years >= 10;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: bit errors in the boot block grow with age and double every 10 °C. Scrubbing rewrites the block before errors pile up."),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Vehicle age (years)", value: years, min: 1, max: 15, step: 1, onChange: setYears }),
      h(Slider, { label: "Typical hot-soak temperature (°C)", value: temp, min: 40, max: 105, step: 5, onChange: setTemp }),
      h(Slider, { label: "Bits ECC can correct", value: ecc, min: 4, max: 24, step: 4, onChange: setEcc })),
    h("div", { className: "sim-row" },
      h(Slider, { label: "Copies of the first boot stage", value: copies, min: 1, max: 4, step: 1, onChange: setCopies }),
      h(Toggle, { label: "Background scrubbing", value: scrub, onChange: setScrub })),
    h("dl", { className: "sim-kv" }, h("dt", null, "Bit errors per chunk"), h("dd", null, fmt(flips, 1))),
    h(Bar, { label: "Units that fail to boot", value: clamp(pFail * 100, 0, 100), tone: pFail < 0.001 ? "good" : "bad", text: pFail < 0.0001 ? "< 0.01%" : `${fmt(pFail * 100, 2)}%` }),
    h(Verdict, { ok },
      ok ? tl("Cars still start after many hot years.", "margin held by copies + scrubbing")
      : years < 10 ? tl("Look further ahead: cars last more than ten years.", "check the full vehicle lifetime")
      : !scrub ? tl("Weak data is never refreshed, so errors pile up. Rewrite it in the background.", "no scrubbing")
      : copies < 2 ? tl("One unreadable copy means no start. Keep spares.", "single boot copy")
      : tl("Still too many failures. Use stronger error correction.", "ECC too weak")));
}

function Verity() {
  const [where, setWhere] = useState("disk"), [tamper, setTamper] = useState("block"), [ro, setRo] = useState(true), [verity, setVerity] = useState(false), [fde, setFde] = useState(false);
  let caught;
  if (tamper === "none") caught = true;
  else if (tamper === "block" || tamper === "tree") caught = verity && where === "signed";
  else caught = fde;
  const detail = tamper === "data" ? "settings file changed on the data partition" : tamper === "tree" ? "attacker rewrote a block and rebuilt the hash tree" : tamper === "block" ? "one block of the system disk changed" : "no tampering";
  const ok = verity && where === "signed" && fde && (tamper === "none" || caught);
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: an attacker with physical access to the flash. Pick what they change and which protections exist."),
    h(Choice, { label: "Attacker changes", value: tamper, onChange: setTamper, options: [{ v: "none", l: "Nothing" }, { v: "block", l: "A system block" }, { v: "tree", l: "A block and the hash tree" }, { v: "data", l: "Data partition" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Read-only system mount", value: ro, onChange: setRo }),
      h(Toggle, { label: "dm-verity", value: verity, onChange: setVerity }),
      h(Toggle, { label: "Encrypted, device-bound data partition", value: fde, onChange: setFde })),
    h(Choice, { label: "Root hash comes from", value: where, onChange: setWhere, options: [{ v: "disk", l: "The system disk" }, { v: "signed", l: "Signed boot data" }] }),
    h("dl", { className: "sim-kv" }, h("dt", null, "Attack"), h("dd", null, detail), h("dt", null, "Detected or blocked"), h("dd", null, caught ? "yes" : "no")),
    h(Bar, { label: "Protection coverage", value: (verity ? 35 : 0) + (where === "signed" ? 30 : 0) + (fde ? 35 : 0), tone: ok ? "good" : "bad", text: ok ? "complete" : "gaps" }),
    h(Verdict, { ok },
      ok ? tl("Changes to the system are caught on read, and private data can't be altered unnoticed.", "verity with signed root + FDE")
      : !verity ? tl(ro ? "Read-only only stops normal writes. Someone with the chip can still change it." : "Nothing checks the system disk at all.", "no runtime integrity")
      : where !== "signed" ? tl("The attacker can rebuild the fingerprints too. Keep the top one in signed data.", "root hash not anchored to trust")
      : tl("The writable data has no protection. Encrypt it with a key bound to the device.", "no data-partition protection")));
}

function Fusion() {
  const [order, setOrder] = useState("plain"), [cpu, setCpu] = useState("arm"), [seq, setSeq] = useState(false), [timeout, setTimeout_] = useState(false), [crash, setCrash] = useState(false);
  const raceOn = order === "plain" && cpu === "arm";
  const corrupt = raceOn ? 1.2 : 0;
  const hang = crash && !timeout;
  const silentLoss = crash && !seq;
  const ok = !raceOn && order === "relacq" && seq && timeout;
  return h("div", null,
    h("p", { className: "sim-note" }, "Teaching model: a shared-memory ring between the main processor and the modem, a million messages per day per unit."),
    h(Choice, { label: "Index updates", value: order, onChange: setOrder, options: [{ v: "plain", l: "Plain variables" }, { v: "relacq", l: "Release store / acquire load" }] }),
    h(Choice, { label: "Processor", value: cpu, onChange: setCpu, options: [{ v: "x86", l: "x86 test bench" }, { v: "arm", l: "ARM unit" }] }),
    h("div", { className: "sim-row" },
      h(Toggle, { label: "Sequence numbers", value: seq, onChange: setSeq }),
      h(Toggle, { label: "Timeouts and reset handshake", value: timeout, onChange: setTimeout_ }),
      h(Toggle, { label: "Modem crashes mid-stream", value: crash, onChange: setCrash })),
    h(Bar, { label: "Corrupted messages per day per 1,000 units", value: corrupt / 1.2 * 100, tone: corrupt ? "bad" : "good", text: fmt(corrupt, 1) }),
    h("dl", { className: "sim-kv" }, h("dt", null, "On modem crash"), h("dd", null, !crash ? "n/a" : hang ? "main processor hangs" : silentLoss ? "messages lost silently" : "detected, ring reset, link restored")),
    h(Verdict, { ok },
      ok ? tl("Messages arrive whole, and a modem crash is spotted and recovered.", "correct ordering + framing + recovery")
      : order === "plain" ? tl(cpu === "x86" ? "Looks fine here, but ARM chips can reorder the writes. Use ordered updates." : "The reader sometimes sees the marker before the message. Use ordered updates.", "missing release/acquire")
      : !seq ? tl("Lost messages go unnoticed. Number each one.", "no sequence numbers")
      : tl("A dead network chip would leave the other chip waiting forever. Add time limits.", "no link recovery")));
}

export const SIMS34 = {
  bootpath: { title: "Make OTA updates unbrickable", goal: "Every bad update rolls itself back and critical services start within 2 seconds.", C: BootPath },
  nandboot: { title: "Boot from aging NAND", goal: "Keep boot failures under 0.1% after 10+ hot years.", C: NandBoot },
  verity: { title: "Prove the disk wasn't changed", goal: "Catch system-disk tampering and protect writable data.", C: Verity },
  fusion: { title: "A reliable link to the modem", goal: "No corrupted messages on ARM, and clean recovery from a modem crash.", C: Fusion },
};
