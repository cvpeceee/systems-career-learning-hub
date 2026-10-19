import { jobs } from "./jobs.js";
import { LN } from "../helpers.js";

export const L34 = [
{
  title: "A/B boot and recovery: slot selection, boot counters, rollback protection and boot-time budgets",
  sim: "bootpath",
  snippet: "lesson_34_1.c",
  jobs: jobs(["qc", "POSTED: boot and recovery architecture, OTA updates, verified boot and boot-time targets for the automotive telematics embedded Linux platform."]),
  concept: "A car's connected control box must never be left unable to start after new software arrives. This box is the **telematics** unit. The standard design is **A/B slots**: two copies of the bootloader-loaded images (kernel, root filesystem). The running slot stays untouched while an **OTA** update writes the other. Boot control metadata, often a small structure in a dedicated partition, records per slot a **priority**, a **tries remaining** counter and a **successful** flag. The bootloader picks the highest-priority slot that is either marked successful or still has tries left, and decrements tries before booting it. After boot, a health check in user space (services up, modem reachable) marks the slot successful. If the new slot keeps failing, its tries run out and the bootloader falls back to the old slot automatically: **rollback**. Separately, **anti-rollback** protection stops an attacker from installing an older, vulnerable but validly signed image. Each image carries a security version, and the device stores a minimum version in tamper-resistant storage (fuses or RPMB), raising it only after the new version is confirmed good. Automotive units also have a **boot-time budget**: some services must be ready within a fixed time after ignition, so you measure each stage and move non-critical work later.",
  analogy: "A pilot with two identical planes. You refuel and update one while flying the other. On switching, you get three attempts to take off in the new plane; if it can't, you go back to the old one. And nobody may swap in a plane with an outdated safety certificate.",
  language: "C11 · A/B slot metadata, try counters, mark-successful and anti-rollback version checks",
  primer: {
    text: "A car must still start after a software update, even a bad one. It keeps two copies of its software and updates the one not running. If the new copy fails to start a few times, it switches back to the old one.",
    terms: [
      ["A/B slots", "Two copies of the system software; one runs while the other is updated."],
      ["OTA (over-the-air) update", "Software delivered and installed over a network connection."],
      ["Tries remaining", "How many more times the bootloader will attempt a new slot before giving up on it."],
      ["Mark successful", "A step after boot that confirms the new slot works."],
      ["Anti-rollback", "Refusing older software versions, even if properly signed, because they may have known flaws."],
      ["RPMB (replay protected memory block)", "A small area of eMMC/UFS storage that only accepts authenticated writes."],
      ["Boot-time budget", "The maximum allowed time from power-on until key services are ready."],
    ],
  },
  lines: LN(`
#include <stdint.h>

struct slot { uint8_t prio; uint8_t tries; uint8_t good; uint32_t sec_ver; };
struct bootctl { struct slot s[2]; uint32_t min_ver; };   //@ min_ver lives in tamper-resistant storage (fuses or RPMB) on a real device.

/* Pick the slot to boot, or -1 to enter recovery. Decrements tries first. */
int pick_slot(struct bootctl *c) {
  int best = -1;
  for (int i = 0; i < 2; i++) {
    const struct slot *s = &c->s[i];
    if (s->prio == 0 || (!s->good && s->tries == 0)) continue;   //@ Disabled, or out of attempts.
    if (s->sec_ver < c->min_ver) continue;                       //@ Anti-rollback: never boot an older security version.
    if (best < 0 || s->prio > c->s[best].prio) best = i;
  }
  if (best >= 0 && !c->s[best].good) c->s[best].tries--;        //@ Decrement BEFORE booting, so a crash during boot still counts.
  return best;
}

/* Called by a user-space health check after a good boot. */
void mark_good(struct bootctl *c, int i) {
  c->s[i].good = 1;
  if (c->s[i].sec_ver > c->min_ver) c->min_ver = c->s[i].sec_ver;   //@ Raise the floor only after the new version is proven good.
}

/* OTA finished writing slot i: make it the preferred, untested slot. */
void ota_installed(struct bootctl *c, int i, uint32_t ver) {
  int other = 1 - i;
  c->s[i] = (struct slot){ .prio = 15, .tries = 3, .good = 0, .sec_ver = ver };
  if (c->s[other].prio >= 15) c->s[other].prio = 14;                //@ The old slot stays bootable as the fallback.
}

/* Boot-time budget check: sum stage times, report the stage that broke it. */
int over_budget(const uint32_t *stage_ms, int n, uint32_t budget_ms) {
  uint32_t t = 0;
  for (int i = 0; i < n; i++) {
    t += stage_ms[i];
    if (t > budget_ms) return i;                                    //@ First stage that pushes past the budget.
  }
  return -1;
}
`),
  storyLesson: {
    scenarioTitle: "The update that left cars without connectivity",
    scenario: "A telematics unit's OTA update boots fine on the bench, but in some vehicles the new modem firmware can't register on the network. The unit still boots, so it never rolls back, and eCall connectivity is gone.",
    sections: [
      { title: "1 · What 'successful' meant", body: "The slot was marked successful as soon as Linux reached user space. Booting isn't the same as working." },
      { title: "2 · Real health checks", body: "Mark-successful now waits for core services, a modem link check and a watchdog-supervised self-test, with a timeout. Failure reboots, consuming a try, and three failures roll back." },
      { title: "3 · Protect the floor", body: "The anti-rollback minimum is raised only after mark-successful, so a rollback to the previous version is still allowed. Versions with known security holes have their floor raised on purpose." },
      { title: "4 · Keep the boot fast", body: "Stage timing shows the health check pushed critical services past the budget. Non-critical checks move after the fast path, and the budget is tested on every build." },
    ],
    checkpoint: { prompt: "Why decrement the try counter before booting rather than after a failure?", answer: "A failure might crash or hang before any code can record it. Decrementing first guarantees every attempt counts, so a broken slot can't loop forever." },
    lab: { title: "Boot-control state machine tests", brief: "Exercise every path of the slot logic.", steps: ["Simulate an OTA, three failed boots and the automatic rollback", "Simulate an OTA, one failure, then success", "Try booting an image older than min_ver", "Corrupt both slots and confirm recovery is entered", "Check a boot-time budget with stage timings"], doneWhen: "Each path behaves as expected and no sequence leaves the device without a bootable slot." },
  },
  exercise: "Design the boot and update path for a telematics unit so that no OTA update can leave a vehicle unable to boot or connect.",
  answerHint: "A/B slots, try counters, health-based success, rollback, anti-rollback, recovery, boot-time.",
  expected: ["a/b", "tries", "successful", "rollback", "anti-rollback", "recovery"],
  modelAnswer: "Use A/B slots: the OTA writes the inactive slot while the running one is untouched. Boot control metadata holds priority, tries and a successful flag per slot. The bootloader decrements tries before booting the new slot; a user-space health check, including a modem link test, marks it successful. If tries run out, it falls back to the old slot, which is the rollback. Anti-rollback stores a minimum security version in fuses or RPMB and raises it only after success. If both slots fail, boot a recovery image. Measure boot stages against the boot-time budget.",
  pitfalls: [
    "Marking a slot successful as soon as the kernel boots.",
    "Raising the anti-rollback floor before the new image is proven.",
    "Storing boot metadata where a power cut mid-write corrupts both copies.",
    "Adding health checks that break the boot-time budget.",
  ],
  probes: [
    ["L1 · Why two slots instead of one?", "The running system stays intact while the update is written, so a failed update can fall back."],
    ["L2 · Where do you store boot control metadata safely?", "In redundant copies with checksums and sequence numbers, written alternately, so a power cut leaves one valid copy."],
    ["L3 · How does anti-rollback interact with a legitimate rollback?", "Only raise the floor after the new version is marked good; until then the previous version stays allowed."],
    ["L4 · The modem firmware updates separately from Linux. How do you keep them consistent?", "Treat them as one versioned bundle with a compatibility check; update both slots together, or keep the modem's own A/B and roll both back if either health check fails."],
  ],
  poly: "Field updates for Poly devices needed the same 'never brick a unit' discipline. Describe a failure you designed around: that maps directly to this posting's boot and recovery ownership.",
  why: "The Qualcomm posting explicitly lists boot and recovery, OTA, verified boot and boot-time targets (POSTED).",
  companies: ["Qualcomm", "Tesla", "Rivian", "Google (Android)", "Bosch"],
  myth: { myth: "If the system boots, the update worked.", reality: "Success should mean the device does its job, including network connectivity for a telematics unit." },
  interviewTip: "Draw the slot state machine (priority, tries, good) on the whiteboard first; it anchors the whole discussion.",
},
{
  title: "Booting from raw NAND: bad blocks, ECC, read disturb and redundant boot copies",
  sim: "nandboot",
  snippet: "lesson_34_2.c",
  jobs: jobs(["qc", "POSTED: storage (NAND/eMMC) and recovery on the telematics platform; boot reliability."]),
  concept: "Many car control boxes start from cheap flash memory chips that are far from perfect. This kind is called **raw NAND** flash. Blocks can be bad from the factory (marked by the manufacturer) and more go bad over time. Every page has spare bytes holding **ECC** codes that correct a limited number of bit errors per chunk. Three things make NAND boot robust. First, **bad block skipping**: early boot code builds a map from logical to physical blocks, skipping blocks marked bad, so the image continues in the next good block. Second, **ECC margins**: if a read needed close to the maximum correctable bits, the data is still fine now but is degrading. **Read disturb** (many reads slowly flip nearby bits) and **data retention** loss (charge leaking over years, faster when hot) cause this. The fix is **scrubbing**: rewrite the data to a fresh block before it becomes uncorrectable. Third, **redundant copies**: keep two or more copies of the earliest boot stages in separate blocks, so an uncorrectable error in one still boots from another. Managed storage (**eMMC**, **UFS**) hides most of this inside its controller but has its own wear and power-loss behaviors. A car's ten-plus year life and wide temperature range make these issues real, not theoretical.",
  analogy: "A paper map left in a hot glovebox for ten years. The ink fades, so you keep a second copy, and whenever a page looks faint you redraw it before it becomes unreadable. Torn pages are skipped, and the index tells you where each section really starts.",
  language: "C11 · logical-to-physical bad-block map, ECC-margin scrubbing and fallback to a redundant boot copy",
  primer: {
    text: "The cheap memory chips in many car units slowly develop errors. The boot code skips bad areas, fixes small errors, and rewrites data that is getting weak. It also keeps spare copies of the most important parts.",
    terms: [
      ["Raw NAND", "Flash memory without a built-in controller; software handles errors and bad blocks."],
      ["Bad block", "A flash block that can't be used reliably and must be skipped."],
      ["ECC (error-correcting code)", "Extra data stored with each page that can fix a limited number of bit errors."],
      ["Read disturb", "Bit errors caused in nearby pages by many repeated reads."],
      ["Data retention", "How long flash keeps data before charge leaks; shorter at high temperature."],
      ["Scrubbing", "Rewriting weakening data to fresh blocks before it becomes unreadable."],
      ["eMMC / UFS", "Flash storage with a built-in controller that manages errors and wear."],
    ],
  },
  lines: LN(`
#include <stdbool.h>
#include <stdint.h>

#define NBLK 64
#define ECC_MAX 8          /* bits the ECC can correct per chunk */
#define SCRUB_AT 6         /* rewrite when this many bits needed fixing */

struct nand {
  bool bad[NBLK];          /* factory or grown bad blocks */
  int flips[NBLK];         /* simulated bit errors seen on the next read */
};

/* Physical block for the n-th good block at or after start, or -1. */
int map_block(const struct nand *f, int start, int n) {
  for (int b = start; b < NBLK; b++) {
    if (f->bad[b]) continue;              //@ Skip bad blocks: the image continues in the next good one.
    if (n-- == 0) return b;
  }
  return -1;
}

enum rd { RD_OK, RD_SCRUB, RD_FAIL };

enum rd read_block(const struct nand *f, int b) {
  if (f->flips[b] > ECC_MAX) return RD_FAIL;    //@ Too many errors: this copy is lost.
  if (f->flips[b] >= SCRUB_AT) return RD_SCRUB; //@ Correct now, but close to the limit: rewrite soon.
  return RD_OK;
}

/* Boot an image of len blocks from the first copy that reads cleanly.
   copies[] holds each copy's start block. Returns copy index or -1;
   *scrub counts blocks that need rewriting. */
int boot_image(const struct nand *f, const int *copies, int ncopies, int len, int *scrub) {
  for (int c = 0; c < ncopies; c++) {
    int need = 0; bool ok = true;
    for (int i = 0; i < len && ok; i++) {
      int b = map_block(f, copies[c], i);
      if (b < 0) { ok = false; break; }         //@ Ran out of good blocks in this region.
      enum rd r = read_block(f, b);
      if (r == RD_FAIL) ok = false;
      else if (r == RD_SCRUB) need++;
    }
    if (ok) { *scrub = need; return c; }        //@ First good copy wins; scrubbing happens later, outside the boot path.
  }
  *scrub = 0;
  return -1;
}
`),
  storyLesson: {
    scenarioTitle: "Cars in Arizona stop booting after four years",
    scenario: "A fleet of vehicles in hot climates starts failing to boot after several years. The units boot from raw NAND with a single copy of the first-stage bootloader.",
    sections: [
      { title: "1 · Root cause", body: "Heat speeds up charge loss. The bootloader block, read on every start and never rewritten, crossed the ECC limit. One uncorrectable block meant no boot." },
      { title: "2 · Redundant copies", body: "The boot ROM can try several copies, so the first stage now has copies in different blocks. One unreadable copy no longer stops the boot." },
      { title: "3 · Scrubbing", body: "When a read needs at least 6 of 8 correctable bits, a background service rewrites that block's data to a fresh block and updates the map." },
      { title: "4 · Proving it", body: "Accelerated aging tests at high temperature and a read-disturb stress loop show the margin. Field telemetry reports corrected-bit counts per block so drift is visible years early." },
    ],
    checkpoint: { prompt: "Why scrub at 6 corrected bits instead of waiting for 8?", answer: "At the limit the next read may be uncorrectable. Scrubbing early, while the data is still recoverable, keeps a safety margin." },
    lab: { title: "NAND aging simulation", brief: "Simulate years of reads and heat.", steps: ["Mark a few blocks bad and check the map", "Add bit flips that grow with reads and temperature", "Boot repeatedly with one copy, then three", "Add scrubbing and compare failure times", "Report the corrected-bit telemetry you'd send"], doneWhen: "With copies and scrubbing, simulated units survive 15 years at high temperature." },
  },
  exercise: "Some vehicles fail to boot after a few years in hot climates. The boot flash is raw NAND. How do you diagnose and fix this?",
  answerHint: "Retention and read disturb, ECC margins, scrubbing, redundant copies, bad block maps, telemetry.",
  expected: ["ecc", "bad block", "scrub", "retention", "read disturb", "redundant"],
  modelAnswer: "Suspect data retention loss sped up by heat, plus read disturb on boot blocks read at every start. Check corrected ECC bit counts on returned units. Fix: keep redundant copies of early boot stages so one uncorrectable copy still boots; scrub, meaning rewrite data to a fresh block, when corrected bits approach the ECC limit; keep a correct bad block map that skips factory and grown bad blocks. Add telemetry for corrected bits and validate with accelerated high-temperature aging tests.",
  pitfalls: [
    "A single copy of the first boot stage.",
    "Treating corrected errors as 'fine' and never scrubbing.",
    "Erasing the factory bad-block markers during manufacturing.",
    "Scrubbing inside the boot path and breaking the boot-time budget.",
  ],
  probes: [
    ["L1 · What does ECC do on NAND?", "Corrects a limited number of bit errors per chunk using spare bytes stored with each page."],
    ["L2 · What's read disturb?", "Repeated reads slowly change charge in neighboring cells, causing bit errors over time."],
    ["L3 · How does the boot ROM find the bootloader if block 0 is bad?", "It tries several defined locations or copies, often with a header marking a valid image, per the chip's boot documentation."],
    ["L4 · Raw NAND vs eMMC for a 15-year automotive unit: how do you decide?", "Compare cost, control over error handling, supplier lifetime, temperature grade, power-loss behavior and the team's ability to own the flash software. Raw NAND gives control but needs more software; eMMC hides problems you can't fix."],
  ],
  poly: "Your Poly driver work likely included flash or storage drivers with ECC and bad-block handling. That's a direct match for this posting's storage responsibilities.",
  why: "The Qualcomm posting names NAND/eMMC storage and boot/recovery (POSTED). Automotive lifetimes make flash aging a real design driver.",
  companies: ["Qualcomm", "Bosch", "Continental", "Tesla", "Harman"],
  myth: { myth: "Flash either works or it doesn't.", reality: "It degrades gradually, and ECC hides the decline until it suddenly can't." },
  interviewTip: "Mention temperature and lifetime explicitly. It shows you think about automotive conditions, not just a lab board.",
},
{
  title: "Verified boot and runtime integrity: chain of trust and Merkle-tree verity",
  sim: "verity",
  snippet: "lesson_34_3.c",
  jobs: jobs(["qc", "POSTED: verified boot, disk integrity, full-disk encryption, MAC and threat analysis (TARA) for the telematics platform."]),
  concept: "**Verified boot** builds a **chain of trust**. The boot ROM, which can't be changed, holds or references a public key fused into the chip. It verifies the signature on the first bootloader, which verifies the next stage, and so on up to the kernel. Each stage only runs code signed by a trusted key. The kernel then has to trust the root filesystem, which is too big to check at boot. **dm-verity** solves this with a **Merkle tree**: split the filesystem into 4 KB blocks, hash each block, hash groups of hashes, and so on up to a single **root hash**. The root hash is part of the signed boot data. When a block is read, the kernel hashes it and checks it against its parent hash, up the tree, so any change is detected at read time, cheaply. Verity makes a read-only partition tamper-evident. Writable data needs other tools: **full-disk encryption** for confidentiality, and integrity protection for data that must not be altered. **MAC** (mandatory access control, such as SELinux) limits what each process can touch even if it's compromised. In automotive, a **TARA** (threat analysis and risk assessment, from ISO/SAE 21434) decides which protections each asset needs.",
  analogy: "A sealed library. Each shelf has a label listing a fingerprint for every book on it, each room lists the fingerprints of its shelf labels, and the front door has one signed master fingerprint. Swap a page anywhere and the fingerprints stop matching on the way up.",
  language: "C11 + OpenSSL SHA-256 · building a Merkle tree over blocks and verifying one block against the root",
  primer: {
    text: "The car checks each piece of software before running it, starting from code that can't be changed. For the large system disk, it keeps a tree of fingerprints. Each block is checked against the tree when it is read, so tampering is caught.",
    terms: [
      ["Chain of trust", "Each boot stage checks the signature of the next before running it."],
      ["Root of trust", "The first unchangeable code and key, usually in the chip's ROM and fuses."],
      ["Merkle tree", "A tree of hashes where each parent is the hash of its children; one root hash covers everything."],
      ["dm-verity", "Linux feature that checks each block read from a read-only partition against a Merkle tree."],
      ["Full-disk encryption", "Encrypting stored data so it can't be read without the key."],
      ["MAC (mandatory access control)", "System-enforced rules limiting what each process may access, such as SELinux."],
      ["TARA", "Threat analysis and risk assessment, the automotive security analysis in ISO/SAE 21434."],
    ],
  },
  lines: LN(`
#include <openssl/sha.h>
#include <stdbool.h>
#include <string.h>

#define BLK 4096
#define H SHA256_DIGEST_LENGTH       /* 32 bytes */

static void hash_pair(const unsigned char *a, const unsigned char *b, unsigned char *out) {
  unsigned char buf[2 * H];
  memcpy(buf, a, H); memcpy(buf + H, b, H);
  SHA256(buf, sizeof buf, out);      //@ Parent = hash(left || right). Real dm-verity hashes a whole 4 KB block of child hashes, with a salt.
}

/* Build a binary Merkle tree. n must be a power of two. tree has 2n-1 entries:
   leaves at [n-1 .. 2n-2], root at [0]. */
void build(const unsigned char *data, int n, unsigned char (*tree)[H]) {
  for (int i = 0; i < n; i++) SHA256(data + (size_t)i * BLK, BLK, tree[n - 1 + i]);
  for (int i = n - 2; i >= 0; i--) hash_pair(tree[2 * i + 1], tree[2 * i + 2], tree[i]);   //@ Parents from the bottom up.
}

/* Verify block i using only the sibling hashes on its path, against a trusted root. */
bool verify(const unsigned char *block, int i, int n, unsigned char (*tree)[H], const unsigned char *root) {
  unsigned char cur[H];
  SHA256(block, BLK, cur);
  for (int node = n - 1 + i; node > 0; node = (node - 1) / 2) {
    bool left = (node % 2) == 1;                //@ Odd index = left child in this layout.
    int sib = left ? node + 1 : node - 1;
    unsigned char up[H];
    if (left) hash_pair(cur, tree[sib], up); else hash_pair(tree[sib], cur, up);
    memcpy(cur, up, H);
  }
  return memcmp(cur, root, H) == 0;             //@ The root comes from signed boot data, never from the disk being checked.
}
`),
  storyLesson: {
    scenarioTitle: "A modified root filesystem on a returned unit",
    scenario: "A unit returned from the field has an extra binary on its root filesystem. The bootloader chain was verified, but the root filesystem was only mounted read-only, not verified.",
    sections: [
      { title: "1 · The gap", body: "Read-only isn't tamper-proof: an attacker with physical access rewrote the flash directly. Nothing checked the filesystem's contents." },
      { title: "2 · Add verity", body: "The build now generates a Merkle tree for the root filesystem and puts the root hash in the signed kernel command line. Any modified block fails on read." },
      { title: "3 · Writable data", body: "Configuration and logs live on an encrypted data partition with its key bound to the device. SELinux policy limits which services can write where." },
      { title: "4 · Tie it to the TARA", body: "The threat analysis lists physical flash access as a threat; verity, encryption and MAC are the recorded controls, with tests for each." },
    ],
    checkpoint: { prompt: "Why must the root hash come from signed boot data and not from the disk?", answer: "If it came from the disk, an attacker could modify blocks and recompute the tree and root. Only a signed root ties the tree to a trusted key." },
    lab: { title: "Tamper test", brief: "Build a tree, tamper with data and see verification fail.", steps: ["Build a tree over 8 blocks", "Verify every block", "Flip one byte in block 5 and verify again", "Tamper with a stored sibling hash instead", "Measure verify cost per block"], doneWhen: "Every tamper is caught and the cost per read is a handful of hashes." },
  },
  exercise: "Design the integrity and security architecture for a telematics unit's boot and storage.",
  answerHint: "Root of trust, chain of signatures, verity for read-only, encryption and integrity for writable, MAC, TARA.",
  expected: ["root of trust", "chain of trust", "verity", "merkle", "encryption", "tara"],
  modelAnswer: "Start from a hardware root of trust: boot ROM plus fused public key hash. Each stage verifies the next stage's signature, forming a chain of trust to the kernel, with anti-rollback versions. The read-only root filesystem uses dm-verity: a Merkle tree whose root hash is in signed boot data, so every block is checked on read. Writable partitions use full-disk encryption with a device-bound key. SELinux-style MAC limits each service. A TARA under ISO/SAE 21434 maps threats to these controls.",
  pitfalls: [
    "Reading the verity root hash from the same disk it protects.",
    "Treating a read-only mount as tamper protection.",
    "Encrypting data but leaving the key readable from the filesystem.",
    "Skipping the threat analysis, so controls don't match real threats.",
  ],
  probes: [
    ["L1 · What does verified boot guarantee?", "Each stage runs only code signed by a trusted key, starting from unchangeable ROM."],
    ["L2 · Why a Merkle tree instead of one hash of the whole partition?", "A single hash needs reading everything at boot; a tree lets each block be checked on its own when read."],
    ["L3 · What happens on a verity failure at runtime?", "The read fails with an I/O error; policy decides between restart, switching to the other slot, or recovery mode."],
    ["L4 · How do you handle key compromise for a fleet of cars?", "Plan key hierarchies with revocation: multiple fused key slots or a key version, signed revocation lists, and an OTA path to rotate keys without bricking units."],
  ],
  poly: "If you dealt with secure boot or signed firmware on Poly devices, frame it as owning a chain of trust. The Merkle-tree piece is a natural extension you can now explain.",
  why: "The Qualcomm posting lists verified boot, disk integrity, full-disk encryption, MAC and TARA (POSTED).",
  companies: ["Qualcomm", "Google (Android)", "Tesla", "Apple", "Bosch"],
  myth: { myth: "A read-only filesystem can't be tampered with.", reality: "Anyone with physical access can rewrite flash; only verification detects it." },
  interviewTip: "Always say where the root hash or key comes from. That one question separates real understanding from buzzwords.",
},
{
  title: "Application processor ↔ modem fusion: shared-memory rings, framing and link recovery",
  sim: "fusion",
  snippet: "lesson_34_4.c",
  jobs: jobs(["qc", "POSTED: fusion of application processor and modem over PCIe, USB or Ethernet; platform architecture."]),
  concept: "Many telematics units pair an **application processor** (AP, running Linux) with a **modem** chip, joined by PCIe, USB or Ethernet. Qualcomm calls this kind of pairing fusion; the posting lists those three links. Over PCIe, the two sides typically share memory and pass messages through **ring buffers**: one side writes entries and advances a **head** index, the other reads and advances a **tail** index, and **doorbells** (register writes or interrupts) say that new entries exist. A **single-producer single-consumer** ring needs no lock: each index has exactly one writer. Correctness depends on **memory ordering**. The producer must make the entry's data visible before publishing the new head, and the consumer must read the head before the data. In C11 that's a **release** store and an **acquire** load. Real links add more: **framing** with lengths and sequence numbers, checksums for links without hardware integrity, and **link recovery**. If the modem crashes or the link resets, both sides must detect it (timeouts, sequence gaps), reset their rings and renegotiate, without the AP hanging. Power management matters too: the link may enter low-power states, so waking it costs time on the first message.",
  analogy: "Two coworkers sharing a pigeonhole shelf. One fills slots in order and moves a 'filled up to here' marker; the other empties slots and moves a 'taken up to here' marker. The marker must move only after the letter is in the slot, or the reader grabs an empty slot.",
  language: "C11 atomics · a lock-free single-producer single-consumer ring with release/acquire ordering, tested under TSan",
  primer: {
    text: "The main computer and the mobile-network chip pass messages through a shared ring of slots. One side writes and moves a marker, and the other reads and moves its own marker. The order of these steps matters, or the reader gets half-written messages.",
    terms: [
      ["Application processor (AP)", "The main processor running Linux and applications."],
      ["Modem", "The chip that handles the mobile network connection."],
      ["Ring buffer", "A fixed array used in a circle, with head and tail positions."],
      ["Doorbell", "A signal, such as a register write, telling the other side new data is ready."],
      ["Release / acquire", "Memory-order rules that make data written before a release visible after the matching acquire."],
      ["SPSC", "Single producer, single consumer: exactly one writer and one reader."],
      ["Link recovery", "Detecting a crashed or reset peer and bringing the connection back cleanly."],
    ],
  },
  lines: LN(`
#include <stdatomic.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#define SLOTS 256                    /* power of two */
#define MSG 64

struct msg { uint32_t seq; uint16_t len; uint8_t data[MSG]; };

struct ring {
  _Atomic uint32_t head;             /* written only by producer */
  _Atomic uint32_t tail;             /* written only by consumer */
  struct msg slot[SLOTS];
};

bool ring_put(struct ring *r, const struct msg *m) {
  uint32_t h = atomic_load_explicit(&r->head, memory_order_relaxed);   //@ Our own index: relaxed is fine.
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_acquire);   //@ Acquire: the consumer has finished with slots before t.
  if (h - t == SLOTS) return false;                                    //@ Full. Unsigned subtraction handles wrap-around.
  r->slot[h & (SLOTS - 1)] = *m;
  atomic_store_explicit(&r->head, h + 1, memory_order_release);        //@ Release: the slot's contents become visible before the new head.
  return true;
}

bool ring_get(struct ring *r, struct msg *out) {
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_relaxed);
  uint32_t h = atomic_load_explicit(&r->head, memory_order_acquire);   //@ Acquire pairs with the producer's release.
  if (t == h) return false;                                            //@ Empty.
  *out = r->slot[t & (SLOTS - 1)];
  atomic_store_explicit(&r->tail, t + 1, memory_order_release);        //@ Hand the slot back only after copying it out.
  return true;
}

/* Consumer-side check: a gap in sequence numbers means lost or reset state. */
bool seq_ok(uint32_t *expect, const struct msg *m) {
  bool ok = m->seq == *expect;
  *expect = m->seq + 1;              //@ Resync so one gap triggers one recovery, not endless errors.
  return ok;
}
`),
  storyLesson: {
    scenarioTitle: "Corrupted messages once a day",
    scenario: "The AP–modem control channel occasionally delivers messages with garbage in the payload, roughly once per day per thousand units. It never happens on x86 test benches, only on the ARM-based units.",
    sections: [
      { title: "1 · Find the race", body: "The producer wrote the head index with a plain store. On ARM, the store to head could become visible before the payload, so the consumer read a half-written slot." },
      { title: "2 · Fix ordering", body: "Head and tail become C11 atomics with release stores and acquire loads. On real shared memory with a device, the matching barriers and cache maintenance for DMA apply too." },
      { title: "3 · Detect the rest", body: "Each message carries a sequence number. A gap triggers resynchronization, and a timeout with no doorbell triggers link recovery." },
      { title: "4 · Prove it", body: "A stress test with ThreadSanitizer and millions of messages runs in CI, plus a hardware soak with forced modem resets." },
    ],
    checkpoint: { prompt: "Why did the bug only appear on ARM?", answer: "x86 keeps stores in order for this pattern, so the missing release ordering didn't matter there. ARM can reorder stores, exposing the race." },
    lab: { title: "Ring stress test", brief: "Run producer and consumer threads with sanitizers.", steps: ["Producer sends 1 million sequenced messages", "Consumer checks every sequence and payload", "Run under ThreadSanitizer", "Replace release/acquire with plain variables and observe TSan's report", "Add a simulated reset and check recovery"], doneWhen: "TSan is clean with correct ordering and reports a race without it." },
  },
  exercise: "Messages between the application processor and the modem are occasionally corrupted, only on the ARM units. Diagnose and fix it, and design for link failures.",
  answerHint: "Memory ordering, release/acquire, framing and sequence numbers, recovery.",
  expected: ["release", "acquire", "ring", "sequence", "recovery", "arm"],
  modelAnswer: "This points to a memory-ordering race in the shared ring: on ARM, stores can become visible out of order, so the consumer sees the new head before the payload. Make head and tail atomics; the producer writes the slot, then publishes head with a release store; the consumer reads head with an acquire load before reading the slot. Add framing with length and sequence numbers to detect gaps, timeouts and link recovery to reset rings after a modem crash, and stress test under ThreadSanitizer.",
  pitfalls: [
    "Plain or volatile variables for indexes shared across cores.",
    "Testing only on x86, where the race hides.",
    "No sequence numbers, so lost messages go unnoticed.",
    "A recovery path that hangs the AP waiting on a dead modem.",
  ],
  probes: [
    ["L1 · Why no lock in an SPSC ring?", "Each index has one writer, so there are no write conflicts, only ordering to get right."],
    ["L2 · What does release/acquire guarantee?", "Everything written before the release store is visible to a thread after its acquire load sees that store."],
    ["L3 · With DMA from the modem over PCIe, what else matters?", "Cache coherency: either coherent DMA or explicit cache flush/invalidate around buffers, plus device memory barriers."],
    ["L4 · How do you design link recovery so neither side hangs?", "Timeouts on every wait, a reset handshake with an epoch number so stale messages are ignored, and a supervisor that restarts the modem service and reports telemetry."],
  ],
  poly: "Shared-memory rings between a host and a DSP or codec in Poly devices are the same pattern. Describe any ordering bug you fixed; it's directly relevant.",
  why: "The Qualcomm posting names AP–modem fusion over PCIe/USB/Ethernet (POSTED). The control path between them is shared-memory messaging like this.",
  companies: ["Qualcomm", "Apple", "Samsung", "NVIDIA", "Intel"],
  myth: { myth: "volatile is enough for shared memory between cores.", reality: "volatile doesn't order memory between cores; you need atomics with acquire/release or barriers." },
  interviewTip: "Mention that the bug hides on x86. Interviewers recognise it as real experience.",
},
];
