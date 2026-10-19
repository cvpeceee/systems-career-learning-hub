# Oct 12 job alert: skill map (staff/principal roles)

**Roles** (sources and POSTED/PUBLIC/INFERRED labels are in `new-jobs-oct12-research.md`):
- **ANT** = Anthropic Staff+ SWE, Infrastructure (Distributed Systems), SF + Seattle. One requisition (Greenhouse 4970314008).
- **RBX-GPU** = Roblox Principal SWE, GPU Compute
- **RBX-EA** = Roblox Principal SWE, Engineering Acceleration (verified: source control, code search, review, CI and productivity)
- **QC** = Qualcomm Senior Staff Engineer, San Diego. The exact-title match is the automotive telematics embedded Linux platform role.
- **MS** = Microsoft MTS (Principal), Microsoft Robotics, MDQ

**Checked against:**
- All 30 core chapters (ch1–18 base; ch19–24 Oct 8; ch25–30 Oct 11)
- The Tesla track T1–T8 and its 12 drills
- The Oct 7, Oct 8 and Oct 11 skill maps
- A keyword scan of the built integrated HTML for every candidate topic (MIG, MPS, XID, DCGM, checkpoint, gang, etcd, dm-verity, UBI/NAND, eBPF, flaky, remote cache, trigram, VLA, simplex, DORA and more)

**"Before" ratings:**
- **None** = not taught.
- **Shallow** = a sentence, a card, or a checklist item inside another lesson.
- **Full** = a dedicated, deep lesson.

## Gaps and shallow spots, now taught (6 chapters, 24 lessons, 5 staff-level drills)

| Skill | Roles | Before | Now |
|---|---|---|---|
| Failure math at accelerator scale: per-node failure rates to job MTBF, checkpoint interval (Young/Daly), goodput | ANT, RBX-GPU | None (T8 teaches all-reduce, not failures; "checkpoint" hits were drain steps and CSS) | **31.1** (sim `goodput`, C++) |
| Sharded, asynchronous checkpointing with atomic manifests, restore and retention | ANT | Shallow (drain checklist says "checkpoint or migrate") | **31.2** (sim `ckpt`, Go) |
| Gang scheduling, quotas, fair share and preemption for accelerator jobs | ANT, RBX-GPU | Shallow (one sentence in a ch7 interview answer; 29.2 covers bin packing and topology) | **31.3** (sim `gang`, Go) |
| Kubernetes control plane at extreme scale: etcd limits, watch cache, list storms, API priority and fairness, jittered backoff | ANT | Shallow (ch3 cards, 27.2 operators; etcd named 3 times) | **31.4** (sim `apiserver`, Go) |
| GPU health and automated remediation: XID classes, ECC/row remap, NVLink, thermal; cordon → drain → reset → RMA | RBX-GPU, ANT | Shallow (DCGM/XID appear in a debugging answer and a drain checklist) | **32.1** (sim `gpuhealth`, C++) |
| Driver/firmware/CUDA lifecycle: compatibility matrices, image-based rollout waves with health gates | RBX-GPU, ANT | None (fleet driver testing in the Oct 8 ch covers kernel drivers, not the CUDA/driver/firmware matrix) | **32.2** (sim `rollout`, Go) |
| GPU sharing in depth: MIG profiles and placement, MPS, time-slicing, Kubernetes device plugins and DRA | RBX-GPU | Shallow (one paragraph in the GPU driver stack lesson) | **32.3** (sim `migpack`, C++) |
| Remote build caching and execution: action digests, content-addressable store, hermeticity, hit rates | RBX-EA | None | **33.1** (sim `buildcache`, Go) |
| Monorepo CI: affected-target test selection, merge queues, trunk health | RBX-EA | None | **33.2** (sim `mergeq`, Go) |
| Flaky tests (detection statistics, quarantine) and productivity metrics (DORA, EPI, avoiding gamed metrics) | RBX-EA | Shallow (deterministic-sim lesson covers one cause of flakiness) | **33.3** (sim `flaky`, Go) |
| Code search at scale: trigram indexes and posting-list intersection | RBX-EA (POSTED: "source code search") | None | **33.4** (sim `trigram`, Go) |
| Boot-time and memory-footprint budgets on embedded Linux: critical path, PSS, CMA/carve-outs | QC | Shallow (23.2 covers rear-camera-first startup for infotainment, not Linux platform boot or footprint) | **34.1** (sim `bootpath`, C) |
| Fail-safe boot and recovery on NAND/eMMC: boot counters, bad blocks, power-loss-safe metadata, recovery image | QC | Shallow (T6 A/B slots and boot confirmation; NAND 0 hits) | **34.2** (sim `nandboot`, C) |
| Disk integrity and encryption: dm-verity hash tree verification, dm-crypt full-disk encryption key handling, SELinux mandatory access control, TARA | QC | Shallow (dm-verity explained in one Yocto paragraph; dm-crypt and SELinux 0 hits) | **34.3** (sim `verity`, C) |
| AP–modem "fusion": IPC channels over PCIe/USB, rings and doorbells, flow control, modem subsystem restart | QC | None (PCIe enumeration is in ch10; no host–modem protocol) | **34.4** (sim `fusion`, C) |
| VLA policies on robots: action chunking, asynchronous inference, latency budgets, edge vs cloud offload | MS | None (VLA 1 hit; T7 sim-to-real teaches RL and imitation, not running a policy on the robot) | **35.1** (sim `chunking`, C++) |
| Runtime assurance: simplex architecture, safety envelopes, human-in-the-loop fallback | MS | None (T4 watchdogs/fail-safe is hardware-level) | **35.2** (sim `simplex`, C++) |
| Robot platform contracts: capability-based hardware abstraction, ROS 2 lifecycle nodes and executors, where frameworks fit | MS | Shallow (T2 ROS 2/DDS QoS covers transport only) | **35.3** (sim `capability`, C++) |
| **Role playbooks** (what the role really is, labelled interview loop, 4–6 week plan, mapping Poly driver/C++ work to staff-level stories) | all 5 | None | **36.1–36.5** (sims `playbook_ant/_gpu/_ea/_qc/_ms`, one coding practice per company in its reported interview style) |
| **Behavioral/leadership bank** (10 STAR prompts for staff/principal scope, with placeholders) and **deep-dive question ladders** | all 5 | Shallow (Tesla T1 has one story-framing lesson for Tesla) | **36.6** (sim `starbank`, C++ impact-number tool) |
| **Staff-level drills** | one per role | None | `trainsched` (ANT), `gpuplatform` (RBX-GPU), `buildci` (RBX-EA), `telematicsboot` (QC), `robotplatform` (MS) |

