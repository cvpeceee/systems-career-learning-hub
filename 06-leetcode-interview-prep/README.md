# 06 · LeetCode-Style Interview Prep (phases 1–2)

A practice gym for staff/principal systems interviews (NVIDIA, Anthropic, Google, Tesla Optimus, Roblox, Qualcomm, Microsoft Robotics).

## How to open
Download this whole folder (it needs `data.js`, `app.js`, `player.js` and `videos/` next to `index.html`), then open **`index.html` in Chrome** on your laptop or phone. It works fully offline: no internet and no CDN.

## What's inside
| Part | Count | Notes |
|---|---|---|
| Coding problems | 110 | The classic pattern list (arrays, hashing, stacks, lists, trees, graphs, heaps, intervals, binary search, backtracking, DP, bits, union-find, tries) plus systems problems: LRU/LFU cache, ring buffer, lock-free SPSC queue (ThreadSanitizer stress test), bounded blocking queue (TSan), timer wheel, buddy allocator, rate limiters, rolling percentile; plus 42 company-tagged problems (Meta, Google, Amazon, Microsoft, Netflix, NVIDIA bit/memory questions, Tesla embedded + Autopilot, Oracle, Apple, and OpenAI/Anthropic/Stripe-style multi-part practicals). Each has a statement, examples, constraints, pattern tags, target companies, course mapping and similar LeetCode problems |
| System design questions | 28 | Rate limiter, distributed KV store, LLM inference serving, fleet telemetry, OTA updates, GPU cluster scheduler, video SFU, vector search, robot fleet, training checkpointing, CI build cache, object store, Kafka-style log, notifications, metrics/SLO, model rollout, typeahead, Netflix CDN, Uber matching, Stripe idempotent payments, Databricks shuffle, buffer pool/WAL, iCloud-style sync, RAG search, news feed, plus (Oct 20) drone-delivery order pipeline, OpenTelemetry fleet pipeline, endpoint-sensor content updates. Each has an animated architecture diagram with failure injection |
| Design components (code) | 5 | Token bucket, consistent hash ring, paged KV-cache allocator, windowed hit counter, A/B OTA state machine |
| Concept videos | 31 | Narrated MP4s, about 1.7–2.5 min each (new: union-find, tries, bit tricks, binary search, backtracking, intervals, consistent hashing, caching, queues/backpressure/SPSC, replication, sharding, CAP/quorums, prefix sums & Fenwick, monotonic stack, topological sort, grid DP, KMP/rolling hash, idempotency & retries, CDN, transactions/MVCC/WAL, leader election), with an in-page animated version |

Every problem follows the same path:
1. Practice box: timer, code editor, three tiers of hints, a self-grading rubric, and solved/review tracking saved in your browser.
2. Reveal: when you click it you get the plain-words analogy, brute force, then the optimal solution, with time and space cost explained simply.
3. Animated walkthrough of the real example data.
4. Code in C#, Java and C++ with comments and a line-by-line table.
5. Execution visualizer: steps through the C++ run line by line (and Java/C# runs for 83 problems and components, picked with the C++/Java/C# trace buttons), showing call-stack frames pushing and popping, their local variables, and data structures.
6. Interview script and follow-up questions.

The Mock interview tab picks one coding problem and one design question and runs an 80-minute loop timer.

The **Companies** tab has 25 company pages (Meta, Google, Amazon, Microsoft, Netflix, NVIDIA, Tesla, Oracle, Apple, OpenAI, Anthropic, plus Uber, Stripe, Databricks, Qualcomm, AMD, Airbnb, Cloudflare, plus seven from the Oct 20 job alerts: CrowdStrike, Garmin, Wing, Raytheon, Genesys, Truist, Osano). The Oct 20 pages have no verified interview reports: every link there is INFERRED from the posted job requirements. Each page has an analogy-first overview, the reported loop, the patterns, 6–9 labelled problems (REPORTED / POSTED-OFFICIAL / INFERRED), design questions and a company mock interview. Sources are in `company-research.md`. None of these are guaranteed or leaked questions.

## Oct 20 additions
- Problems: **p108** Rectangle Area II (LC 850, chip-layout coverage), **p109** nearest point of interest with a grid index (Garmin/Wing), **p110** MC/DC coverage check (Raytheon/Garmin avionics). Each in C++, Java and C#, tested, with recorded traces.
- Designs: **sd26** drone-delivery order pipeline, **sd27** OpenTelemetry observability pipeline, **sd28** endpoint-sensor content-update pipeline. All marked INFERRED from postings.
- NVIDIA, Google, Oracle and Anthropic pages gained links labelled with the Oct 20 posting they come from.
- Role-by-role map: `../JOB_SKILL_MAP.md`.

## How it was verified
- `TEST_RESULTS.txt`: every solution was compiled and run against its test cases in **C++** (g++ 14, `-fsanitize=address,undefined`), **Java** (OpenJDK 21) and **C#** (.NET 8). The result is 531/531 test cases per language (re-run Oct 20). The SPSC and bounded blocking queues also pass ThreadSanitizer stress tests.
- Execution traces are **recorded from real runs** of an instrumented C++ build (`-DTRACE`) and, where available, of the Java and C# solutions (StackWalker / StackTrace tracers). They are not hand-written.
- Videos: animation frames are drawn by `player.js` in headless Chrome and encoded with ffmpeg. Narration is Piper offline neural TTS (voice `en_US-lessac-medium`), and captions are burned in, with a `.vtt` file alongside.
- A headless Chrome check of every page found 0 console errors and 0 external requests. All players were stepped end to end, and the mobile viewport was checked at 390 px.

## Rebuild
See `source/`. `python3 gen.py` builds, tests and traces everything. Then `lessons/tts.py` narrates, `node lessons/render.js` renders the videos, and `build_site.py` assembles the site.
