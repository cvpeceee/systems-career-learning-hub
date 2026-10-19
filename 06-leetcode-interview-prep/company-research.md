# Company research — interview styles and reported problems

Compiled 2026-10-19 for the Companies tab. **Labels:** **REPORTED** means it shows up in public candidate reports (the source type is given). **POSTED/OFFICIAL** means the company published it. **INFERRED** means it matches the reported style or topics but no specific report names it. None of these are guaranteed or leaked questions. Loops change by team, level and year, so practise the pattern rather than the exact prompt.

## Source types
- **lc-tag**: LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations)
- **lc-discuss**: LeetCode Discuss interview-experience post
- **gfg**: GeeksforGeeks interview-experience post
- **taro**: Jointaro interview-experience post
- **glassdoor**: Glassdoor interview reviews
- **blog**: Candidate blog / Medium post
- **agg**: Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub)
- **guide**: Third-party prep guide summarising candidate reports
- **official**: Company-published material (careers page, engineering blog, docs)
- **course**: cvpeceee/interview-mastery-courses company course (read-only)

## Meta

A Meta coding round is a speed-chess game: two medium problems in about 40 minutes, and the code is expected to actually run. Clean, correct and fast beats clever.

**Interview style**
- Two coding problems per 45-minute round; working code expected (course + reports).
- "Ninja" coding rounds, "Jedi" system design for E5+, behavioral "Jedi" for culture.
- Some loops now include an AI-assisted coding round (course note).
- Heavy on strings, stacks, trees/BFS, intervals, prefix sums.

**Reported loop:** Recruiter screen → Technical screen: 45 min, often 2 problems on CoderPad → Onsite: 2 × coding, 1 × system design (E5+), 1 × behavioral → Team matching

**Most-reported patterns:** Stack/parsing, Two pointers, Tree BFS, Prefix sums + hash map, Heaps / k-th element, Intervals

| Problem | Label | Source / note |
|---|---|---|
| p66-min-remove-parens | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) — #1 in 2026 Meta frequency lists |
| p71-valid-word-abbreviation | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p67-valid-palindrome-ii | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p69-vertical-order | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p68-basic-calculator-ii | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p70-subarray-sum-k | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p09-kth-largest | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p49-k-closest | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p15-merge-dma | INFERRED | Merge Intervals is Meta-tagged; this is the systems variant |

| Design | Label | Source / note |
|---|---|---|
| sd25 | REPORTED | Third-party prep guide summarising candidate reports — News feed is a commonly reported Meta design prompt |
| sd2 | INFERRED | Distributed KV store; generic storage design |

**Mock:** 45 min. Two problems in one 45-min round, then design.

## Google

Google interviews feel like a puzzle-maker who keeps adding twists: you solve the base problem, then the interviewer changes a constraint and watches how you adapt. Follow-ups are the real test.

**Interview style**
- 2–3 algorithmic coding rounds with heavy follow-ups (course).
- Dedicated system design from L5; Googleyness & Leadership round.
- Hiring committee decides, then team match.
- Some teams piloted AI-assisted code-comprehension rounds (course note).

**Reported loop:** Recruiter screen → 1–2 technical phone screens (shared doc/editor) → Onsite 4–5 × 45 min: 2–3 coding, design (L5+), G&L → Hiring committee → team match

**Most-reported patterns:** Graphs/BFS, Hashing, Binary search on answer, Advanced data structures (Fenwick/segment tree), Tries, DP

| Problem | Label | Source / note |
|---|---|---|
| p72-longest-consecutive | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) — in 2026 Google top lists |
| p25-trapping-rain-water | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p02-longest-substring | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p73-word-ladder | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p74-snapshot-array | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p76-decode-string | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p30-word-search-ii | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p75-range-sum-fenwick | INFERRED | Google likes data-structure follow-ups |

| Design | Label | Source / note |
|---|---|---|
| sd17 | REPORTED | Third-party prep guide summarising candidate reports — Search autocomplete/typeahead is a widely reported Google prompt |
| sd2 | INFERRED | Storage design |

