# Lab 00: Setup and your first (fake) model call

Course lessons: 1–2. Tests: 3 test functions (some are parametrised) in `tests/`.

## Why this matters
Every later lab uses the same setup and the same fake model. This lab checks that the setup works.

## Words you'll meet
- **Virtual environment (venv)**: think of a private toolbox per project, so library versions for this course can't clash with other projects. Precisely: a folder with its own Python and installed packages; activate it before running anything.
- **Fake LLM**: think of a simulated peripheral on your test bench. Precisely: `common/fakellm.py`. It returns replies you script, in the same shape the real adapters return.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `hello.py` → `ask`: build messages=[{"role": "user", "content": question}], call llm(messages), return reply.text

## Run
```bash
cd labs/00-setup
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Nothing to change yet. Lab 03 adds the real provider adapters.

## Stretch
Read `common/fakellm.py` top to bottom (about 80 lines). Every later test depends on `Reply`, `ToolCall`, `say()` and `call()`.
