# Lab 09: An orchestrator with parallel workers

Course lessons: 21. Tests: 7 test functions (some are parametrised) in `tests/`.

## Why this matters
Multi-agent questions in interviews are really concurrency questions: fan-out, timeouts, partial failure, shared limits.

## Words you'll meet
- **Orchestrator–worker**: think of a scheduler dispatching jobs to worker tasks. Precisely: one coordinator splits the goal, specialists run subtasks, results are merged.
- **asyncio.gather(return_exceptions=True)**: think of collecting every completion, error codes included. Precisely: run coroutines concurrently; failures come back as values instead of cancelling the rest.
- **Shared budget**: think of one power budget for all subsystems. Precisely: a single token allowance every worker draws from, guarded by an asyncio.Lock.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `orchestrator.py` → `spend`: under the lock, raise BudgetExceeded(f"{who} needs {n}, only {left} left") if used + n > total; else add n to used
- `orchestrator.py` → `route`: prompt the llm with the agent names; strip/lower its text; return it if it is a valid agent, else default
- `orchestrator.py` → `one`: results = await asyncio.gather(*(one(st) for st in subtasks), return_exceptions=True); map each to Outcome(ok=False, error="<Type>: <msg>") for exceptions (TimeoutError -> "timeout") else Outcome(ok=True)

## Run
```bash
cd labs/09-multi-agent
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Make each worker a small agent: `async def logs_worker(inp, budget): reply = await asyncio.to_thread(call_model, msgs, ...); await budget.spend(reply.usage)`. Or use the async clients (`AsyncOpenAI`, `AsyncAnthropic`).

## Stretch
Add cancellation: when the budget runs out, cancel the workers that are still running and report them as cancelled.
