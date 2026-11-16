# Lab 05: The agent loop, no framework

Course lessons: 11–13. Tests: 11 test functions (some are parametrised) in `tests/`.

## Why this matters
Frameworks hide this loop. Interviewers ask you to write it, and you will debug it in every framework you use.

## Words you'll meet
- **Agent loop**: think of a firmware main loop: poll, handle the event, repeat until done. Precisely: call model → run requested tools → append results → call again, until it answers or a limit trips.
- **Step limit / token budget**: think of a watchdog timer. Precisely: hard caps that stop a runaway agent.
- **Loop detection**: think of spotting the same packet retransmitted over and over. Precisely: stop when the identical call (same tool, same arguments) repeats too often.
- **Trace**: think of a logic-analyser capture of the run. Precisely: a record of every model call and tool call, with timings, used for debugging and evals.
- **Compaction**: think of log rotation that keeps a digest. Precisely: replace old turns with a model-written summary so long tasks fit the context window.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `agent.py` → `run_tool`: unknown name -> (f"unknown tool '{name}'. Available: [...]", True); call fn(**args); exceptions -> (f"{Type}: {msg}", True); non-str results -> json.dumps
- `agent.py` → `run_agent`: (1) no tool calls -> return Result(reply.text, "done", ...). (2) token_budget exceeded -> stop "budget". (3) for each call: key=(name, sorted args json); if seen more than max_repeats times -> stop "loop"; else run_tool, append {"role":"tool","tool_call_id","content","is_error"} and a trace entry {"step","type":"tool","name","args","is_error"}
- `agent.py` → `trim_history`: groups = _groups(rest); pop groups from the front until count(head + note + flattened groups) <= max_tokens (keep at least the last group); note = {"role": "user", "content": f"[{n} earlier messages trimmed to fit the context window]"}
- `agent.py` → `compact`: old = flattened groups[:-keep_last]; summary message = {"role": "user", "content": "[Summary of earlier work] " + summarize(old)}; return head + [summary] + flattened last groups

## Run
```bash
cd labs/05-agent-from-scratch
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Use the snippet in `labs/README.md` with Lab 04's `Registry` for `tools` and `specs`. Always keep `max_steps` and `token_budget`.

## Stretch
Add a `plan_and_execute` variant: one model call writes a numbered plan, then the loop executes the steps and re-plans on failure.
