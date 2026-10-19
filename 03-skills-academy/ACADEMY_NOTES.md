# Skills Academy v2 — Chandra Vig

A deep, animated, offline learning app for senior/staff/principal **systems** roles. It is grounded in the Oct 2026 LinkedIn job alerts (NVIDIA, Anthropic, OpenAI, Google, Cisco, F5, Cloudflare, CrowdStrike, Microsoft, GM, Ford, Intel, Walmart, JPMC, Palo Alto Networks, Clockwork, Unity) plus the Sep 2026 saved-jobs skill map. It builds on your Poly (HP) work with NXP / Qualcomm / Ambarella CV7 / Lontium drivers. Tesla Optimus and robotics run through it as a parallel thread.

## How to open
- **Double-click `index.html`.** No network and no build step are needed. Everything is vanilla HTML/CSS/JS and the sims run locally on canvas/SVG.
- Or serve it: `cd skills-academy && python3 -m http.server 8000` and open http://localhost:8000.
- **Portable single file:** `../Chandra_Vig_Skills_Academy.html` has all CSS and JS inlined. Double-click it on any computer.
- Progress (XP, levels, streak, badges, quiz answers, gym times, scratchpads) lives in your browser's `localStorage` under the key `skillsAcademy.v2`. Use **Progress & badges → Export** to move it to another browser or computer, and **Import** to load it back.

## What's inside
| | Count |
|---|---|
| Modules (skill clusters) | 14 |
| Lessons | 68 (3-6 per module) |
| Interactive simulations | 70 distinct (73 mounts across lessons) |
| Quiz questions (with explanations, incl. predict-the-output) | 273 |
| Hands-on challenges (progressive hints + solution sketch) | 68 |
| Interview Gym coding problems (C++ reference solutions) | 21 |
| System-design drills (step-by-step, animated diagram, 45-min clock) | 6 |
| Skills in the skill map / jobs mapped / job-lens roles | 54 / 53 / 29 |

Every lesson has these parts:
- an **analogy hook**
- a **deep explanation** covering mechanisms, numbers and gotchas
- one or more **interactive sims**
- a **Poly connection** box
- a **quiz**
- a **hands-on challenge**
- an **interview angle** (senior/staff questions and what a strong answer contains)
- **further resources** (real URLs, link-checked on 2026-10-01)

### Modules
1. C/C++ systems mastery: RAII/lifetimes, move semantics, templates vs virtual dispatch, UB, atomics/memory model
2. Linux kernel & drivers: syscall path/char drivers, Device Tree & probe, IRQ top/bottom halves, DMA rings & coherency, virtual memory/TLB, scheduler
3. Embedded bring-up: boot chain/secure boot, Yocto/BSP, I2C/SPI/MIPI buses, camera/ISP pipelines
4. Concurrency & performance: cache hierarchy, false sharing, mutex vs spinlock vs lock-free, SPSC/ABA, deadlock & priority inversion
5. GPU & CUDA stack: SIMT/warp divergence, memory hierarchy/coalescing, occupancy/roofline, streams & CUDA Graphs, UMD vs KMD driver stack, MIG/MPS/time-slicing
6. AI inference serving: prefill vs decode, KV cache & PagedAttention, continuous batching, tensor/pipeline/expert parallelism, disaggregated serving & KV-aware routing (Dynamo/vLLM/Triton concepts)
7. Distributed systems: time/Lamport clocks, Raft, replication & quorums, partitioning/consistent hashing, failure modes/retry storms/idempotency
8. Networking: TCP congestion control, IP/LPM, BGP, Linux packet path/data vs control plane, RDMA/RoCE & collectives, load balancing
9. Cloud & deployment: containers/cgroups, Kubernetes reconciliation, canary/error budgets, global config rollout, testing at scale/flaky CI
10. Security & identity: JWT/tokens, OAuth 2.0/OIDC, mTLS/zero trust, endpoint sensors (kernel hooks, eBPF, ESF, ETW)
11. Observability & profiling: metrics/cardinality, tail latency, eBPF hook points, perf/flame graphs/profiling services
12. Robotics & control: PID, kinematics, ROS 2 graph/DDS QoS, real-time Linux & jitter, edge perception
13. System design for staff: estimation, queues/backpressure, caching, staff signals & decision docs
14. Interview coding: sliding window, graphs, heaps/top-k, bit manipulation (with in-lesson visualizers)

