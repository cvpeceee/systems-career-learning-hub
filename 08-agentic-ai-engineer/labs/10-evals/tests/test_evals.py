import json, pathlib, subprocess, sys
import pytest
from evals import load_cases, grade, run_eval, pairwise_judge, gate, demo_system

DATA = pathlib.Path(__file__).resolve().parents[1] / "data"
CASES = load_cases(DATA / "golden.jsonl")
BY_ID = {c["id"]: c for c in CASES}

def test_grade_checks():
    g = grade(BY_ID["fw-1"], {"answer": "Firmware 2.1.4 fixes it", "tools": ["search_kb"]})
    assert g == {"include:2.1.4": True, "tool:search_kb": True}
    g = grade(BY_ID["safe-1"], {"answer": "Done!", "tools": ["schedule_update"]})
    assert g == {"include:approval": False, "not_tool:schedule_update": False}
    assert grade(BY_ID["style-1"], {"answer": "word " * 31})["max_words"] is False

def test_perfect_system_scores_one():
    r = run_eval(demo_system(), CASES, trials=3)
    assert r["overall"] == 1.0 and r["pass_all"] == 1.0 and r["failures"] == []

def test_multiple_trials_expose_flakiness():
    r = run_eval(demo_system(flaky=0.5), CASES, trials=10, seed=1)
    assert 0.0 < r["by_case"]["fw-2"] < 1.0
    assert r["pass_all"] < 1.0
    assert any(cid == "fw-2" and "include:signature" in checks for cid, _, checks in r["failures"])

def test_pairwise_judge_detects_position_bias():
    always_first = lambda q, x, y: "first"
    assert pairwise_judge(always_first, "q", "good", "bad") == "inconsistent"
    prefers_cited = lambda q, x, y: "first" if "[S1]" in x else "second"
    assert pairwise_judge(prefers_cited, "q", "answer [S1]", "answer") == "a"
    assert pairwise_judge(prefers_cited, "q", "answer", "answer [S1]") == "b"

def load(name):
    return json.loads((DATA / name).read_text())

def test_gate_passes_ok_candidate():
    ok, reasons = gate(load("results_baseline.json"), load("results_candidate_ok.json"), CASES)
    assert ok and reasons == []

def test_gate_blocks_critical_regression_even_if_average_rises():
    base, cand = load("results_baseline.json"), load("results_candidate_regressed.json")
    assert cand["overall"] > base["overall"]
    ok, reasons = gate(base, cand, CASES)
    assert not ok and any("safe-1" in r for r in reasons)

def test_gate_blocks_overall_drop():
    base = load("results_baseline.json")
    cand = dict(base, overall=0.70)
    assert gate(base, cand, CASES)[0] is False

@pytest.mark.parametrize("cand,code", [("results_candidate_ok.json", 0), ("results_candidate_regressed.json", 1)])
def test_gate_cli_exit_codes(cand, code):
    import evals
    script = pathlib.Path(evals.__file__).with_name("gate.py")
    r = subprocess.run([sys.executable, str(script), str(DATA / "results_baseline.json"), str(DATA / cand)],
                       capture_output=True, text=True, cwd=script.parent)
    assert r.returncode == code, r.stdout + r.stderr
