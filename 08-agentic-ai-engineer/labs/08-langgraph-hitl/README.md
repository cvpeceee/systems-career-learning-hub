# Lab 08: LangGraph with human approval and resume

Course lessons: 19–20, 22. Tests: 9 test functions (some are parametrised) in `tests/`.

## Why this matters
Real agents act on real systems. Pausing for a human, surviving restarts and resuming exactly where you stopped is what makes them deployable.

## Words you'll meet
- **Graph / node / edge**: think of a state machine diagram. Precisely: nodes are functions that update a shared state; edges (some conditional) choose the next node.
- **Checkpointer**: think of a journal in flash that survives a reset. Precisely: saves state after each step under a thread_id; InMemorySaver for tests, a database-backed saver in production.
- **interrupt() / Command(resume=...)**: think of a task blocking on a semaphore until an operator presses OK. Precisely: pause inside a node and hand a payload to a human; resume later with their answer.
- **Re-run on resume**: think of an ISR that restarts from its first line. Precisely: the interrupted node runs again from the top, so side effects before interrupt() must be idempotent.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `rollout.py` → `plan_node`: return {"plan": fake_planner(s["request"])}
- `rollout.py` → `route_after_plan`: return "approve" if more than one device in the plan, else "execute"
- `rollout.py` → `approve_node`: decision = interrupt({"question": "Approve rollout?", "plan": s["plan"]}); expect {"action": "approve"|"edit"|"reject", "plan"?, "note"?}; return approved flag, (edited) plan and reviewer_note
- `rollout.py` → `execute_node`: if approved is False -> result "rejected: <note>; nothing flashed"; else append {"device", "version"} to FLASHED for each device and return result "flashed N device(s) to <version>"

## Run
```bash
cd labs/08-langgraph-hitl
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Replace `fake_planner` with a structured-output call (Lab 03 `get_structured`) that returns `{version, devices}`. For durability across processes, use a persistent checkpointer such as `langgraph-checkpoint-postgres`.

## Stretch
Add a timeout path: if no human answers within N hours, a scheduled job resumes with `{"action": "reject", "note": "timed out"}`.
