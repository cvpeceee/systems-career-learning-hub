# Oct 20 job alert: skill map

**Roles** (sources and POSTED / MIRROR / INFERRED labels are in `new-jobs-oct20-research.md`): NVIDIA ATG, NVIDIA Tegra, NVIDIA GPU Architect, NVIDIA SRE Kubernetes, Google GDCH, Google AI Solution Builder, Anthropic Scaling, Wing, Raytheon, Oracle PMTS (inferred), Oracle Linux Networking, CrowdStrike, Osano, Genesys, Garmin Senior SWE (inferred), Garmin Map Navigation, Truist.

**Checked against:** all 36 earlier chapters of the 04 tutorial, the 05 Tesla track, every 06 problem, design, lesson and company page, and the 07 Poly course. A skill was only added when it was missing or covered by a single card or sentence.

**"Before" ratings:** None = not taught. Shallow = a card or a sentence inside another lesson. Full = a dedicated lesson (left alone and linked in `JOB_SKILL_MAP.md` at the repo root).

## New chapters (5 chapters, 15 lessons, 15 interactive labs)

| Skill | Roles | Before | Now |
|---|---|---|---|
| Memory test algorithms (March C-), fault models, manufacturing screening | Tegra (JR2011805 diagnostics) | None | **37.1** (sim `march`, C++) |
| Latency hiding in GPU simulators: warps, issue slots, analytic bound vs simulated | GPU Architect | Shallow (roofline and occupancy in ch7/12) | **37.2** (sim `warpsim`, C++) |
| Computational geometry for chip layouts, tiling with halos across a cluster | NVIDIA ATG | None | **37.3** (sim `tiling`, C++) |
| Linux distribution building: package dependency resolution, kernel config fragments | Google GDCH | None | **38.1** (sim `distro`, C++) |
| VXLAN overlays, MTU math, MAC learning with aging | Oracle Linux Networking, Oracle PMTS | None | **38.2** (sim `vxlan`, C) |
| Endpoint sensor internals: process trees keyed by pid and start time, bounded rings, content validation, rings and fallback | CrowdStrike | Shallow (eBPF/WFP card in L4.4) | **38.3** (sim `sensor`, C++) |
| SLO-driven autoscaling with scale-down stabilization, cost-aware placement | Anthropic Scaling, NVIDIA SRE | Shallow (KV-aware routing in 26.2) | **39.1** (sim `autoscale`, Go) |
| Multi-cluster Kubernetes lifecycle: version skew, upgrade waves with disruption budgets, jobs that can't be drained | NVIDIA SRE, Google GDCH | Shallow (operators in 27.2, API server in 31.4) | **39.2** (sim `k8supgrade`, Go) |
| OpenTelemetry tail sampling and cardinality budgets | Truist, NVIDIA SRE | Shallow (observability card in L8.2) | **39.3** (sim `otel`, Go) |
| Transactional outbox, idempotent consumers, sagas | Wing | Shallow (idempotency lesson c28 in 06) | **40.1** (sim `outbox`, Go) |
| Privacy by design: consent ledger, retention, data residency | Osano | None | **40.2** (sim `privacy`, Go) |
| Agent tool gates (MCP-style schemas, human approval, idempotent side effects) and evaluation gates | Google AI Solution Builder, Genesys | Shallow (MCP card in L6.2) | **40.3** (sim `agentgate`, Go) |
| Map search on small devices: grid index, ring search, prefix search | Garmin Map Navigation | None (tries in 06 c12) | **41.1** (sim `mapsearch`, C++) |
| DO-178C MC/DC coverage, time-partitioned scheduling | Raytheon, Garmin | None | **41.2** (sim `mcdc`, C++) |
| MIL-STD-1553 command/status words and bus schedules | Raytheon | None | **41.3** (sim `bus1553`, C) |

Skipped on purpose (already Full): KV-aware routing (26.2), Kubernetes operators (27.2), A/B boot (34.1), SystemC virtual platforms (ch22), RAG designs (06 sd8, sd24), metrics/SLO design (06 sd15), safe rollouts (32.2).

## Verification
- `bun tools/validate.js`: VALID, 0 errors (5 chapters, 15 lessons, 40 quiz questions, 15 sims).
- Plain-language audit (`tools/audit.py`): 0 flags.
- `snippets/run_checks.sh`: 9 C/C++ harnesses with `-Wall -Wextra -Wpedantic -Werror` plus ASan/UBSan, and 6 Go packages with gofmt, go vet and `go test -race`. All pass.
- Browser tests (`test_improved.js` on both HTML files, `test_tesla.js` on the integrated and Tesla files): 0 fails, 0 console errors; the core track shows 41 chapters.