**Mock:** 45 min. One problem plus at least two follow-ups; then design.

## Amazon

Amazon interviews are two interviews braided together: a coding problem and a Leadership Principles story. Like a chef asked to cook AND explain how they once handled a kitchen fire — both are graded.

**Interview style**
- Almost every round includes Leadership Principle questions; Bar Raiser has veto (course).
- Medium LeetCode-style coding; object-oriented design appears more than at peers.
- System design for SDE II+ with AWS-flavoured thinking.

**Reported loop:** Online assessment (coding + work-style) → Phone screen (coding + LP) → Loop 4–5 rounds: coding + LP in each, 1 design (SDE II+), Bar Raiser

**Most-reported patterns:** Arrays/strings, Hash maps, Grid BFS, Heaps / top-k, DP, LRU-style design

| Problem | Label | Source / note |
|---|---|---|
| p01-two-sum | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) — in 2026 Amazon top lists |
| p78-best-time-stock | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p20-lru-cache | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p10-islands | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p77-longest-palindrome-substring | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p58-top-k-words | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p31-rotting-oranges | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p79-maximal-square | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |

| Design | Label | Source / note |
|---|---|---|
| sd12 | INFERRED | Object store — AWS-flavoured storage design |
| sd14 | INFERRED | Notifications at scale |

**Mock:** 60 min. Pair each coding round with one LP story (STAR, 3 minutes).

## Microsoft

A Microsoft loop is like a code review with a friendly senior colleague: clear, testable code and how you explain trade-offs matter as much as the trick. Growth mindset is an explicit signal.

**Interview style**
- Clean, testable code; edge cases and tests spoken aloud (course).
- Team-driven loops; an "as appropriate" (AA) interviewer may join late.
- Classic data-structure problems: linked lists, matrices, parsing.

**Reported loop:** Recruiter screen → Online assessment or technical phone screen → Loop of 4–5 interviews: coding, design (senior), behavioral, AA

**Most-reported patterns:** Linked lists, Matrix simulation, Robust parsing, Graphs/topological sort, Design

| Problem | Label | Source / note |
|---|---|---|
| p80-spiral-matrix | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p81-atoi | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p82-add-two-numbers | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p06-reverse-list | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p77-longest-palindrome-substring | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p11-course-schedule | INFERRED | Topological sort appears across Microsoft tag lists |
| p96-compare-versions | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |

| Design | Label | Source / note |
|---|---|---|
| sd1 | INFERRED | Rate limiter (also in the Microsoft course) |
| sd23 | INFERRED | Sync service — OneDrive/Office flavour |

**Mock:** 60 min. Write tests out loud; discuss trade-offs.

## Netflix

Netflix hires like a pro sports team signing veterans: they expect you to already play at a senior level. Coding is classic and medium; the weight sits on system design and on how you own decisions ("freedom and responsibility").

**Interview style**
- Senior-heavy: system design and culture conversations carry the most weight (Glassdoor senior reports).
- Coding rounds are classic mediums, often practical.
- Team-specific loops; the hiring manager owns the process.

**Reported loop:** Recruiter + hiring-manager screen → Technical screen (coding) → Onsite: coding, 1–2 system design, culture/values, manager

**Most-reported patterns:** Caching, Rate limiting / time windows, Streaming stats, Heaps / top-k, Design

| Problem | Label | Source / note |
|---|---|---|
| p20-lru-cache | INFERRED | Caching is central to Netflix systems |
| p84-logger-rate-limiter | INFERRED | Time-window dedupe — practical medium |
| p56-sliding-log-limiter | INFERRED | Rate limiting |
| p57-rolling-percentile | INFERRED | Streaming metrics |
| p58-top-k-words | INFERRED | Top-k over streams |
| p97-time-kv-store | INFERRED | Versioned config store |

| Design | Label | Source / note |
|---|---|---|
| sd18 | REPORTED | Third-party prep guide summarising candidate reports — "Design Netflix / a video streaming service" is a classic reported prompt; Open Connect architecture is POSTED/OFFICIAL on Netflix tech blog |
| sd15 | INFERRED | Metrics & SLO monitoring |

