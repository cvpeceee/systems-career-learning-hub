# Oct 8 Austin roles — skill map against the tutorial (ch1–18 + Tesla track)

Legend: **FULL** already taught in depth · **PARTIAL** touched but not at job depth · **GAP** not taught. New lessons are listed for every PARTIAL and GAP. Existing coverage was checked against the built tutorial bundle (lesson titles and text).

| Role | Skill (from posting) | Before | Where now |
|---|---|---|---|
| NVIDIA Networking | TCP / sockets / packet path, NAPI, XDP | FULL | existing "Network path" + "Linux packet path" lessons |
| NVIDIA Networking | RDMA verbs, QPs, CQs, keys, completion errors | GAP | 19.1 |
| NVIDIA Networking | Lossless fabrics: credits, PFC, ECN, DCQCN, tuning | GAP | 19.2 |
| NVIDIA Networking | NCCL / collectives, NVLink, IB, Spectrum-X | PARTIAL (Tesla ring all-reduce) | 19.3 |
| NVIDIA Networking | SR-IOV, DPDK, SmartNIC/DPU, polling vs IRQ | GAP | 19.4 |
| NVIDIA Networking | FSMs, races, event loops, field root-causing | PARTIAL (ch11 races) | 19.5 + ch19 capstone |
| NVIDIA Perf | Benchmark methodology & statistics | PARTIAL ("Performance investigation") | 20.1 |
| NVIDIA Perf | PMU counters, top-down, `perf` | PARTIAL (ch11 perf/flame graphs) | 20.2 |
| NVIDIA Perf | Virtual memory, TLB, huge pages, NUMA | GAP | 20.3 |
| NVIDIA Perf | Interrupts, scheduling, idle/DVFS, perf/W | GAP | 20.4 |
| NVIDIA Perf | Competitive analysis, normalization | GAP | 20.5 |
| NVIDIA Perf | Caches, false sharing, lock-free | FULL | ch11 |
| Qualcomm | AArch64 ELs, system regs, MIDR | GAP | 21.1 |
| Qualcomm | TF-A, PSCI, UEFI, ACPI, SystemReady | PARTIAL ("Boot chain" lesson, embedded view) | 21.2 |
| Qualcomm | Weak memory models | PARTIAL (ch11 atomics) | 21.3 |
| Qualcomm | Pre-silicon, virtual platforms, HWCAP, errata | GAP | 21.4 (+ ch22) |
| AMD | VP abstraction levels, register models | GAP | 22.1 |
| AMD | SystemC / TLM-2.0 | GAP | 22.2 (compiled against libsystemc 3.0.1) |
| AMD | Distributed sync, ordering, flow control, replay | PARTIAL (17.1 deterministic replay) | 22.3 + drill "distvp" |
| AMD | Coherency, AXI/CHI/ACE, CXL, UCIe, HBM/DDR | PARTIAL (18.4 PCIe/CXL) | 22.4 |
| AMD | Validation, trace compare, fault injection, CI, co-validation | GAP | 22.5 |
| GM | Frame timing, vsync, compositors, GPU pipeline | GAP | 23.1 |
| GM | Startup performance, power moding | PARTIAL (boot chain) | 23.2 |
| GM | Vehicle signals: CAN/DBC, VHAL/VSS, SOME/IP | GAP | 23.3 |
| GM | UI thread, IPC, Qt/QML, Valgrind/TSan, static analysis | PARTIAL (16.2 zero-copy IPC, 16.5 QNX) | 23.4 |
| GM | QNX | FULL | 16.5 |
| Apptronik | Requirements, availability math, ADRs | GAP | 24.1 |
| Apptronik | Robot/integration/operator APIs, idempotency, versioning | GAP | 24.2 |
| Apptronik | Edge-cloud, MQTT QoS, outbox, CAP | GAP | 24.3 |
| Apptronik | Fleet management, data pipelines, security | PARTIAL (Tesla OTA A/B, fleet telemetry) | 24.4 + drill "raasfleet" |
| Apptronik | Modern C++ multithreading on Linux | FULL (ch11) | reused; 23.4/24.x code |

Totals: 31 skills mapped — 5 FULL, 11 PARTIAL, 15 GAP before; all PARTIAL and GAP now have a dedicated lesson.
