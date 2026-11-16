# Learning plan: Agentic AI Engineer in 12 weeks

**Pace:** about 8–10 hours a week alongside a full-time job (about 110 hours in total). Each week has *Learn* (lessons + videos), *Build* (lab), and *Prove* (a small, visible output).
If a week slips, keep the order. Each chapter assumes the earlier ones.

| Week | Learn | Build | Prove (done when…) | Hours |
|---|---|---|---|---|
| 1 | L(1) L(2) L(3) L(4) | Lab 00 setup, Lab 01 (sampling & tokens) | You can explain next-token prediction, temperature and the context window out loud in 2 minutes | 8 |
| 2 | L(5) L(6) L(7) | Lab 02 (embeddings), first real API call with your own key | A script that calls a real model, streams, and logs token usage | 8 |
| 3 | L(8) L(9) L(10) | Lab 03 (wrapper + structured output), Lab 04 (tool registry) | Your `call_model()` wrapper with fake + real backends and a repair loop | 9 |
| 4 | L(11) L(12) L(13) | Lab 05 (agent from scratch) | Agent loop written **from memory** in under 20 minutes | 10 |
| 5 | L(14) L(15) L(16) | Lab 06 (RAG pipeline + retrieval metrics) | A table: keyword vs vector vs hybrid recall@5 on the golden set | 10 |
| 6 | L(17) L(18) | Lab 07 (MCP server + client) | **Capstone 1 M1–M2**: MCP log server + hand-written triage agent | 10 |
| 7 | L(19) L(20) | Lab 08 (LangGraph HITL) | Capstone 1 M3–M4: RAG over known issues; LangGraph approval for reboot | 10 |
| 8 | L(21) L(22) L(23) L(24) | Lab 09 (multi-agent), Lab 10 (evals) | Capstone 1 M5: 40-case golden set + CI regression gate | 10 |
| 9 | L(25) L(26) L(27) | Lab 11 (security) | Capstone 1 M5 continued: traces + injection test cases pass | 9 |
| 10 | L(28) L(29) L(30) L(31) | Lab 12 (production) | Capstone 1 M6: README with eval table, cost per task, demo video. **Publish it.** | 10 |
| 11 | L(32) | Capstone 2 or 3 (core milestones) | Second public repo with evals | 10 |
| 12 | L(33) L(34) L(35) | Mock interviews ×2; résumé rewrite | Apply to the first 10 roles (tiered list from L(35)) | 8 |

## Daily rhythm that works with a full-time job
- **Weekdays (≈1 h):** one lesson + its video, or one lab exercise. Mark the lesson complete in the course.
- **Weekend (≈3–4 h):** finish the lab, then do the week's *Prove* item.
- **Every Sunday (15 min):** write 3 bullets in a learning log: what you built, what broke, what the evals showed. These become résumé bullets and interview stories.

## Months 4–6 (after the 12 weeks)
- Ship one agent **inside your current team** (for example test-log triage for Poly device CI). Production experience is the most-requested item in postings.
- Go deep on the framework your target companies use (LangGraph appears most often in the postings).
- Read primary sources: the MCP specification (2026-07-28), Anthropic's *Building effective agents*, the OWASP Top 10 for LLM Applications, and your provider's docs on structured outputs, tool use and prompt caching.
- Contribute a small fix or example to an open-source agent/MCP project.

## Spending
The labs pass offline with no API key. For real-model practice, set a monthly budget limit in your provider console before you start, use small, cheap models for experiments, keep `max_tokens` low, and run evals on the batch API when you can. Use the cost calculator in L(29) with your provider's current prices to estimate spend before running anything large.
