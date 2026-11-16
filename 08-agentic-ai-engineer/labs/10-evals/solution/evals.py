"""Lab 10: evaluation harness - the unit tests + CI gate of an LLM system.

Model outputs vary run to run, so one passing example proves little. We:
  1. keep a golden set (fixed inputs with checkable expectations),
  2. grade with CODE wherever possible (fast, free, deterministic),
  3. run several trials per case and report pass rates (pass@1 average and pass^k = passed ALL k trials),
  4. check an LLM judge for position bias by swapping answer order,
  5. gate releases: block if quality drops or any critical case is not perfect.
"""
from __future__ import annotations
import json, pathlib, random
from typing import Callable

def load_cases(path: pathlib.Path) -> list[dict]:
    return [json.loads(l) for l in path.read_text().splitlines() if l.strip()]

def grade(case: dict, out: dict) -> dict[str, bool]:
    """out = {"answer": str, "tools": [tool names called]}. Returns {check_name: passed}. Checks:
    must_include (each phrase, case-insensitive), must_not_include, tool (must be called),
    must_not_tool (must NOT be called), max_words."""
    e, ans, tools, res = case["expect"], out["answer"].lower(), out.get("tools", []), {}
    # TODO-START: add one entry per check present in e, e.g. res["include:2.1.4"] = "2.1.4" in ans; res["tool:search_kb"]; res["not_tool:x"]; res["max_words"]
    for p in e.get("must_include", []):
        res[f"include:{p}"] = p.lower() in ans
    for p in e.get("must_not_include", []):
        res[f"exclude:{p}"] = p.lower() not in ans
    if "tool" in e:
        res[f"tool:{e['tool']}"] = e["tool"] in tools
    if "must_not_tool" in e:
        res[f"not_tool:{e['must_not_tool']}"] = e["must_not_tool"] not in tools
    if "max_words" in e:
        res["max_words"] = len(out["answer"].split()) <= e["max_words"]
    # TODO-END
    return res

def run_eval(system: Callable[[str, random.Random], dict], cases: list[dict], trials: int = 3, seed: int = 0) -> dict:
    """Returns {"overall": mean pass rate, "pass_all": fraction of cases passing every trial,
    "by_case": {id: pass rate}, "failures": [(id, trial, failed_checks)]}."""
    rng = random.Random(seed)
    by_case, failures, all_ok = {}, [], 0
    for c in cases:
        passes = 0
        # TODO-START: run `trials` times; a trial passes if every check in grade() is True; record failed check names; by_case[id] = passes/trials; count cases where passes == trials
        for t in range(trials):
            g = grade(c, system(c["input"], rng))
            if all(g.values()):
                passes += 1
            else:
                failures.append((c["id"], t, [k for k, v in g.items() if not v]))
        by_case[c["id"]] = round(passes / trials, 2)
        all_ok += passes == trials
        # TODO-END
    return {"overall": round(sum(by_case.values()) / len(by_case), 2), "pass_all": round(all_ok / len(cases), 2),
            "by_case": by_case, "failures": failures}

def pairwise_judge(judge: Callable[[str, str, str], str], question: str, a: str, b: str) -> str:
    """judge(question, first, second) -> "first" | "second". Ask twice with the order swapped.
    Return "a" or "b" only if both orders agree; otherwise "inconsistent" (the judge is reacting to position)."""
    # TODO-START: r1 = judge(q, a, b); r2 = judge(q, b, a); a wins if r1 == "first" and r2 == "second"; b wins if r1 == "second" and r2 == "first"
    r1, r2 = judge(question, a, b), judge(question, b, a)
    if r1 == "first" and r2 == "second":
        return "a"
    if r1 == "second" and r2 == "first":
        return "b"
    return "inconsistent"
    # TODO-END

def gate(baseline: dict, candidate: dict, cases: list[dict], max_drop: float = 0.02) -> tuple[bool, list[str]]:
    """Release gate. Fails if overall drops by more than max_drop, or any case tagged "critical" is below 1.0,
    even when the overall score went UP (averages hide safety regressions)."""
    reasons = []
    # TODO-START: compare overall; check every critical case id in candidate["by_case"]; return (not reasons, reasons)
    if candidate["overall"] < baseline["overall"] - max_drop:
        reasons.append(f"overall dropped {baseline['overall']:.2f} -> {candidate['overall']:.2f}")
    for c in cases:
        if "critical" in c.get("tags", []) and candidate["by_case"].get(c["id"], 0.0) < 1.0:
            reasons.append(f"critical case {c['id']} at {candidate['by_case'].get(c['id'], 0.0):.2f} (must be 1.00)")
    return (not reasons, reasons)
    # TODO-END

# ---- a small system under test: a support bot with deliberate, seeded flakiness ----
def demo_system(flaky: float = 0.0):
    def system(q: str, rng: random.Random) -> dict:
        ql = q.lower()
        if "pizza" in ql:
            return {"answer": "I can only help with fleet and device support.", "tools": []}
        if "flash every" in ql:
            return {"answer": "This affects the whole fleet, so it needs human approval first.", "tools": []}
        if "e-4012" in ql:
            ok = rng.random() >= flaky
            return {"answer": "E-4012: the update image failed signature verification." if ok else "E-4012 is a download error.", "tools": ["search_kb"]}
        if "resume" in ql:
            return {"answer": "Dock firmware 2.1.4 fixes the resume handshake.", "tools": ["search_kb"]}
        return {"answer": "The dock restarts in a loop when underpowered; use the original 180 W adapter.", "tools": ["search_kb"]}
    return system
