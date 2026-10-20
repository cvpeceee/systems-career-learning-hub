# Job skill map: Oct 20 job alerts

This maps each role from the Oct 20 LinkedIn alerts to the skills its posting asks for, and to where each skill is taught in this repo.

**How to read it**
- **Posting**: POSTED = text from the company posting; MIRROR = from a job-board copy of it; INFERRED = the exact posting wasn't found, so the skills come from similar postings at the same company. Sources are in [`04-interactive-tutorial/docs/new-jobs-oct20-research.md`](04-interactive-tutorial/docs/new-jobs-oct20-research.md).
- **NEW** = added on Oct 20. Everything else already existed.
- `04 37.1` = main tutorial chapter 37, lesson 1. `06 p108` / `06 sd26` = interview-prep problem / design. `07 L18` = Poly course lesson 18.
- Interview notes on 06 company pages are labelled REPORTED or INFERRED. Nothing here is a leaked question.

| Role | Posting | Skills the posting asks for → where to learn them |
|---|---|---|
| NVIDIA Senior Systems Software Engineer, Advanced Technology Group (Hillsboro) | POSTED (JR2014995) | Computational geometry for chip layouts → **NEW 04 37.3**, **NEW 06 p108**. Massively distributed compute / tiling → **NEW 04 37.3**; GPU cluster scheduling → 06 sd6. GPU acceleration → 04 ch7/ch12 (roofline, occupancy). |
| NVIDIA Senior System Software Engineer, Tegra (Santa Clara) | POSTED (3 reqs) | SoC stress tests and manufacturing screening → **NEW 04 37.1** (+ video). Kernel/driver/boot → 04 ch1–4, 07 L3–L6. Arm Trusted Firmware, secure boot → 07 L6, 04 34.3. A/B boot and recovery → 04 34.1–34.2. NVIDIA bit/memory interview questions → 06 NVIDIA page. |
| NVIDIA Senior GPU Architect (Durham) | POSTED (JR2015492) | Performance models and simulators → **NEW 04 37.2**; SystemC virtual platforms → 04 ch22. Roofline/occupancy → 04 ch7/ch12. |
| NVIDIA Senior SRE, Kubernetes Platform (Austin) | POSTED (JR2013271) | Multi-cluster upgrades, version skew, undrainable jobs → **NEW 04 39.2**. Autoscaling → **NEW 04 39.1**. OTel/Prometheus → **NEW 04 39.3**, **NEW 06 sd27**, 06 sd15. Operators in Go → 04 27.2. Safe rollouts → 04 32.2. |
| Google Senior SWE, Distributed Cloud Hosted (Sunnyvale) | POSTED | Linux distribution building, packages, kernel config → **NEW 04 38.1**; dependency order → 06 p11. Air-gapped fleet updates → 06 sd5, 04 34.1. Kubernetes lifecycle → **NEW 04 39.2**. |
| Google Senior AI Solution Builder (Austin) | POSTED | Agents, MCP tools, human-in-the-loop, evaluation gates → **NEW 04 40.3**; MCP card → 04 L6.2. RAG → 06 sd8, sd24. Observability → 04 L8.2, **NEW 04 39.3**. |
| Anthropic Staff + Sr. SWE, Scaling (Seattle) | POSTED (Greenhouse 5436703008) | Request routing / load balancing → 04 26.2. Autoscaling and placement → **NEW 04 39.1**. Orchestration of research + production work → 04 31.3, 06 sd6. Deployment pipelines for models → 04 32.2, 06 sd16. Inference serving → 06 sd3. Anthropic page in 06 extended. |
| Wing Senior Backend SWE (Palo Alto) | POSTED | Async pipelines, outbox, sagas → **NEW 04 40.1** (+ video), **NEW 06 sd26**. Idempotency → 06 c28, p103, sd20. Schema design → 06 sd2, sd22. **NEW 06 Wing page.** |
| Raytheon Senior SWE (Indianapolis) | MIRROR | DO-178 MC/DC → **NEW 04 41.2**, **NEW 06 p110** (+ video). MIL-STD-1553 → **NEW 04 41.3** (+ video). RTOS → 07 L16. Embedded C/C++ → 07 L2. **NEW 06 Raytheon page.** |
| Oracle Principal Member of Technical Staff (Austin) | INFERRED | OCI control planes → 04 31.4, 06 sd2. GPU/HPC host images → 04 32.2. Deployment safety → 04 32.2, 06 sd16. Virtual networking → **NEW 04 38.2**. Oracle page in 06 extended. |
| Oracle Senior Software Developer, Linux Networking (Austin) | MIRROR (summary only) | VXLAN/SDN, MTU, MAC learning → **NEW 04 38.2** (+ video). Embedded Linux → 07 L3–L7, L18. Rule matching → 06 p106. |
| CrowdStrike Sr. SWE II, Sensor (Austin) | POSTED (Built In mirror) | Sensor process trees, rings, content validation → **NEW 04 38.3** (+ video), **NEW 06 sd28**. eBPF/WFP → 04 L4.4. Memory corruption debugging → 07 L17. **NEW 06 CrowdStrike page.** |
| Osano Senior SWE, Full Stack (Austin / remote) | POSTED (mirror) | Privacy by design: consent, retention, residency → **NEW 04 40.2**. Feature flags / rollback → 04 32.2. **NEW 06 Osano page.** |
| Genesys AI CX Agent Principal SWE, Go (NC) | POSTED (Dice mirror) | RAG + MCP + tool use → **NEW 04 40.3**, 06 sd24, sd8. Go services → 04 39.x/40.x (all Go). **NEW 06 Genesys page.** |
| Garmin Senior SWE (Cary) | INFERRED (C++/C Outdoor posting) | Embedded C/C++ → 07 L2, L16. Navigation data → **NEW 04 41.1**. Root-cause analysis → 07 L17. **NEW 06 Garmin page.** |
| Garmin Senior C++ SWE, Map Navigation (Cary) | POSTED (Ladders mirror) | Map search, spatial indexing, prefix search, memory budgets → **NEW 04 41.1**, **NEW 06 p109**; tries → 06 c12, p14. |
| Truist Observability Forward Deployed Engineer (Raleigh/Charlotte) | POSTED (Ladders mirror) | OpenTelemetry collectors, tail sampling, cardinality → **NEW 04 39.3** (+ video), **NEW 06 sd27**. Metrics/SLO alerting → 06 sd15. **NEW 06 Truist page.** |

## What was added on Oct 20
- **04 main tutorial:** chapters 37–41 (15 lessons, 15 interactive labs, quizzes, interview rooms). Skill map: [`04-interactive-tutorial/docs/new-jobs-oct20-skillmap.md`](04-interactive-tutorial/docs/new-jobs-oct20-skillmap.md). Build files: `source/oct20-pack/`.
- **Videos:** 6 narrated videos in [`04-interactive-tutorial/videos/oct20/`](04-interactive-tutorial/videos/oct20/index.html).
- **06 interview prep:** problems p108–p110 (C++/Java/C#, tested), designs sd26–sd28, 7 new company pages (CrowdStrike, Garmin, Wing, Raytheon, Genesys, Truist, Osano), and Oct 20 links added to the NVIDIA, Google, Oracle and Anthropic pages.
- **07 Poly course:** README links lesson 18 (networking) and 16 (RTOS) to the new chapters.