**Mock:** 60 min. Spend most of the time on design; defend decisions you own.

## NVIDIA

An NVIDIA systems interview is a mechanic's test: they open the hood and ask you to explain every part. C/C++, pointers, bits, memory layout and OS internals, then a from-scratch data-structure question.

**Interview style**
- C/C++ and OS heavy: pointers, endianness, memory layout, threads/semaphores, paging (LeetCode Discuss, GfG).
- Bit manipulation is very common (reverse bits in a range, count set bits, extract/set bits).
- "Write everything from scratch" linked-list / stack questions.
- Team-specific depth: drivers, firmware, CUDA, AI infrastructure.

**Reported loop:** Recruiter screen → Online assessment (coding + C++ output + OS MCQs) for some roles → 2–3 technical rounds (C++, OS, DSA, domain) → Manager round (also technical)

**Most-reported patterns:** Bit manipulation, Memory / pointers, Linked lists, Stacks, Concurrency (SPSC, semaphores)

| Problem | Label | Source / note |
|---|---|---|
| p85-reverse-bits-range | REPORTED | LeetCode Discuss interview-experience post — "reverse bits in range l to r" |
| p83-min-stack | REPORTED | LeetCode Discuss interview-experience post |
| p89-palindrome-list | REPORTED | LeetCode Discuss interview-experience post — manager round |
| p06-reverse-list | REPORTED | GeeksforGeeks interview-experience post — also LeetCode Discuss |
| p87-memmove-overlap | REPORTED | GeeksforGeeks interview-experience post — "implement your memcpy, handle overlap" |
| p86-hex-to-decimal | REPORTED | GeeksforGeeks interview-experience post |
| p88-byte-swap | REPORTED | LeetCode Discuss interview-experience post — endianness check, also GfG |
| p19-counting-bits | REPORTED | Jointaro interview-experience post — count set bits efficiently |
| p59-spsc-queue | INFERRED | Lock-free queues for driver/runtime roles |

| Design | Label | Source / note |
|---|---|---|
| sd3 | INFERRED | LLM inference serving on GPUs |
| sd6 | INFERRED | GPU cluster scheduler |

**Mock:** 60 min. One bit/memory question, one from-scratch DSA question; expect C++ follow-ups.

## Tesla

Tesla has three different exam rooms behind one door. Software/backend gets standard mediums; firmware gets an embedded-C test (bits, volatile, ring buffers, state machines); Autopilot gets hard algorithms plus C++, GPU and from-scratch ML. Ask the recruiter which room you are in.

**Interview style**
- Track A (software/backend): medium LeetCode, OA then live rounds (guide).
- Track B (firmware): embedded-C test — bit manipulation, volatile, interrupt-safe circular buffer, RTOS races, CAN, state machines (guide; Taro reports C/C++ only).
- Track C (Autopilot/AI): hard algorithms + modern C++ + CUDA + ML from scratch (k-means, convolution, NMS) (guide).
- Prompts are often tweaked mid-round.

**Reported loop:** Recruiter screen (ask which track!) → OA (Codility/HackerRank) or embedded-C test → Live technical screen → Onsite 3–5 rounds; some teams add a project presentation

**Most-reported patterns:** Bit manipulation, Ring buffers, State machines, Matrix/convolution, Geometry/greedy (NMS), LRU-style design

| Problem | Label | Source / note |
|---|---|---|
| p90-non-max-suppression | REPORTED | Third-party prep guide summarising candidate reports — Autopilot track ML-from-scratch |
| p91-conv2d | REPORTED | Third-party prep guide summarising candidate reports — Autopilot track |
| p21-ring-buffer | REPORTED | Third-party prep guide summarising candidate reports — "interrupt-safe circular buffer — the firmware signature" |
| p92-can-signal-extract | INFERRED | Bits + CAN are reported topics; this exact task is inferred |
| p93-debounce-fsm | INFERRED | State machines are a reported firmware topic |
| p20-lru-cache | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — Tesla-tagged problem lists |
| p59-spsc-queue | INFERRED | Lock-free producer/consumer for real-time code |

