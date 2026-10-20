import { jobs } from "./jobs.js";
import { LN } from "../helpers.js";

export const L38 = [
{
  title: "Building and maintaining a Linux distribution: package resolution, kernel config fragments and air-gapped updates",
  sim: "distro",
  snippet: "lesson_38_1.cpp",
  jobs: jobs(["gdch", "POSTED: 'Experience building and maintaining Linux distributions (package management, Kernel updates, kernel configuration management toolings)'; GDCH Node Platform for air-gapped, sovereign deployments."], ["orapmts", "INFERRED from OCI Compute GPU/HPC PMTS postings: Linux host images and kernel updates for a fleet."]), 
  concept: "A cloud that runs **air-gapped** (no internet, for governments and regulated customers) still needs security updates. So the provider maintains its **own Linux distribution**: a curated set of packages, a kernel with a controlled configuration, and an update pipeline that works without network access to the outside. Four skills matter. **Package resolution**: each package declares dependencies with version constraints (\"libssl >= 3.0\"). The resolver picks one version per package that satisfies every constraint, then installs in **dependency order** (a topological sort), and it must report **conflicts** and **cycles** clearly. Real resolvers (libsolv for dnf and zypper, apt's solver) treat this as a satisfiability problem. A greedy \"highest version that fits\" works for most cases and is what you can write in an interview. **Kernel configuration management**: kernels are configured by thousands of CONFIG_ options. Teams keep a small **defconfig** plus **fragments** (security.cfg, debug.cfg, hardware.cfg) merged in order, later ones winning. The kernel's own merge_config.sh does this and warns when a value is overridden. Then *make olddefconfig* fills in dependencies, and a check confirms that every option you asked for actually survived, because Kconfig silently drops options whose dependencies aren't met. **Kernel updates**: track a long-term-support (LTS) branch, apply stable patches, rebuild out-of-tree modules, and roll out through canary nodes with an A/B image so a bad kernel rolls back (see 34.1). **Air-gapped delivery**: updates ship as a **signed bundle** (packages plus repository metadata). The site verifies signatures against keys it already trusts, rejects old bundles (**rollback protection** via a monotonically increasing version), and mirrors the bundle internally. Reproducible builds let a customer rebuild and compare hashes.",
  analogy: "Running a pharmacy on a remote island. You stock only medicines you've checked, each prescription must be compatible with the others the patient takes, and new stock arrives in sealed, signed crates on a ship, never by phone order.",
  language: "C++17 · greedy versioned dependency resolution with topological install order, plus kernel config fragment merging",
  primer: {
    text: "Some cloud sites have no internet connection at all. They still need updates, so the provider builds its own Linux: chosen packages, a carefully configured kernel, and signed update bundles carried in. This lesson builds the two core tools: a package resolver and a kernel config merger.",
    terms: [
      ["Linux distribution", "A complete, curated set of kernel, packages and tools that are built, tested and updated together."],
      ["Dependency resolution", "Choosing package versions that satisfy every package's requirements, then installing in a valid order."],
      ["Topological order", "An ordering where every package comes after the packages it depends on."],
      ["Kconfig / CONFIG_ option", "The Linux kernel's build options, such as CONFIG_SECURITY_SELINUX=y."],
      ["Config fragment", "A small file of CONFIG_ settings merged on top of a base configuration."],
      ["Air-gapped", "A network with no connection to the internet; updates arrive on physical media or a one-way transfer."],
      ["Rollback protection", "Refusing to install an older (possibly vulnerable) version than the one already trusted."],
    ],
  },
  lines: LN(`
#include <algorithm>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <vector>

struct Dep { std::string name; int min_ver; };
struct Pkg { std::string name; int ver; std::vector<Dep> deps; };
struct Plan { bool ok = true; std::string error; std::vector<std::string> order; };

// repo: every available (name, version). Greedy: pick the highest version that meets every constraint seen.
Plan resolve(const std::vector<Pkg> &repo, const std::vector<Dep> &want) {
  std::map<std::string, std::vector<const Pkg *>> by;
  for (const Pkg &p : repo) by[p.name].push_back(&p);
  for (auto &kv : by) std::sort(kv.second.begin(), kv.second.end(), [](const Pkg *a, const Pkg *b) { return a->ver > b->ver; });
  std::map<std::string, int> need;                 //@ Strongest min-version constraint seen per package name.
  std::map<std::string, const Pkg *> pick;
  std::vector<Dep> todo = want;
  Plan plan;
  while (!todo.empty()) {
    Dep d = todo.back(); todo.pop_back();
    need[d.name] = std::max(need[d.name], d.min_ver);
    auto it = by.find(d.name);
    if (it == by.end()) return {false, "missing package " + d.name, {}};
    if (pick.count(d.name)) {
      if (pick[d.name]->ver < need[d.name])        //@ Chosen too low for a later constraint: a real solver backtracks; we report the conflict.
        return {false, "conflict on " + d.name + ": picked " + std::to_string(pick[d.name]->ver) + ", need >= " + std::to_string(need[d.name]), {}};
      continue;
    }
    const Pkg *best = nullptr;
    for (const Pkg *p : it->second) if (p->ver >= need[d.name]) { best = p; break; }
    if (!best) return {false, "no version of " + d.name + " >= " + std::to_string(need[d.name]), {}};
    pick[d.name] = best;
    for (const Dep &x : best->deps) todo.push_back(x);
  }
  // Kahn's algorithm: install dependencies first; leftover nodes mean a cycle.
  std::map<std::string, int> indeg; std::map<std::string, std::vector<std::string>> users;
  for (auto &kv : pick) { indeg[kv.first] += 0; for (const Dep &x : kv.second->deps) { indeg[kv.first]++; users[x.name].push_back(kv.first); } }
  std::queue<std::string> q;
  for (auto &kv : indeg) if (kv.second == 0) q.push(kv.first);
  while (!q.empty()) {
    std::string n = q.front(); q.pop();
    plan.order.push_back(n + "-" + std::to_string(pick[n]->ver));
    for (const std::string &u : users[n]) if (--indeg[u] == 0) q.push(u);
  }
  if (plan.order.size() != pick.size()) return {false, "dependency cycle", {}};
  return plan;
}

// Kernel config: merge fragments in order; later values win; report every override.
using Config = std::map<std::string, std::string>;      // "CONFIG_X" -> "y" | "m" | "n" | value
Config merge_fragments(const std::vector<Config> &frags, std::vector<std::string> &warnings) {
  Config out;
  for (const Config &f : frags)
    for (const auto &kv : f) {
      auto it = out.find(kv.first);
      if (it != out.end() && it->second != kv.second)
        warnings.push_back(kv.first + ": " + it->second + " -> " + kv.second);   //@ Like merge_config.sh: overrides are allowed but never silent.
      out[kv.first] = kv.second;
    }
  return out;
}

// After olddefconfig, confirm every requested option survived (Kconfig drops options with unmet deps).
std::vector<std::string> missing_after_build(const Config &requested, const Config &final_cfg) {
  std::vector<std::string> bad;
  for (const auto &kv : requested) {
    auto it = final_cfg.find(kv.first);
    std::string got = it == final_cfg.end() ? "n" : it->second;
    if (got != kv.second) bad.push_back(kv.first);
  }
  return bad;
}
`),
  storyLesson: {
    scenarioTitle: "The security option that quietly disappeared",
    scenario: "A team adds CONFIG_SECURITY_LOCKDOWN_LSM=y to a security fragment for the air-gapped node image. The kernel builds, ships to a test site, and an audit finds lockdown isn't enabled.",
    sections: [
      { title: "1 · What happened", body: "The option depends on another setting the base defconfig had turned off. make olddefconfig quietly dropped the request. Nothing failed, so nobody noticed." },
      { title: "2 · The guard", body: "The build now compares the requested fragments against the final .config and fails if any requested value didn't survive. Fragment overrides are logged, so reviewers see when debug.cfg turns off something security.cfg turned on." },
      { title: "3 · Shipping the fix to an air-gapped site", body: "The fixed kernel and packages go into a signed bundle with a higher version number. The site verifies the signature with a key it already trusts, refuses any bundle older than what it has, and mirrors it internally." },
      { title: "4 · Rolling out", body: "Canary nodes boot the new image in the B slot; health checks pass; the rest follow in waves. A failed boot falls back to slot A automatically (34.1)." },
    ],
    checkpoint: { prompt: "Why isn't a successful kernel build proof that your config fragment was applied?", answer: "Kconfig silently drops options whose dependencies aren't met; you must compare the final .config with what you requested." },
    lab: { title: "Break the resolver", brief: "Feed the resolver tricky repositories and record what it reports.", steps: ["A simple chain app → libfoo → libc", "Two packages needing different minimums of the same library", "A constraint only an older version satisfies after a newer one was picked (conflict)", "A dependency cycle", "Merge three config fragments with one override and check the warning"], doneWhen: "Each case produces a correct order or a clear, specific error." },
  },
  exercise: "You own the node OS for an air-gapped cloud region. Describe how a critical kernel CVE fix gets from upstream to every node safely.",
  answerHint: "LTS branch, patch, config check, build, sign, transfer, verify, canary, A/B, rollback.",
  expected: ["lts", "config", "sign", "rollback", "canary", "reproducible"],
  modelAnswer: "Track an LTS kernel branch, pick up the stable patch for the CVE, rebuild with the same config fragments, and verify every requested config option survived in the final .config. Use a reproducible build and test on hardware. Package the kernel and repository metadata into a bundle signed with keys the site already trusts, with a higher version number for rollback protection. The site verifies the signature, mirrors it internally, and rolls out to canary nodes in the B slot of an A/B image; health checks gate later waves, and failed boots fall back automatically.",
  pitfalls: [
    "Trusting a successful build as proof the config is right.",
    "Silent fragment overrides that turn off security options.",
    "Bundles without rollback protection, so an old vulnerable kernel can be reinstalled.",
    "No rollback path for a bad kernel on remote, air-gapped nodes.",
  ],
  probes: [
    ["L1 · What does a topological sort give you here?", "An install order where every package comes after its dependencies; leftover nodes mean a cycle."],
    ["L2 · Why can a greedy resolver fail when a solution exists?", "It may pick a version early that a later constraint rules out; real solvers backtrack or use SAT."],
    ["L3 · How do you keep out-of-tree modules working across kernel updates?", "Build them in the same pipeline against the exact kernel headers, version them with the kernel, and test in the canary image; prefer DKMS-free, prebuilt signed modules for air-gapped sites."],
    ["L4 · How does a customer trust a bundle they can't rebuild online?", "Reproducible builds with published hashes, a signed SBOM, keys installed at commissioning, and transparency logs that can be checked offline."],
  ],
  poly: "You already maintain BSP kernels with vendor patches and defconfigs for Qualcomm and NXP boards. A cloud distribution is the same discipline (fragments, LTS patches, signed images, A/B rollback) at fleet scale.",
  why: "The GDCH posting names Linux distribution building, package management, kernel updates and kernel configuration tooling as a minimum qualification.",
  companies: ["Google", "Oracle", "Red Hat", "Canonical", "Microsoft"],
  myth: { myth: "If the kernel builds, the config is what you asked for.", reality: "Kconfig drops options with unmet dependencies without failing the build; you must check the final config." },
  interviewTip: "Mention the 'requested vs final .config' check. It's a small detail that shows you've actually shipped kernels.",
},
{
  title: "Linux networking for SDN: VXLAN overlays, bridge forwarding tables, MTU math and the fast path",
  sim: "vxlan",
  snippet: "lesson_38_2.c",
  jobs: jobs(["oranet", "MIRROR (summary of the Oracle posting): OCI Virtual Networking, Card Management: embedded Linux, SDN infrastructure, deployment and monitoring automation, hardware troubleshooting."], ["gdch", "POSTED: large-scale infrastructure, distributed systems or networks."], ["crwd", "POSTED: features that cross the networking subsystem."]),
  concept: "Clouds give every customer a private network on top of shared physical wires. Oracle calls it a **VCN** and Amazon calls it a **VPC**. The usual trick is an **overlay**: wrap the customer's Ethernet frame inside a UDP packet that travels between hosts. **VXLAN** (RFC 7348) is the standard wrapper. The outer packet is Ethernet (14 bytes) + IPv4 (20) + UDP (8, destination port 4789) + VXLAN header (8), so it is **50 bytes larger** than the inner frame. The VXLAN header carries a 24-bit **VNI** (virtual network identifier, about 16 million networks), with flags byte 0x08 meaning \"VNI is valid\". Each host runs a **VTEP** (VXLAN tunnel endpoint). Its **forwarding database (FDB)** maps (inner MAC, VNI) → remote VTEP IP. Entries are learned from received packets or programmed by the SDN controller, and they **age out**. **MTU math** is the most common real bug. If the physical MTU is 1500, the inner MTU must be 1450, or the underlay must use jumbo frames (9000). Otherwise large packets are dropped, and TCP connections hang after the handshake, because small packets work and big ones vanish. On Linux you build this with **netlink** (the kernel's configuration socket API, used by *ip link add vxlan0 type vxlan id 42 dstport 4789*), bridges and the FDB (*bridge fdb*). For speed, the per-packet work moves to a **fast path**: **tc** or **XDP** eBPF programs in the kernel, or a **SmartNIC** that does encapsulation in hardware. That is the \"card\" in OCI's card management: the NIC runs its own embedded Linux, which needs provisioning, monitoring, firmware updates and troubleshooting like any other device.",
  analogy: "Posting a letter inside a larger envelope. The inner envelope has the customer's own addresses; the outer one has the building-to-building addresses and a room number (the VNI). The outer envelope takes up space, so the inner letter must be a little smaller to fit through the same mail slot.",
  language: "C11 · build and parse a VXLAN header, learn and age FDB entries, compute the inner MTU",
  primer: {
    text: "Cloud customers each get a private network, even though they all share the same cables. The trick is to wrap each customer packet inside another packet addressed between servers. This lesson builds that wrapper, the table that knows where each customer machine lives, and the size limit that trips up many teams.",
    terms: [
      ["Overlay network", "A virtual network built by wrapping packets inside other packets that travel over the real network."],
      ["VXLAN", "A standard wrapper that puts an Ethernet frame inside a UDP packet with a 24-bit network ID (RFC 7348)."],
      ["VNI", "VXLAN network identifier: which customer network a packet belongs to."],
      ["VTEP", "VXLAN tunnel endpoint: the host or NIC that wraps and unwraps packets."],
      ["FDB (forwarding database)", "A table mapping a MAC address (and VNI) to where to send frames for it."],
      ["MTU", "Maximum transmission unit: the largest packet a link carries without fragmenting."],
      ["Netlink", "The Linux socket API that tools such as ip and bridge use to configure the kernel's networking."],
      ["SmartNIC", "A network card with its own processor, often running Linux, that handles packet work in hardware."],
    ],
  },
  lines: LN(`
#include <stdint.h>
#include <string.h>

enum { ETH_HDR = 14, IPV4_HDR = 20, UDP_HDR = 8, VXLAN_HDR = 8, VXLAN_PORT = 4789 };
enum { VXLAN_OVERHEAD = ETH_HDR + IPV4_HDR + UDP_HDR + VXLAN_HDR };   //@ 50 bytes added to every inner frame.

/* Largest inner frame payload that fits the underlay MTU. Underlay MTU counts IP + UDP + VXLAN + inner Ethernet. */
int inner_mtu(int underlay_mtu) { return underlay_mtu - (IPV4_HDR + UDP_HDR + VXLAN_HDR + ETH_HDR); }

/* VXLAN header: flags(8) reserved(24) VNI(24) reserved(8), network byte order. */
void vxlan_build(uint8_t h[VXLAN_HDR], uint32_t vni) {
  memset(h, 0, VXLAN_HDR);
  h[0] = 0x08;                                    //@ I flag: the VNI field is valid.
  h[4] = (uint8_t)(vni >> 16); h[5] = (uint8_t)(vni >> 8); h[6] = (uint8_t)vni;
}

/* Returns the VNI, or -1 if the header is not a valid VXLAN header. */
long vxlan_parse(const uint8_t *h, size_t len) {
  if (len < VXLAN_HDR || (h[0] & 0x08) == 0) return -1;   //@ Never trust packet bytes: check length and flags first.
  return ((long)h[4] << 16) | ((long)h[5] << 8) | (long)h[6];
}

/* Forwarding database: (MAC, VNI) -> remote VTEP IPv4, with aging. */
typedef struct { uint8_t mac[6]; uint32_t vni; uint32_t vtep; uint64_t seen; int used; } FdbEntry;
typedef struct { FdbEntry e[256]; uint64_t max_age; } Fdb;

static int fdb_find(const Fdb *f, const uint8_t mac[6], uint32_t vni) {
  for (int i = 0; i < 256; i++)
    if (f->e[i].used && f->e[i].vni == vni && memcmp(f->e[i].mac, mac, 6) == 0) return i;
  return -1;
}

/* Learn from a received packet: inner source MAC lives behind the outer source IP. Returns 0, or -1 if full. */
int fdb_learn(Fdb *f, const uint8_t mac[6], uint32_t vni, uint32_t vtep, uint64_t now) {
  int i = fdb_find(f, mac, vni);
  if (i < 0) for (i = 0; i < 256 && f->e[i].used; i++) {}
  if (i == 256) return -1;                        //@ Bounded table: a flood of fake MACs must not grow memory forever.
  memcpy(f->e[i].mac, mac, 6); f->e[i].vni = vni; f->e[i].vtep = vtep; f->e[i].seen = now; f->e[i].used = 1;
  return 0;
}

/* Look up where to send. Returns the VTEP IP, or 0 meaning "unknown: flood or ask the controller". */
uint32_t fdb_lookup(Fdb *f, const uint8_t mac[6], uint32_t vni, uint64_t now) {
  int i = fdb_find(f, mac, vni);
  if (i < 0) return 0;
  if (now - f->e[i].seen > f->max_age) { f->e[i].used = 0; return 0; }   //@ Aged out: the VM may have moved to another host.
  return f->e[i].vtep;
}
`),
  storyLesson: {
    scenarioTitle: "SSH connects, then freezes",
    scenario: "After a new overlay network goes live, customers can ping and open SSH sessions to their VMs, but the session freezes as soon as they run a command with lots of output. File copies stall.",
    sections: [
      { title: "1 · Small works, big fails", body: "Ping and the TCP handshake use small packets. Bulk data uses full-size 1500-byte frames. Add 50 bytes of VXLAN and the outer packet is 1550 bytes on a 1500-byte underlay, so it is dropped." },
      { title: "2 · Why it isn't obvious", body: "VXLAN packets usually have the IPv4 don't-fragment bit set, and the ICMP 'too big' message often goes back to the host, not the VM. The VM never learns to send smaller packets." },
      { title: "3 · The fix", body: "Either set the VM's interface MTU to 1450 through DHCP, or run the underlay with jumbo frames (9000) so 1500-byte inner frames fit. Add a monitoring probe that sends a full-size packet across every new tunnel." },
      { title: "4 · Preventing it next time", body: "The SDN controller rejects configurations where the inner MTU plus 50 exceeds the underlay MTU, and the SmartNIC exports drop counters by reason, so 'too big' drops show up on a dashboard." },
    ],
    checkpoint: { prompt: "The underlay MTU is 1500. What's the largest inner MTU that works with VXLAN over IPv4?", answer: "1450: the outer IPv4, UDP and VXLAN headers plus the inner Ethernet header take 50 bytes." },
    lab: { title: "Build an overlay with iproute2", brief: "On a Linux VM (or two network namespaces), create a VXLAN between two endpoints and capture it.", steps: ["Create two network namespaces joined by a veth pair", "ip link add vxlan42 type vxlan id 42 dstport 4789 remote <peer> in each", "Assign inner IPs, ping, and capture with tcpdump -i <veth> udp port 4789", "Send a 1472-byte ping with don't-fragment set and watch it fail; lower the MTU and retry", "Inspect bridge fdb show and watch entries learn and age"], doneWhen: "You can see the 50-byte overhead in the capture and explain the failing ping." },
  },
  exercise: "Customers on a new overlay network report that web pages load partially and large downloads hang. Walk through your diagnosis.",
  answerHint: "Small vs big packets, MTU, overhead, don't-fragment, ICMP, captures, fix.",
  expected: ["mtu", "50", "fragment", "icmp", "capture", "jumbo"],
  modelAnswer: "Partial loads and hanging downloads while small requests work point to an MTU problem. VXLAN adds 50 bytes, so a 1500-byte inner frame becomes 1550 on a 1500-byte underlay. With don't-fragment set, it's dropped, and the ICMP 'fragmentation needed' message may never reach the VM. Confirm with a packet capture and a ping of the full size with don't-fragment set. Fix by setting the inner MTU to 1450 or enabling jumbo frames on the underlay, and add probes and drop counters so it is caught automatically.",
  pitfalls: [
    "Forgetting the 50-byte overhead when choosing MTUs.",
    "Relying on ICMP path-MTU discovery across an overlay.",
    "Unbounded FDB tables that a MAC flood can exhaust.",
    "Parsing packet headers without checking length and flags.",
  ],
  probes: [
    ["L1 · What does the VNI do?", "Identifies which virtual network a frame belongs to; 24 bits allows about 16 million."],
    ["L2 · How does a VTEP learn where a MAC lives?", "From the outer source IP of received packets, or from the SDN controller programming the FDB."],
    ["L3 · When would you use XDP or a SmartNIC instead of the kernel's VXLAN driver?", "When per-packet CPU cost limits throughput or latency: XDP runs before the kernel allocates buffers; a SmartNIC offloads encapsulation entirely."],
    ["L4 · How do you manage a fleet of SmartNICs that run their own Linux?", "Treat them as devices: signed firmware and OS images with A/B slots, health telemetry, staged rollouts, out-of-band recovery, and inventory of versions per card."],
  ],
  poly: "Your devices run embedded Linux with Wi-Fi and Ethernet; you've debugged MTU and driver issues there. A SmartNIC is another embedded Linux device, just sitting inside a server.",
  why: "The Oracle Linux Networking role is SDN on embedded Linux NICs. VXLAN, FDBs, MTU and netlink are the daily vocabulary.",
  companies: ["Oracle", "Google", "Microsoft", "Amazon", "NVIDIA"],
  myth: { myth: "If ping works, the network works.", reality: "Ping uses small packets; MTU problems only hit full-size packets, so test with large, don't-fragment pings." },
  interviewTip: "Say '50 bytes' and '1450' without hesitating, then explain why ICMP doesn't save you. It signals real operational experience.",
},
{
  title: "Endpoint security sensors: event pipelines, process-tree correlation and safe content updates",
  sim: "sensor",
  snippet: "lesson_38_3.cpp",
  jobs: jobs(["crwd", "POSTED: the sensor is 'a driver installed on client machines that observes system activity … processes thousands of events per second'; features cross 'file system, memory, process, and networking'; shared components across Linux, Windows and macOS; bonus 'Experience with eBPF'."], ["oranet", "Related: kernel fast paths and eBPF for networking."]),
  concept: "An endpoint sensor has three parts. **Collection** happens in privileged hooks: eBPF programs on Linux tracepoints and LSM hooks, kernel callbacks and ETW on Windows, and the EndpointSecurity framework on macOS. The core card is 4.4. **Correlation** happens in user space: events are joined into a **process tree** (who launched whom), and **behavioural rules** look for patterns such as \"a document editor launched a shell that opened an outbound connection\". **Response** blocks, kills or isolates on the box, and sends telemetry to the cloud. Three engineering rules keep it safe. **Bounded cost per event**: thousands of events per second arrive. Use a fixed-size ring buffer between kernel and user space, count drops instead of blocking, and keep ancestry walks bounded. **Process-tree hygiene**: PIDs are reused. Key processes by (pid, start time), and keep exited parents briefly so children can still be attributed. **Safe content updates**: detection logic changes daily through **content** (rules, templates), not code. Content is input to privileged code, so it needs the same care as code. On July 19, 2024, a faulty content update to the Windows sensor crashed about 8.5 million machines. CrowdStrike's public root-cause analysis describes a mismatch between the input fields a template defined (21) and the fields the sensor supplied (20), which led to an out-of-bounds read. The fixes it lists are bounds checks in the interpreter, a content validator that checks field counts, and **staged deployment** of content through canary rings with customer control. These apply to anyone shipping data into privileged code.",
  analogy: "Airport security with a rulebook delivered every morning. The guards (sensor) must keep the queue moving, know which traveller came with whom, and never follow a page of the rulebook that refers to a checkpoint that doesn't exist. New pages are tried at one gate before every airport.",
  language: "C++17 · process tree with ancestry rules, a bounded event ring with drop counts, and a content validator",
  primer: {
    text: "Security sensors watch everything a computer does: programs starting, files opening, network connections. They link events into a family tree of processes and match suspicious patterns. Their detection rules are updated daily, and a bad update can crash every machine at once. This lesson builds the tree, the pattern check, and the validator that stops bad rules.",
    terms: [
      ["Endpoint sensor", "Security software on each computer that watches activity and can block threats."],
      ["Process tree", "The parent-child chain of which program started which."],
      ["Behavioural rule", "A detection that matches a pattern of actions rather than a known bad file."],
      ["Ring buffer", "A fixed-size queue that wraps around; when full, new events are counted as dropped instead of blocking."],
      ["Content update", "New detection rules or templates sent to sensors without changing their code."],
      ["Staged rollout", "Sending an update to a small group first, checking health, then widening."],
      ["eBPF", "Small verified programs that run inside the Linux kernel at hook points."],
    ],
  },
  lines: LN(`
#include <cstdint>
#include <map>
#include <string>
#include <vector>

// Process identity must survive PID reuse: key by (pid, start time).
struct ProcKey { int pid; uint64_t start; bool operator<(const ProcKey &o) const { return pid != o.pid ? pid < o.pid : start < o.start; } };
struct Proc { std::string image; ProcKey parent; bool has_parent; };

struct Tree {
  std::map<ProcKey, Proc> procs;
  void exec(ProcKey k, std::string image, ProcKey parent, bool has_parent) { procs[k] = {std::move(image), parent, has_parent}; }
  // Ancestry from the process up, bounded so a corrupt loop can't hang the sensor.
  std::vector<std::string> ancestry(ProcKey k, int max_depth = 16) const {
    std::vector<std::string> out;
    for (int d = 0; d < max_depth; d++) {           //@ Bounded walk: a fixed cost per event, even with bad data.
      auto it = procs.find(k);
      if (it == procs.end()) break;
      out.push_back(it->second.image);
      if (!it->second.has_parent) break;
      k = it->second.parent;
    }
    return out;
  }
};

// Rule: an outbound connect from a process whose chain (child first) contains these images in order.
bool matches(const std::vector<std::string> &chain, const std::vector<std::string> &pattern) {
  size_t j = 0;
  for (const std::string &img : chain) if (j < pattern.size() && img == pattern[j]) j++;
  return j == pattern.size();
}

// Kernel -> user ring. When full, count drops; never block the hook.
struct Ring {
  std::vector<int> buf; size_t head = 0, tail = 0; uint64_t dropped = 0;
  explicit Ring(size_t n) : buf(n) {}
  bool push(int ev) {
    if (head - tail == buf.size()) { dropped++; return false; }   //@ Report drops as telemetry: silent loss is worse than counted loss.
    buf[head++ % buf.size()] = ev; return true;
  }
  bool pop(int &ev) { if (head == tail) return false; ev = buf[tail++ % buf.size()]; return true; }
};

// Content validation before load: every rule may reference only fields the sensor actually supplies.
struct Rule { std::string name; std::vector<int> field_refs; };
struct Validation { bool ok; std::string why; };
Validation validate(const std::vector<Rule> &rules, int supplied_fields) {
  for (const Rule &r : rules)
    for (int f : r.field_refs)
      if (f < 0 || f >= supplied_fields)          //@ The check that would have rejected a 21-field template against a 20-field sensor.
        return {false, r.name + " references field " + std::to_string(f) + " but only " + std::to_string(supplied_fields) + " exist"};
  return {true, "ok"};
}
`),
  storyLesson: {
    scenarioTitle: "A rule update reaches every machine at once",
    scenario: "A detection team ships a new rule template that references one more input field than the sensor passes in. Tests passed because the test harness supplied every field. The update goes to all customers within minutes.",
    sections: [
      { title: "1 · What fails", body: "The interpreter reads the missing field past the end of the array. In user space that's a crash; in a kernel driver loaded at boot, it's a crash on every boot. This is the class of failure CrowdStrike's public July 2024 root-cause analysis describes (PUBLIC)." },
      { title: "2 · Validation", body: "The content validator now checks every field reference against the field count the deployed sensor version supplies, and the interpreter bounds-checks every access anyway (defence in depth)." },
      { title: "3 · Staged deployment", body: "Content goes to internal machines, then a small canary ring, then wider rings, with crash and heartbeat telemetry gating each step. Customers can choose how early they receive content." },
      { title: "4 · Recovery", body: "The sensor tracks repeated crashes after a content load and falls back to the previous known-good content on the next boot, so a bad update can't loop forever." },
    ],
    checkpoint: { prompt: "Why must content updates be treated like code changes, even though they 'only' change data?", answer: "The data is executed or interpreted by privileged code; a malformed input can crash or compromise the kernel, so it needs validation, testing against real versions, and staged rollout." },
    lab: { title: "Build the sensor core", brief: "Feed synthetic events through the tree, rules and ring, then try bad content.", steps: ["Create a tree: explorer → winword → powershell", "Raise a connect event from powershell and match the rule [powershell, winword]", "Reuse powershell's PID with a new start time and show the old ancestry isn't used", "Fill the ring and show drop counts", "Validate a rule referencing field 20 against 20 supplied fields"], doneWhen: "The rule fires once, PID reuse is handled, drops are counted, and the bad rule is rejected with a clear message." },
  },
  exercise: "You're designing the content pipeline for an endpoint sensor that runs in the kernel on millions of machines. What has to be true before a rule update reaches customers?",
  answerHint: "Validation, bounds checks, testing against real versions, staged rings, telemetry, fallback.",
  expected: ["validate", "bounds", "canary", "rings", "fallback", "telemetry"],
  modelAnswer: "Treat content as code. Validate every update against the schema and field counts of each deployed sensor version, and bounds-check every access in the interpreter as a second line of defence. Test the update on the real sensor builds, not a harness with extra fields. Deploy in staged rings (internal, canary, then wider) with crash and heartbeat telemetry gating each step, and let customers choose their ring. The sensor has a fallback to the last known-good content after repeated crashes.",
  pitfalls: [
    "Testing content with a harness that supplies more fields than the real sensor.",
    "Global, instant rollout of content updates.",
    "Unbounded work per event in the hook path.",
    "Keying processes by PID alone, so reused PIDs get the wrong ancestry.",
  ],
  probes: [
    ["L1 · Why keep the kernel part of a sensor small?", "Bugs there crash the machine; rich logic in user space can be tested, restarted and updated safely."],
    ["L2 · How do you attribute an event whose parent already exited?", "Keep exited processes in the tree for a grace period, keyed by (pid, start time)."],
    ["L3 · eBPF vs a kernel module for a Linux sensor?", "eBPF is verified and can't crash the kernel; it is bounded in what it can do. Modules are flexible but every bug is a kernel bug, and they break across kernel versions."],
    ["L4 · How do you share detection logic across Windows, macOS and Linux?", "A portable core (event model, tree, rules engine) in C++ with per-OS collectors that normalize events; the same tests run against all three."],
  ],
  poly: "You've written kernel drivers where a bad input crashes the device. A security sensor is a driver on millions of machines, where bad input arrives as a daily content update.",
  why: "CrowdStrike's sensor posting is about cross-platform OS hooks, high event rates and debugging memory and performance problems. Safe content updates are the lesson the whole industry took from 2024.",
  companies: ["CrowdStrike", "Microsoft", "SentinelOne", "Palo Alto Networks", "Apple"],
  myth: { myth: "Data files can't crash a program, only code can.", reality: "Any input interpreted by privileged code is effectively code; malformed content caused a global outage in 2024." },
  interviewTip: "When asked about sensor reliability, mention bounded per-event cost and staged content rollout together. They're the two ways a sensor takes a machine down.",
},
];
