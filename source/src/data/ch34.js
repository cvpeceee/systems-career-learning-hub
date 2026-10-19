import { chapter } from "../helpers.js";
import { L34 } from "./ch34l.js";

export const CH34 = chapter({
  id: "telematics-platform", number: 34, title: "Automotive Telematics Platform: A/B Boot, NAND Reliability, Verified Integrity & AP–Modem Links", shortTitle: "Telematics Platform",
  duration: "8–10 hours", leverage: false,
  promise: "Own an automotive embedded Linux platform end to end: updates that can't brick a car, flash that survives fifteen hot summers, a verified chain of trust, and a reliable link to the modem.",
  diagram: "flow", flowStages: ["ROM", "bootloader", "kernel", "rootfs", "modem link", "OTA"],
  captions: [
    "Unchangeable chip code checks the first loader (root of trust).",
    "The loader picks a copy and checks the next stage (A/B slots, signatures).",
    "Linux starts within the time budget (boot-time).",
    "The system disk is checked block by block (dm-verity).",
    "The main chip talks to the mobile chip (shared-memory rings).",
    "Updates arrive and can always be undone (OTA, rollback).",
  ],
  phases: [
    { label: "Boot", title: "Never brick a car", detail: "A/B slots, tries, rollback, anti-rollback, boot-time budgets.", lessons: [0] },
    { label: "Storage", title: "Flash that lasts", detail: "Bad blocks, ECC, read disturb, retention, redundant boot copies.", lessons: [1] },
    { label: "Trust", title: "Prove what's running", detail: "Chain of trust, Merkle verity, encryption, MAC, TARA.", lessons: [2] },
    { label: "Link", title: "Talk to the modem", detail: "SPSC rings, release/acquire, framing, recovery.", lessons: [3] },
  ],
  lessons: [...L34],
  lab: {
    title: "Capstone: telematics platform architecture review",
    brief: "Write the architecture document a senior staff engineer would present at a platform design review.",
    steps: [
      "Boot chain from ROM to user space, with signatures and timings",
      "Update path: A/B layout, OTA flow, health checks, rollback and recovery",
      "Storage: flash type, ECC, bad blocks, scrubbing, partition layout",
      "Security: verity, encryption, MAC, keys, and the TARA summary",
      "AP–modem interface: transport, messaging, recovery, power states",
    ],
    doneWhen: "Each section names its failure modes and how they're tested, and the boot-time budget adds up.",
    starterLang: "Markdown · architecture review",
    starter: `# Telematics platform architecture
## Boot chain and timing
## Updates and recovery
## Storage
## Security and TARA
## AP–modem interface
## Test plan`,
  },
  quiz: [
    { prompt: "When does the bootloader decrement a new slot's tries?", options: ["After a failure", "Before booting it", "Never", "After mark-successful"], answer: 1, explanation: "So hangs still count." },
    { prompt: "Anti-rollback stops…", options: ["Any rollback", "Booting older signed images with known flaws", "OTA updates", "Recovery mode"], answer: 1, explanation: "It enforces a minimum security version." },
    { prompt: "Scrubbing NAND means…", options: ["Erasing everything", "Rewriting weakening data before it's uncorrectable", "Formatting bad blocks", "Encrypting data"], answer: 1, explanation: "Keep a safety margin." },
    { prompt: "dm-verity's root hash should come from…", options: ["The same disk", "Signed boot data", "The network", "A config file"], answer: 1, explanation: "Otherwise attackers recompute it." },
    { prompt: "A Merkle tree lets you…", options: ["Encrypt blocks", "Verify one block without reading all", "Compress data", "Skip signatures"], answer: 1, explanation: "Only the path to the root is needed." },
    { prompt: "In an SPSC ring, the producer publishes head with…", options: ["A relaxed store", "A release store", "A lock", "volatile"], answer: 1, explanation: "Pairs with the consumer's acquire." },
    { prompt: "Scenario: units boot but lose network after an OTA, and never roll back. Fix?", options: ["Bigger flash", "Mark successful only after a modem health check", "Disable OTA", "More tries"], answer: 1, explanation: "Booting isn't working.", scenario: true },
    { prompt: "Scenario: hot-climate cars fail to boot after four years. Likely cause?", options: ["Kernel bug", "NAND retention loss on a single boot copy", "Bad modem", "Wrong time zone"], answer: 1, explanation: "Heat speeds charge loss.", scenario: true },
  ],
  interviewRoom: {
    title: "Telematics platform senior staff interview room",
    intro: "Modeled on the Qualcomm Senior Staff Engineer posting for the automotive telematics embedded Linux platform (POSTED; the exact match to the screenshot is INFERRED, see the research file). Qualcomm's interview format is not published for this role; public candidate reports describe technical phone screens and a panel with embedded C and system questions (PUBLIC, unofficial).",
    questions: [
      { prompt: "Design · Architect boot, update and recovery for a telematics unit with a 2-second critical-service budget.", answer: "ROM → signed bootloader with A/B and tries → kernel with minimal drivers → early critical services → verity rootfs; health-based mark-successful; recovery image; stage timing budget per step; deferred non-critical init." },
      { prompt: "Storage · Raw NAND or eMMC, and how do you make it last 15 years?", answer: "Trade cost and control; ECC strength, bad-block management, redundant boot copies, scrubbing, wear leveling (UBI), power-loss safety, accelerated aging tests and field telemetry." },
      { prompt: "Security · Walk through your TARA for the OTA path.", answer: "Assets (images, keys), threats (tampering, downgrade, man-in-the-middle, physical access), controls (signatures, anti-rollback, TLS, verity, secure key storage), residual risk and test evidence." },
      { prompt: "Fusion · The modem crashes during a call. What happens on the AP?", answer: "Timeouts detect it; the link layer resets rings with a new epoch; the modem service restarts the modem, re-registers; the emergency call path has priority; telemetry records the event." },
      { prompt: "Leadership · How do you drive a platform decision across hardware, modem and app teams?", answer: "Write the options with data, hold a design review, record the decision and its owner, and revisit with measurements." },
    ],
    tasks: [
      { title: "45 minutes · Embedded C", prompt: "Implement register bitfield helpers and a packed message header with CRC-32, with tests.", rubric: ["Correct masks and shifts", "Endianness handled", "CRC verified with known vectors", "No undefined behavior"] },
      { title: "30 minutes · Boot control", prompt: "Implement slot selection with tries and anti-rollback and test the rollback path.", rubric: ["Decrement before boot", "Floor raised only after success", "Recovery path"] },
      { title: "20 minutes · Ring buffer", prompt: "Write an SPSC ring and explain each memory order.", rubric: ["Release/acquire pairing", "Full/empty logic", "Wrap-around"] },
    ],
  },
});