| Design | Label | Source / note |
|---|---|---|
| sd9 | INFERRED | Robot/vehicle fleet |
| sd5 | INFERRED | Safe OTA updates |

**Mock:** 60 min. Pick your track: firmware = bits/ring buffer/FSM; Autopilot = conv/NMS + a graph problem.

## Oracle

Oracle is a giant with many houses: cloud (OCI) teams interview like a big-tech loop, while database/server-technology teams go deep into storage internals — like a car company that also builds the engines.

**Interview style**
- Medium LeetCode-style coding in most org loops (LeetCode tag lists).
- DB / server-technology teams ask about storage internals: buffer pools, transactions, indexes (Glassdoor reports, team-dependent).
- OCI teams add distributed-systems design.

**Reported loop:** Recruiter screen → 1–2 technical phone screens → Onsite 3–5 rounds: coding, design, hiring manager

**Most-reported patterns:** Caching / buffer pools, Transactions, Arrays/strings, Stacks, Design

| Problem | Label | Source / note |
|---|---|---|
| p20-lru-cache | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p78-best-time-stock | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p77-longest-palindrome-substring | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p94-clock-buffer-pool | INFERRED | DB internals for server-technology teams |
| p101-inmem-db-transactions | INFERRED | Transactions / undo logs |
| p80-spiral-matrix | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p83-min-stack | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |

| Design | Label | Source / note |
|---|---|---|
| sd22 | INFERRED | Storage engine: buffer pool + WAL + transactions |
| sd2 | INFERRED | Distributed KV store |

**Mock:** 60 min. For DB teams, expect a storage-internals deep dive.

## Apple

Apple interviews are run by each team like its own small company: two candidates for different teams can have completely different loops. Expect careful, polished code and deep questions in the team's domain.

**Interview style**
- Loops are owned by the hiring team; content varies a lot (course).
- Technical phone screens on CoderPad; onsite 4–8 rounds incl. domain deep-dive.
- Some teams include a project presentation or a final manager round.

**Reported loop:** Recruiter + hiring-manager conversation → 1–2 technical phone screens (CoderPad) → Onsite/virtual 4–8 × 45–60 min: coding, design, domain, behavioral

**Most-reported patterns:** Matrices/hashing, Strings/parsing, Stacks, Bits & memory (hardware teams), Sync / versioning

| Problem | Label | Source / note |
|---|---|---|
| p95-valid-sudoku | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p96-compare-versions | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p68-basic-calculator-ii | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p76-decode-string | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p79-maximal-square | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p88-byte-swap | INFERRED | Hardware/firmware teams |
| p82-add-two-numbers | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |

| Design | Label | Source / note |
|---|---|---|
| sd23 | INFERRED | On-device sync (iCloud-style) |
| sd5 | INFERRED | Safe OTA updates |

**Mock:** 60 min. Ask the recruiter which domain the team owns; prepare one deep project story.

## OpenAI

OpenAI coding rounds are like building a small real tool on a deadline: one practical problem arrives in parts — make it work, then add persistence, then make it thread-safe, then write tests. The first passing version is only the starting line.

**Interview style**
- Practical, progressive coding: one problem with several gated parts (course; many candidate reports).
- Most-reported prompt: versioned/time-based KV store with serialization, tests, mocking time and locking follow-ups (agg).
- Refactor-heavy: early design must absorb later requirements.
- AI-related system design; deep project discussion.

**Reported loop:** Recruiter screen → Technical screen (practical coding, 60–75 min) → Onsite: practical coding, system design, project deep-dive, behavioral

**Most-reported patterns:** Design + binary search, Serialization, Iterators / state, Concurrency discussion, Tokenization / AI-flavoured practicals

