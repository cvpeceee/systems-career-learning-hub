# Oct 11 job alert: skill map

**Roles** (sources are in `new-jobs-oct11-research.md`):
- **META** = Meta SWE, HW/SW Co-Design
- **LI** = LinkedIn Staff SWE, Systems & Infrastructure
- **NV-TR** = NVIDIA Sr System SWE, Dynamo-Triton Inference Server
- **NV-GO** = NVIDIA Sr Distributed SWE, Golang, DGX Cloud
- **G-INF** = Google Staff SWE, AI & Infrastructure (Borglet)
- **G-SRC** = Google Staff SWE, Source Client (jj/Git)

**What I checked against:**
- core ch1–18 and the Oct 8 chapters ch19–24
- the Tesla track (T1–T8 and its drills)
- the Oct 7 and Oct 8 skill maps
- every existing lesson title and concept, pulled from the built bundle

**"Before" ratings:**
- **None** = not taught.
- **Partial** = a short card or a passing mention. Chapters 1–8 are one-paragraph cards with a 4–6 line code sample.
- **Full** = a dedicated, deep lesson.

## Gaps, now taught (6 chapters, 19 lessons, 3 drills)

| Skill | Roles | Before | Now |
|---|---|---|---|
| Fleet workload characterization: per-service CPU profiles, workload classes, representative benchmarks, proxy fidelity | META | Partial (ch20.1 benchmark noise, 20.2 top-down; nothing on fleet-level characterization or benchmark representativeness) | **25.1** (sim `fleetmix`) |
| Pathfinding and TCO/perf-per-watt modelling for next-gen platforms; when to co-design or offload | META, G-INF | Partial (20.5 competitive normalization; no TCO model) | **25.2** (sim `tco`) |
| Memory and storage tiers: DRAM/CXL tiering, flash vs HDD, cost per GB and per IOPS | META, NV-GO, LI | Partial (CXL is named in 18.4 and 22.4; no tiering or storage-media economics) | **25.3** (sim `tiering`) |
| Triton server internals: model repository and config, scheduler, dynamic batcher, instance groups, backends, ensembles, KServe v2 HTTP/gRPC | NV-TR | Partial (one ch7 card "Inference serving: batching, KV cache & parallelism"; no Triton) | **26.1** (sim `dynbatch`, C++ batcher under TSan) |
| LLM serving at scale: prefill vs decode, disaggregation, KV-cache-aware routing, SLO-driven autoscaling | NV-TR | None (prefill named 5 times, no disaggregation or routing) | **26.2** (sim `disagg`, Rust router) |
| KV-cache memory management: paged blocks, prefix sharing, ref counts, eviction, offload tiers | NV-TR | Partial (the ch7 card names the KV cache only) | **26.3** (sim `kvpage`) |
| Rust for C++ systems engineers: ownership, borrowing, Send/Sync, Arc/Mutex, channels | NV-TR, G-SRC, LI | None (Rust is named across the course but never taught) | **26.4** (sim `borrow`, Rust sample) |
| Production Go concurrency: bounded parallelism, cancel-on-first-error, backpressure, leaks, race detector, pprof | NV-GO, LI | Partial (ch2 cards on goroutines/channels and context, 4–5 lines each) | **27.1** (sim `gopool`, `go test -race`) |
| Kubernetes controllers/operators in Go: informers, work queues, level-triggered reconcile, finalizers, status, CSI | NV-GO, G-INF | Partial (ch3 card "Kubernetes control loops", YAML only) | **27.2** (sim `reconcile`) |
| Distributed storage service design: chunking, placement (consistent hashing, failure domains), replication vs erasure coding, durability math, rebalancing | NV-GO, LI | None (Raft/CAP cards exist; no storage placement or durability) | **27.3** (sim `placement`) |
| Partitioned logs: partitions, keys, consumer groups, offsets, delivery semantics, idempotent consumers | LI | None (Kafka named once) | **28.1** (sim `consumer`) |
| Stream processing: event time, watermarks, windows, state, checkpoints (Flink-style) | LI | None | **28.2** (sim `watermark`) |
| Storage engines and table formats: LSM trees, compaction, Bloom filters, amplification; Iceberg-style snapshots | LI, NV-GO | None (LSM named once) | **28.3** (sim `lsm`) |
| Node agent and Linux resource isolation: cgroup v2 cpu.max/weight, memory.high/max, PSI, OOM, batch vs latency-sensitive | G-INF | Partial (ch3 card names cgroups; ch4 processes card) | **29.1** (sim `cgroup`) |
| Cluster scheduling and capacity: bin packing, fragmentation, priority and preemption, GPU/TPU topology, capacity planning | G-INF, LI, NV-GO | Partial (ch3 card names the scheduler) | **29.2** (sim `binpack`) |
| Virtualization and sandboxing: KVM, VM exits, EPT two-level walks, VFIO passthrough, gVisor, microVMs | G-INF | None (gVisor named twice, no KVM) | **29.3** (sim `vmexit`) |
| VCS internals: content-addressed objects, Merkle trees, Git object model; jj (working copy as a commit, change IDs, op log, first-class conflicts) | G-SRC | None (Git appears only in the GitOps card) | **30.1** (sim `merkle`, Go sample) |
| Monorepo virtual filesystem clients: FUSE, lazy fetch, sparse checkout, overlays, caching, metadata prefetch | G-SRC | None ("FUSE" hits were "fused" kernels) | **30.2** (sim `vfs`) |
| File watching and fast status: inotify, overflow and rescan, journals and clocks (Watchman-style), stat caching | G-SRC | None | **30.3** (sim `watch`, real inotify in C) |
| Design drills | NV-TR · G-SRC · NV-GO/LI | None | `llmserve` "Design an LLM inference serving system", `monovfs` "Design a monorepo virtual filesystem client", `aistore` "Design a storage service for AI training data" |

## Already covered: no new lessons
- **GPU/CUDA basics, roofline, INT8 quantization:**
  - ch7, ch12, Tesla T3.1/T3.3.
  - META does not name numerics, compilers or kernels. I did not add a quantization or compiler lesson; that would be padding.
- **RDMA, GPUDirect, collectives, lossless fabrics:** ch19. This covers NV-GO's stand-out GPU Direct Storage, DPU and RDMA.
- **CPU performance and the memory hierarchy:**
  - ch11 and ch20: top-down, PMU, TLB/NUMA, tail latency, competitive analysis.
  - META's "identify platform resource bottlenecks" is taught there. 25.1 links back to it.
- **Raft, CAP, quorums, retries, idempotency:** ch1 and ch24.2.
- **gRPC and the TCP path:** ch4.
- **Containers, namespaces, Terraform/GitOps:** ch3.
- **Observability, SLOs, incidents:** ch8.
- **Agentic AI and MCP:** ch6. This covers G-SRC's "integrating generative AI/agents into workflows". 30.3 adds a short tie-in about agents editing files and watching status.
- **C++ concurrency, RAII, memory ordering:** ch9, ch21.3.
- **Distributed training:** Tesla T8.

## Deliberately not taught
- **Hack/PHP** (META benchmark languages): language syntax only, not a systems skill.
- **Spark/Trino/Pinot/ClickHouse product details** (LI preferred list): 28.2 and 28.3 teach the shared ideas (streams, columnar snapshots, LSM) instead of each product.
- **NVIDIA's internal Dynamo and Triton code layout:** 26.x teaches the public architecture and is labelled product background (INFERRED). No internal details are invented.
- **Google internal Piper/CitC/Borg code:**
  - Only the public papers (CACM 2016, EuroSys 2015) inform context. The lessons say so.
  - jj facts come from its public docs.