### Other pages
- **Skill Map:** a bubble chart (AI-hard-to-replace × redeployable-to-robotics, bubble size = job demand, gold ring = builds on Poly) with tier, cluster and source filters. It also has a top-10 demand list and a skills × companies heatmap. The data is in `data/skills.json`.
- **Job lens:** pick a target role (e.g. NVIDIA CUDA Driver Perf, Anthropic Cloud Inference, Google Embedded Platforms, OpenAI Compute Foundations). The app then highlights the lessons you need across the sidebar, modules and path.
- **Learning path:** 4 phases mapped to the 12-month plan (below).
- **Interview Gym:** each problem has a timer, a "no AI during this attempt" honor check, a scratchpad, 3 progressive hints, a hidden C++ solution, complexity and follow-ups. Problems: LRU, ring buffer, rate limiter, blocking queue, bit tricks, intervals, top-k, topo sort, islands, trie, time-KV store, rotated search, fixed-block pool allocator, consistent-hash ring, rotate image in place, decode string, reverse linked list / k-group, Dijkstra, ping-pong threads, sliding-window max, aligned malloc.
- **Design drills:** GPU job scheduler, LLM inference serving, global config rollout, telemetry pipeline, device fleet OTA, distributed rate limiter. Each step is "your turn first", then a coach answer is revealed and the architecture diagram animates in.
- **Gamification:**
  - XP for lessons, quizzes, challenges, gym problems and drills
  - levels with titles and a daily streak
  - a badge per module plus special badges
  - a skill radar that fills as you finish lessons (75%) and ace quizzes (25%)

## Learning path (core systems first, then GPU/inference and distributed/networking, with robotics woven in)
- **Phase 1, months 1-3:** systems core and coding rhythm (C++, kernel, boot/buses, caches, coding patterns, PID). Milestone: an out-of-tree driver and QEMU lab on GitHub, plus 15 Gym problems.
- **Phase 2, months 4-6:** concurrency, performance and eBPF, Yocto/camera depth, real-time/ROS 2/kinematics, estimation and staff signals. Milestone: a perf case study and a ROS 2 real-time demo, plus the OTA and telemetry drills.
- **Phase 3, months 7-9:** the GPU/CUDA stack, inference serving, TCP/packet path/RDMA, time/Raft/failure handling, edge perception. Milestone: a CUDA mini-project with Nsight evidence and an inference simulator, then apply to NVIDIA driver and inference roles.
- **Phase 4, months 10-12:** replication and partitioning, IP/BGP/LB, containers to Kubernetes, canary/config/testing, security and identity, metrics and tail latency, caching and queues design. Milestone: polished design-doc portfolio and principal-level interview loops.

## Structure
```
index.html            shell; loads scripts in order (no bundler)
css/academy.css       dark theme, layout, animations
js/sims-core.js       SimKit (canvas, controls, loop, drawing helpers) + sim registry (defSim/mountSim)
js/sims-systems.js    C++/kernel/embedded/concurrency sims
js/sims-gpu.js        GPU/CUDA + inference sims
js/sims-dist.js       distributed, networking, cloud sims
js/sims-misc.js       security, observability, robotics, design, coding sims
js/skills-data.js     generated from tools/build_skills.py (same data as data/skills.json)
js/content/mNN-*.js   one file per module: lessons with analogy/body/sims/poly/quiz/challenge/interview/resources
js/gym.js             Interview Gym problems
js/design.js          system-design drills
js/path.js            learning path phases
js/skillmap.js        Skill Map page (bubble chart, heatmap)
js/core.js            state, XP/levels/badges/streak, radar, router, page renderers
data/skills.json      merged skill map: skills, jobs needing each (count + companies), tier, ratings, Poly link
tools/                build_skills.py, build_single.py, test_app.py, screenshots.py
screenshots/          key demos captured by tools/screenshots.py
```

### Adding a lesson or module
Push into `ACADEMY.modules` from a new `js/content/*.js` file and add a `<script>` tag to `index.html` before `core.js`. A lesson looks like this:
`{id, title, minutes, skills:[skillIds], sims:[simNames], analogy, body (HTML), poly, quiz:[{q, opts, a, why}], challenge:{task, hints:[], solution}, interview:[{q, a}], resources:[[label, url]]}`.
To add a sim, call `defSim(name, title, desc, (root, K) => {...})` using the SimKit helpers.

## Tooling
- Regenerate the skill map with `python3 tools/build_skills.py`. It writes `data/skills.json` and `js/skills-data.js`.
- Rebuild the portable file with `python3 tools/build_single.py`. It writes `../Chandra_Vig_Skills_Academy.html`.
- Run the headless smoke test with `python tools/test_app.py` (needs Playwright + Chromium). It visits every route, module, lesson, gym problem and drill, pokes the sim controls, checks that canvases draw and animate, and fails on any console or page error.
- Take screenshots with `python tools/screenshots.py`.

## Notes and limitations
- Job requirements were sampled from live postings for 13 roles. The rest are **inferred from title/team** and marked that way in `skills.json`. Ratings are judgment calls.
- The sims are teaching models. Their numbers are illustrative and realistic in magnitude, not benchmarks. The JWT sim uses a toy hash, not real HMAC.
- There is no in-browser C++ compiler. The Gym has a timer, scratchpad and reference solution, so compile locally (`g++ -std=c++20 -O2 -fsanitize=address,undefined`).
- Some resource sites (cppreference, ACM Queue, O'Reilly, vLLM docs) block automated link checkers. They return 403/429 to bots but work in a browser.
- The v1 hub at `../learning-hub/` is unchanged and linked from the sidebar. That link works in the tar.gz package, where both folders sit side by side.