| Problem | Label | Source / note |
|---|---|---|
| p97-time-kv-store | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — LeakCode, 1Point3Acres, InterviewLegend: most-reported OpenAI prompt |
| p98-resumable-iterator | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — 1Point3Acres: resumable iterator + unit tests + KV store |
| p99-bpe-tokenizer | INFERRED | AI-flavoured practical |
| p100-inmem-db-levels | INFERRED | Same practical, multi-level style |
| p101-inmem-db-transactions | INFERRED | Practical refactor-heavy store |
| p103-retry-client-idempotency | INFERRED | Rate-limited API client practical |
| p56-sliding-log-limiter | INFERRED | Rate limiting |

| Design | Label | Source / note |
|---|---|---|
| sd3 | INFERRED | LLM inference serving |
| sd24 | INFERRED | Retrieval service for LLMs |

**Mock:** 75 min. One practical problem in 4 parts; write your own tests; discuss locks.

## Anthropic

Anthropic's screen is a "build it, then grow it" exercise: you build a small in-memory database, and every time your tests pass, a new level unlocks that adds requirements to the same code. It rewards code you can extend calmly, not memorised LeetCode tricks.

**Interview style**
- Recruiters describe the coding screen as practical, not LeetCode (agg).
- Most-reported screen: 90-min CodeSignal, one in-memory DB problem in 4 gated levels (SET/GET/DELETE → scans → timestamps/TTL → backup/restore) (agg: 12 reports; blog).
- Onsite blends algorithms with system design and edge cases; values/AI-safety conversation eliminates many strong candidates (course; blog).

**Reported loop:** Written application ("Why Anthropic?") → Recruiter screen → Coding assessment (practical, progressive) → Hiring-manager deep dive → Onsite: coding, system design, values/culture, project review

**Most-reported patterns:** Practical design (stores, parsers), Hash maps + sorted maps, Timestamps / TTL, Streaming parsing, Rate limiting

| Problem | Label | Source / note |
|---|---|---|
| p100-inmem-db-levels | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — AceOffer (12 reports), InterviewLegend, candidate blog |
| p101-inmem-db-transactions | INFERRED | Natural extension of the reported store |
| p102-log-stream-parser | INFERRED | Practical "parse real data" |
| p97-time-kv-store | INFERRED | Timestamped store variant |
| p103-retry-client-idempotency | INFERRED | Rate-limited API client |
| p99-bpe-tokenizer | INFERRED | AI-flavoured practical |
| p55-lfu-cache | INFERRED | Cache design |

| Design | Label | Source / note |
|---|---|---|
| sd24 | REPORTED | Candidate blog / Medium post — "distributed search system for 1B documents and 1M QPS" |
| sd1 | INFERRED | Rate limiter for an inference API |

**Mock:** 90 min. 90-min, 4-level practical: unlock levels by passing tests.

## Uber (similar company)

Uber problems usually hide a map: drivers, riders, routes. The trick is choosing what a "node" is — a stop, a bus, a hexagon tile — and then running a familiar graph or heap algorithm on it.

**Interview style**
- Medium/hard coding with graph modelling (LeetCode tags).
- Reported coding includes top-K frequent elements and string pattern checks (Glassdoor via search summary).
- Senior loops: dispatch/geo design and domain services.

**Reported loop:** Recruiter screen → Phone screen (coding) → Onsite: 2 coding, design, behavioral/manager

**Most-reported patterns:** Graphs / BFS, Heaps / top-k, Geo / k-closest, Rate limiting

| Problem | Label | Source / note |
|---|---|---|
| p104-bus-routes | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p23-top-k-frequent | REPORTED | Glassdoor interview reviews |
| p49-k-closest | INFERRED | Nearest drivers |
| p105-currency-conversion | INFERRED | Graph with weights |
| p73-word-ladder | INFERRED | BFS modelling |
| p103-retry-client-idempotency | INFERRED | Reliable API clients |

| Design | Label | Source / note |
|---|---|---|
| sd19 | REPORTED | Third-party prep guide summarising candidate reports — Ride matching / dispatch is a commonly reported Uber design prompt |

**Mock:** 60 min. Model the graph out loud before coding.

## Stripe (similar company)

