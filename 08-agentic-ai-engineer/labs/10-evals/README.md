# Lab 10: Evals and a release gate

Course lessons: 23–24. Tests: 8 test functions (some are parametrised) in `tests/`.

## Why this matters
Without evals, every prompt change is a guess. Postings ask for 'evaluation frameworks' because teams that ship agents run them in CI.

## Words you'll meet
- **Golden set**: think of a regression test suite of known inputs. Precisely: fixed cases with checkable expectations, grown from real failures.
- **Code grader**: think of an automated pass/fail check on the bench. Precisely: deterministic checks: contains X, called tool Y, did NOT call tool Z, under N words.
- **pass^k**: think of a part that must pass every one of k burn-in cycles. Precisely: the fraction of cases that passed ALL k trials; stricter than the average pass rate.
- **Position bias**: think of a judge who prefers whichever sample is shown first. Precisely: LLM judges often favour one position; swap the order and only trust consistent verdicts.
- **Release gate**: think of a CI step that blocks the merge. Precisely: fail if overall quality drops or any critical case is below 100%.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `evals.py` → `grade`: add one entry per check present in e, e.g. res["include:2.1.4"] = "2.1.4" in ans; res["tool:search_kb"]; res["not_tool:x"]; res["max_words"]
- `evals.py` → `run_eval`: run `trials` times; a trial passes if every check in grade() is True; record failed check names; by_case[id] = passes/trials; count cases where passes == trials
- `evals.py` → `pairwise_judge`: r1 = judge(q, a, b); r2 = judge(q, b, a); a wins if r1 == "first" and r2 == "second"; b wins if r1 == "second" and r2 == "first"
- `evals.py` → `gate`: compare overall; check every critical case id in candidate["by_case"]; return (not reasons, reasons)

## Run
```bash
cd labs/10-evals
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Wrap your real agent as `system(q, rng) -> {"answer", "tools"}` and run `run_eval(system, cases, trials=5)`. For an LLM judge, prompt a strong model with a rubric and require a one-word verdict. Keep the position swap.

## Stretch
Save each run's results JSON with the git commit hash, and plot the overall score per commit.
