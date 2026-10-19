# Oct 7 job alert — skill map

Covers the six roles from Chandra's LinkedIn alert (Oct 7, 2026). The postings and their source URLs are in `new-jobs-oct7-research.md`.

**Role keys:** NV-VS = NVIDIA Senior System SW Engineer, ML & Vector Search · WAY = Wayve Senior SWE, OS (Robot Software) · G-DRV = Google Staff SWE, Drivers & Systems Engineering · GM = GM Staff SWE, Simulation Platform (Galileo) · G-ACC = Google Senior Staff SWE, Accelerator Platforms · NV-MW = NVIDIA Senior SWE, Embedded Platform Middleware (Automotive & Robotics)

**"Before" column:** how well the tutorial covered the skill before this pass. It was checked against the core tutorial (ch1–14), the Tesla track (T1–T8) and `skills-academy/data/skills.json`.
- None = no coverage
- Partial = a mention or a shallow section
- Full = a dedicated lesson

**"Now" column:** where the skill is taught after this pass.

| Skill | Roles | Before | Now |
|---|---|---|---|
| Exact kNN as GEMM + GPU top-k, memory-bound math | NV-VS, G-ACC | Partial (GEMM/tiling ch12, top-k ch14) | 15.1 (sim knn) |
| IVF, product quantization, FAISS / cuVS | NV-VS | None | 15.2 (sim ivfpq) |
| Graph ANN: HNSW, CAGRA, recall@k | NV-VS | Partial (HNSW and recall@k in the RAG chapter) | 15.3 (sim hnsw, real graph walk) |
| GPU k-means, PCA | NV-VS | None (PCA mentioned once in Tesla) | 15.4 (sim kmeans) |
| Recall-vs-QPS benchmarking; Python/Java bindings | NV-VS, GM | None / Partial (pybind11 mentioned) | 15.5 (puzzle bench), 17.4 |
| Design a vector search service | NV-VS | None | Drill `vecsvc` + ch15 interview room task |
| Yocto, device tree, kernel config, secure boot | WAY, NV-MW, G-DRV | Partial (Yocto T1, boot chain lesson, T6.5; device tree full in ch10) | 16.1 (puzzle secboot) |
| Zero-copy shared-memory IPC (iceoryx-style loans) | WAY, NV-MW | Partial (ROS 2 / DDS zero-copy in ch13) | 16.2 (sim shmipc) |
| Cross-engine buffer sharing + sync (NvSci-style, generic) | NV-MW, G-DRV | None | 16.3 (sim bufattr) |
| ISO 26262 / ASIL, ASPICE, ISO 21434, MISRA, fuzzing | NV-MW, WAY, GM | Partial (Tesla T4.4, T1); ASPICE and 21434 None | 16.4 (sim asil) |
| QNX / RTOS / hypervisor partitioning | WAY, NV-MW, G-DRV | None (hypervisor mentioned once) | 16.5 (sim partition) |
| Fleet diagnostics: core dumps, upload budgets | WAY, G-DRV | Partial (core dumps mentioned once) | 16.6 (sim diagup) |
| Deterministic replay, simulator architecture | GM, WAY | None (mentioned once) | 17.1 (sim determinism) |
| Sim orchestration at scale (idempotent jobs, retries) | GM | None | 17.2 (sim simfleet) |
| Metrics, Wilson intervals, release gating, SQL/dbt | GM | Partial (release gating in CI/CD); Wilson and dbt None | 17.3 (sim gate) |
| Scenario libraries, sensor sim, pybind11 | GM, NV-VS | Partial (pybind11 mentioned) | 17.4 (puzzle scenario) |
| Design a sim replay system | GM | None | Drill `simreplay` + ch17 interview room task |
| Linux DRM / GEM / dma-buf / dma-fence | G-DRV, G-ACC, NV-MW | Partial (Po.9 mention, GPU stack ch12) | 18.1 (puzzle drmsubmit) |
| DVFS, power capping (RAPL / NVML-style), thermal | G-ACC, G-DRV | Partial (runtime PM and hwmon mentioned) | 18.2 (sim powercap) |
| I2C / SMBus / PMBus / hwmon / MCTP / PLDM / Redfish | G-ACC, G-DRV | Partial (I2C mentioned, Redfish in the AI server lesson); PMBus/MCTP/PLDM None | 18.3 (sim pmbus) |
| PCIe AER, hot-plug, CXL, P2P | G-ACC, G-DRV, NV-MW | Partial (AER ch10 mention, RDMA Po.3); CXL None | 18.4 (sim pcielink) |
| KUnit, kselftest, fault injection, staged rollout | G-DRV, G-ACC, NV-MW | None (CI/CD was general only) | 18.5 (puzzle driverlaunch) |

**Already fully covered (no new lessons):**
- Linux kernel drivers and PCIe basics (ch4, ch10)
- Linux internals and networking
- PREEMPT_RT and real-time (ch13 / Tesla)
- CUDA and the GPU execution model (ch12)
- Distributed systems, Kubernetes, CI/CD, observability
- C/C++ concurrency and memory ordering

**Out of scope or only touched on:**
- AUTOSAR and SOME/IP: none of the six postings name them. AUTOSAR gets a short mention in ch16 (16.4–16.6). SOME/IP is not taught.
- Google Drivers posting: the listing is expired and generic. Its context comes from a related Google posting, "Staff SWE, Embedded Systems/Firmware, Servers", which is labelled as related in the research file.
- NvSci: NVIDIA's internal API is not in the posting. 16.3 teaches the general attribute-reconcile and fence pattern and says so in the lesson.