Stripe tests you like a new engineer on day one: here is a real-ish codebase, a failing test, and API docs — fix it, extend it, and never double-charge anyone. Correctness of money beats speed.

**Interview style**
- Practical coding (rate limiters and data parsing in reports), Bug Squash (fix failing tests in an unfamiliar repo), Integration (build against provided API docs) (guide).
- Idempotency keys and safe retries recur in coding AND design (guide; Stripe docs).
- Payments-flavoured system design: idempotency, ledgers, webhooks.

**Reported loop:** Recruiter screen → Technical screen (practical) → Onsite ~5: coding, Bug Squash, Integration, system design, behavioral

**Most-reported patterns:** Practical simulation, Parsing, Rate limiting, Graphs (conversions), Idempotency

| Problem | Label | Source / note |
|---|---|---|
| p103-retry-client-idempotency | REPORTED | Third-party prep guide summarising candidate reports — Bug Squash: retry must reuse one idempotency key |
| p56-sliding-log-limiter | REPORTED | Third-party prep guide summarising candidate reports — rate limiters in coding prompts |
| p102-log-stream-parser | REPORTED | Third-party prep guide summarising candidate reports — data parsing prompts |
| p84-logger-rate-limiter | INFERRED | Time-window logic |
| p105-currency-conversion | INFERRED | Payments-flavoured graph |
| p101-inmem-db-transactions | INFERRED | Transactions |

| Design | Label | Source / note |
|---|---|---|
| sd20 | REPORTED | Third-party prep guide summarising candidate reports — idempotency / ledger / webhooks themes; Stripe docs on idempotent requests are POSTED/OFFICIAL |
| sd1 | REPORTED | Third-party prep guide summarising candidate reports — "Design a distributed rate limiter" — Stripe engineering blog describes its limiters (OFFICIAL) |

**Mock:** 60 min. Run the tests first, fix one failure at a time, explain each fix.

## Databricks (similar company)

Databricks questions feel like building tiny pieces of a data platform: a counter that answers "how many requests in the last 5 minutes", an iterator you can snapshot, a firewall rule matcher — each small, each with concurrency or scale follow-ups.

**Interview style**
- Two coding rounds + design + behavioral (agg summary of 377 reports).
- Reported coding: KV-store QPS / hit counters, CIDR firewall matching, snapshot iterators, concurrent log writers, run-length encoding (agg).
- Data-systems design (query engines, storage).

**Reported loop:** Recruiter screen → Technical screen → Onsite: 2 coding, 1–2 design, behavioral, hiring manager

**Most-reported patterns:** Bit manipulation / parsing, Iterators & snapshots, Counters over time, k-way merge, Concurrency

| Problem | Label | Source / note |
|---|---|---|
| p106-cidr-firewall | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — CIDR firewall matching |
| d04-hit-counter | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — KV-store QPS / hit counter |
| p74-snapshot-array | REPORTED | Interview-report aggregator (AceOffer, LeakCode, 1Point3Acres, InterviewLegend, PracHub) — snapshot-style data structures |
| p98-resumable-iterator | INFERRED | Iterator with state |
| p97-time-kv-store | INFERRED | Versioned store |
| p27-merge-k-lists | INFERRED | Merge step of a shuffle |
| p75-range-sum-fenwick | INFERRED | Range aggregates |

| Design | Label | Source / note |
|---|---|---|
| sd21 | INFERRED | Spark-style shuffle / query engine |
| sd15 | INFERRED | Metrics pipeline |

**Mock:** 60 min. Expect a thread-safety follow-up on every data structure.

## Qualcomm (similar company)

Qualcomm interviews sit close to the silicon: like asking a pilot to explain the instruments as well as fly. C, bits, caches, memory and embedded patterns matter more than exotic algorithms.

**Interview style**
- C/C++ fundamentals, bit manipulation, memory, OS and embedded topics (course: specialized systems roles; LeetCode tag lists are small).
- Team-specific: modem, multimedia, Android/BSP, AI accelerators.