Every lesson's "probes" are written as a **depth ladder**: L1 → L2 → L3, each question one level deeper than the last. Each playbook also has a per-company ladder.

## Already covered (no new lessons; the playbooks link to these)
- **RDMA, NCCL, collectives, lossless fabrics** (ANT and RBX-GPU preferred): ch19.
- **Bin packing, fragmentation, GPU topology, preemption** (ANT, RBX-GPU): 29.2. Chapter 31.3 adds gangs, quotas and fairness only.
- **Kubernetes operators, reconcile loops, finalizers**: 27.2. **cgroups, PSI, OOM**: 29.1. **Kubernetes basics and IaC**: ch3.
- **BMC/IPMI/Redfish, PCIe AER, power and thermal on accelerator hosts** (RBX-GPU strong plus): the Oct 7 Accelerator & Driver Platforms chapter.
- **CUDA, GPU driver stack (UMD/KMD), streams**: ch12. **Distributed training (data parallel, all-reduce)**: T8.
- **LLM/Triton serving, KV cache, KServe** (RBX-GPU's Triton/vLLM context): ch26.
- **Monorepo VCS internals, VFS clients, file watching** (RBX-EA source storage): ch30.
- **Yocto, device trees, secure boot chain, dm-verity basics** (QC): the Robotics & Automotive Platforms chapter (Oct 7). **A/B updates, signed images, boot confirmation**: T6.
- **RTOS, QNX, hypervisors; ISO 26262/21434, MISRA** (QC): the Robotics & Automotive Platforms chapter. **Linux kernel drivers, DMA, PCIe**: ch10. **Weak memory, exception levels, firmware**: ch21.
- **ROS 2/DDS QoS, PREEMPT_RT, Kalman, PID, MPC, kinematics, balance, sim-to-real with domain randomization** (MS): T2, T5, T7.
- **Simulation determinism, scenario libraries, metrics and release gating** (MS evaluation): the Oct 7 Simulation & Evaluation chapter. Chapter 35 adds only the runtime-assurance and on-robot policy pieces.
- **Robot fleet ops, OTA, store-and-forward, idempotent APIs** (MS fleet preferred): ch24.
- **Incidents, SLOs, observability** (ANT operational processes): ch8. **eBPF** (ANT preferred): covered as a ch8 security-agent card. I judged a full eBPF lesson lower value than the gaps above; see limitations.

## Deliberately not taught
- **HashiStack product specifics (Nomad/Vault/Terraform), GitHub Actions/Artifactory admin**: product operation, not a systems skill gap. 33.x teaches the concepts behind them.
- **Qualcomm-internal tools or chipset names; Roblox and Anthropic internal systems**: not public. Only labelled public facts are used.
- **Rho-alpha model internals**: only the public announcement is used. 35.1 teaches general VLA deployment patterns.


## Build notes (Oct 12, after writing)
- Built as planned: 6 chapters, 24 lessons, 5 drills. 34.1 covers boot-time budgets; memory-footprint budgets (PSS, CMA/carve-outs) are only named in the role text, not taught in depth.
- 31.3 gang scheduler: reclaim only takes jobs from teams still above their guarantee, and the queue keeps jobs requeued by preemption (fixed and tested).
