# Agentic AI Engineer: from zero to job-ready

For an experienced C/C++/Java engineer (Linux, Android, embedded firmware) who has not worked with AI before.
By the end you can build, test, secure and run LLM agents, and walk into agentic engineer interviews with
working code, measured results and a clear story.

**Open `index.html` in Chrome or Edge** (desktop or phone). Keep the whole folder together, because the page loads
`videos/` and links to `labs/`.

## What's inside

| Part | Count | Where |
|---|---|---|
| Interactive lessons (animations, widgets, quizzes with explained answers, tap-to-define words) | 35 lessons in 13 chapters | `index.html` |
| Glossary: each term has an everyday picture first, then the precise meaning | 161 terms | Glossary tab |
| Narrated videos: story hook, spoken definitions with NEW WORD cards, pause-and-think question, recap | 12 videos, about 69 min | `videos/` |
| Hands-on labs: starter with TODOs, reference solution and tests; runs offline with a fake model | 13 labs, 113 tests passing on the solutions | `labs/`, `TEST_RESULTS.txt` |
| 12-week plan at 8–10 h/week | | `LEARNING_PLAN.md` |
| Skills map built from 12 real job postings, linked to lessons and labs | | `SKILLS_MAP.md` |

## Chapters

0. Start here: the role, and Python for a C++/Java engineer
1. How LLMs work: tokens, sampling, embeddings, hallucination
2. Using LLM APIs well: messages, structured output, prompting
3. Tools and agents: tool calling, the agent loop from scratch, patterns, memory
4. RAG end to end: chunking, hybrid search, reranking, retrieval evals
5. Model Context Protocol: concepts, and a server and client with the official SDK
6. Frameworks: an honest comparison, then LangGraph hands-on
7. Multi-agent and long-running: orchestrator-worker, human approval, durable execution
8. Evals and observability: golden sets, LLM-as-judge pitfalls, tracing
9. Safety and security: prompt injection, permissions, sandboxing, PII
10. Production: reliability, cost and latency, deployment
11. Fine-tuning and local models
12. Capstones and interviews: three portfolio projects, system design, coding drills, your story

## Labs quick start

```bash
cd labs
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd 05-agent-from-scratch && python -m pytest -q tests      # your starter (fails until you fill the TODOs)
LAB_TARGET=solution python -m pytest -q tests              # the reference
```
See `labs/README.md` for how to switch to a real model (OpenAI or Anthropic).

## Rebuilding (maintainers)

`source/` holds the generators: `build.py` writes `index.html` from `lessons_*.py`, `glossary.py`, `template.html`
and `widgets.js`; `video/render.py` renders the videos (Piper TTS + ffmpeg); `video/check_sync.py` checks captions
against the audio; `qa.js` runs headless Chrome checks at 1366 px and 390 px; `audit.py` lists unexplained acronyms.