**Reported loop:** Recruiter screen → 1–2 technical screens (C/C++, DSA) → Onsite / panel: technical deep dives, manager

**Most-reported patterns:** Bits, Caches, Parsing, Concurrency, Memory

| Problem | Label | Source / note |
|---|---|---|
| p107-cache-simulator | INFERRED | Cache hierarchy questions for hardware-adjacent teams |
| p85-reverse-bits-range | INFERRED | Bit manipulation |
| p88-byte-swap | INFERRED | Endianness |
| p92-can-signal-extract | INFERRED | Packed bit fields |
| p81-atoi | INFERRED | Robust C parsing |
| p59-spsc-queue | INFERRED | Lock-free queues |

| Design | Label | Source / note |
|---|---|---|
| sd4 | INFERRED | Device telemetry pipeline |
| sd9 | INFERRED | Fleet of devices |

**Mock:** 60 min. Code in C/C++; discuss UB and memory layout.

## AMD (similar company)

AMD interviews are like a performance tune-up: they care how the code runs on real hardware — caches, memory copies, bits — more than about rare algorithms. Public LeetCode tags are thin, so prepare by pattern.

**Interview style**
- Very few public LeetCode-tagged problems (only a handful) — patterns below are INFERRED from role descriptions and similar silicon companies.
- C/C++, performance, caches, GPU/driver topics depending on team.

**Reported loop:** Recruiter screen → Technical screen(s) → Onsite / panel with team engineers

**Most-reported patterns:** Caches & memory, Bits, Allocators, Concurrency

| Problem | Label | Source / note |
|---|---|---|
| p107-cache-simulator | INFERRED | Cache behaviour |
| p87-memmove-overlap | INFERRED | Memory copies |
| p88-byte-swap | INFERRED | Endianness |
| p85-reverse-bits-range | INFERRED | Bits |
| p19-counting-bits | INFERRED | Popcount |
| p62-buddy-allocator | INFERRED | Allocators for GPU memory |

| Design | Label | Source / note |
|---|---|---|
| sd6 | INFERRED | GPU cluster scheduler |
| sd3 | INFERRED | Inference serving |

**Mock:** 60 min. Explain performance: cache lines, alignment, copies.

## Airbnb (similar company)

Airbnb coding rounds are known for "real code" — like being asked to build a small booking feature end to end, with clean structure and tests, rather than a one-line trick.

**Interview style**
- Practical, production-quality coding; code should run (guide-level reports).
- Graph and string problems appear in tag lists.

**Reported loop:** Recruiter screen → Technical screen (practical) → Onsite: coding, design, cross-functional/values

**Most-reported patterns:** Graphs, Strings/parsing, Practical design

| Problem | Label | Source / note |
|---|---|---|
| p104-bus-routes | INFERRED | Graph modelling |
| p105-currency-conversion | INFERRED | Weighted graph |
| p33-alien-dictionary | REPORTED | LeetCode company-tag frequency lists (public aggregations, e.g. 2026 "most asked" compilations) |
| p76-decode-string | INFERRED | Parsing |
| p63-my-calendar | INFERRED | Booking intervals |
| p101-inmem-db-transactions | INFERRED | Practical store |

| Design | Label | Source / note |
|---|---|---|
| sd20 | INFERRED | Payments for bookings |
| sd14 | INFERRED | Notifications |

**Mock:** 60 min. Production-quality code with tests.

## Cloudflare (similar company)

Cloudflare sits in front of a big part of the internet, so its questions look like a bouncer's job: match IP rules, limit request rates, cache content at the edge.

**Interview style**
- Systems/networking-flavoured practical coding (INFERRED from public engineering blog topics).
- Go/Rust/C++ common on edge teams.

**Reported loop:** Recruiter screen → Technical screen → Onsite: coding, systems design, values

**Most-reported patterns:** IP / bit parsing, Rate limiting, Caching

