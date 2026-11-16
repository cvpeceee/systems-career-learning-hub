# Agentic AI Engineer: hands-on labs

Thirteen labs, one per area of the course. Each one is small enough for an evening and checked by tests.

| Lab | You build | Course lessons |
|---|---|---|
| 00-setup | Environment check and a first call to the fake model | 1–2 |
| 01-llm-basics | Softmax, temperature, top-p, sampling, a bigram "language model", token cost | 3–4 |
| 02-embeddings | Cosine similarity, top-k search, a vector index with metadata filters | 5 |
| 03-llm-api-structured | One adapter over OpenAI + Anthropic, structured output with a repair loop, streaming | 7–9 |
| 04-tool-calling | JSON Schema from type hints, argument validation, safe dispatch, parallel calls | 10 |
| 05-agent-from-scratch | The agent loop with limits, loop detection, tracing, history trimming and compaction | 11–13 |
| 06-rag-pipeline | Chunking, BM25, hybrid fusion (RRF), reranking, cited answers, recall@k / MRR | 14–16 |
| 07-mcp-server-client | A real MCP server and client using the official SDK (stdio and in-process) | 17–18 |
| 08-langgraph-hitl | A LangGraph agent that pauses for human approval and resumes from a checkpoint | 19–20, 22 |
| 09-multi-agent | Async orchestrator-worker with failure isolation and a shared token budget | 21 |
| 10-evals | Golden set, code graders, multi-trial pass rates, judge bias check, CI gate | 23–24 |
| 11-security-guardrails | Tool policy, taint tracking, approval, path sandbox, redaction, injection test | 26–27 |
| 12-production | Retries with backoff, rate limiter, circuit breaker, fallback, cache, tracer, cost | 25, 28–30 |

## Setup (once)

```bash
cd labs
python3 -m venv .venv            # Python 3.10+; 3.12 or 3.13 recommended
source .venv/bin/activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## How every lab works

```
NN-name/
  README.md     what to build and why
  starter/      the code you edit; every gap is marked "# TODO" and raises NotImplementedError
  solution/     a working reference (peek only after trying)
  tests/        the same tests check both folders
```

```bash
cd 05-agent-from-scratch
python -m pytest -q tests                        # tests YOUR starter code (fails until you fill the TODOs)
LAB_TARGET=solution python -m pytest -q tests    # tests the reference solution
# Windows PowerShell:  $env:LAB_TARGET="solution"; python -m pytest -q tests
```

`python run_all.py` runs every lab against both folders and writes `../TEST_RESULTS.txt`.
`python make_starters.py` regenerates `starter/` from `solution/`. It overwrites your starter work, so keep a copy first.

## No API key needed

`common/fakellm.py` stands in for the model. Tests *script* what the model says, much like testing firmware against a
simulated peripheral: you check your logic deterministically, with no cost and no flakiness.
Labs 07 and 08 run the real `mcp` and `langgraph` libraries. They need no key because the "model" parts are scripted.

## Using a real model

Lab 03's `solution/llm.py` holds `call_model(messages, tools, backend=...)` with real OpenAI (Responses API) and
Anthropic (Messages API) adapters. To run against a real model:

```bash
export OPENAI_API_KEY=...        # or ANTHROPIC_API_KEY=...
BACKEND=openai MODEL=<a current model id from the provider's models page> python 03-llm-api-structured/solution/demo.py
```

In any later lab you can swap the scripted model for a real one, for example in Lab 05:

```python
from llm import call_model                       # copy llm.py next to your code, or add Lab 03's solution/ to sys.path
llm = lambda messages, tools: call_model(messages, tools, backend="anthropic", model="<model id>")
run_agent(llm, "Which devices are outdated?", tools, specs=my_specs)   # specs: e.g. Lab 04 Registry.specs()
```

Model names change several times a year, so they are never hard-coded here. Look up current ids on the provider's
models page. Real models are not deterministic, so use them for demos and eval runs (Lab 10), not unit tests.

## Python notes for a C++ / Java engineer

- **No compile step and no declared types at run time.** Type hints (`def f(x: int) -> str`) are checked by tools
  (mypy, pyright, your editor) and read by libraries like Pydantic. Python itself does not enforce them.
- **`dict` and `list` are the everyday structs and vectors.** JSON maps straight onto them, which is why LLM APIs feel
  natural in Python.
- **`@dataclass`** generates the constructor, `__repr__` and `__eq__`, like a Java record or a C++ aggregate.
- **Decorators (`@something` above a def)** are functions that wrap or register functions, like registering a
  handler in an interrupt vector table.
- **`async def` / `await`** is cooperative multitasking on one thread. It works like an RTOS task that yields while
  blocked on I/O. Use it for many slow network calls at once (Lab 09).
- **`with` blocks** are RAII (resource acquisition is initialisation): setup on entry, guaranteed cleanup on exit.
- **Exceptions are normal control flow**, used more freely than in C++. The labs turn them into data the model can read.
- **pytest** finds functions named `test_*` and uses plain `assert`. There is no test-class boilerplate.
