# P6 — Host I/O War-Story Kit

**Maps to:** Months 7–9 · OpenAI Host / robot compute interviews  
**Goal:** Practice Poly-style cross-layer debugging narratives.

## Contents
- `case_dma_stuck.md`
- `case_irq_storm.md`
- `case_dt_mismatch.md`
- `SCCR_template.md`
- `lock_bench.cpp` — optional tiny contention microbench

## Drill
1. Read a case (5 min)
2. Speak SCCR aloud (2 min) — record yourself
3. Rewrite tighter (1 page max)

```bash
c++ -O2 -pthread -o lock_bench lock_bench.cpp && ./lock_bench
```