| Problem | Label | Source / note |
|---|---|---|
| p106-cidr-firewall | INFERRED | IP rule matching |
| p56-sliding-log-limiter | INFERRED | Rate limiting |
| p84-logger-rate-limiter | INFERRED | Dedupe windows |
| p20-lru-cache | INFERRED | Edge caching |
| p86-hex-to-decimal | INFERRED | Parsing |
| p88-byte-swap | INFERRED | Network byte order |

| Design | Label | Source / note |
|---|---|---|
| sd18 | INFERRED | CDN |
| sd1 | INFERRED | Rate limiter |

**Mock:** 60 min. Talk about the network path end to end.

## Links consulted

- [Anthropic OA: 4-level in-memory DB (CodeSignal)](https://www.interviewlegend.com/guides/companies/anthropic/coding/online-assessment) (agg)
- [Anthropic in-memory DB — 12 reports](https://aceoffer.app/interviews/in_memory_database) (agg)
- [Anthropic interview experience (search system design)](https://medium.com/@anqi.silvia/my-2025-anthropic-software-engineer-interview-experience-9fc15cd81a99) (blog)
- [OpenAI time-based KV store reports](https://leakcode.dev/question/4841) (agg)
- [OpenAI resumable iterator + KV store](https://www.1point3acres.com/interview/problems/ec3912e2-0511-4700-b01b-5fad7ac3d781) (agg)
- [OpenAI applied build: data stores](https://interviewlegend.com/guides/companies/openai/coding/applied-build-data-stores) (guide)
- [NVIDIA interview (reverse bits l..r, min stack, palindrome list)](https://leetcode.com/discuss/post/4032849/nvidia-interview-or-off-campus-or-2023/) (lc-discuss)
- [NVIDIA FW interview (memcpy, hex→decimal, endianness)](https://www.geeksforgeeks.org/interview-experiences/nvidia-interview-experience-for-fw-developer/) (gfg)
- [NVIDIA system software (bit questions)](https://www.jointaro.com/interviews/companies/nvidia/experiences/system-software-engineer-santa-clara-ca-july-1-2022-accepted-offer-positive-80a4ae58/) (taro)
- [NVIDIA small-string C++ class](https://prachub.com/interview-questions/optimize-a-small-string-cplusplus-class) (agg)
- [Tesla coding by track](https://interviewlegend.com/guides/companies/tesla/coding/coding-overview) (guide)
- [Tesla Autopilot C++ & ML](https://interviewlegend.com/guides/companies/tesla/coding/autopilot-cpp-and-ml) (guide)
- [Tesla embedded experience](https://www.jointaro.com/interviews/companies/tesla/experiences/embedded-software-engineer-united-states-march-1-2024-declined-offer-positive-f2f45b8e/) (taro)
- [Stripe Bug Squash (idempotency retry)](https://www.bigtechexperts.com/companies/stripe/debugging-integration-questions/interview-question-1) (guide)
- [Stripe rate limits (docs)](https://docs.stripe.com/rate-limits) (official)
- [Stripe SWE interview process](https://www.interviewcoder.co/blog/stripe-software-engineer-interview) (guide)
- [Meta 2026 frequency list](https://www.compilenrun.com/interview/company/meta/) (lc-tag)
- [Most asked LeetCode 2026 (Google, Amazon)](https://www.dsaprep.dev/blog/most-asked-leetcode-problems-2026) (lc-tag)
- [Company-tagged question use (AMD has few tags)](https://copilotinterview.com/blog/leetcode-company-tagged-questions) (guide)
- [Databricks reports summary](https://aceoffer.app/interviews/databricks) (agg)
- [Netflix senior SWE interviews](https://www.glassdoor.com/Interview/Netflix-Senior-Software-Engineer-Interview-Questions-EI_IE11891.0,7_KO8,32.htm) (glassdoor)
- [Uber senior SWE interviews](https://www.glassdoor.com.hk/Interview/Uber-Senior-Software-Engineer-Interview-Questions-EI_IE575263.0,4_KO5,29.htm) (glassdoor)

Also read (not modified): cvpeceee/interview-mastery-courses company courses for Amazon, Anthropic, Apple, Google, Meta, Microsoft, NVIDIA and OpenAI.
