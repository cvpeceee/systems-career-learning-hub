"""CI release gate.  python gate.py ../data/results_baseline.json ../data/results_candidate_regressed.json
Exit code 0 = ship, 1 = blocked (so a CI pipeline step fails)."""
import json, pathlib, sys
from evals import gate, load_cases

def main(argv: list[str]) -> int:
    base, cand = (json.loads(pathlib.Path(p).read_text()) for p in argv[1:3])
    cases = load_cases(pathlib.Path(__file__).resolve().parent.parent / "data" / "golden.jsonl")
    ok, reasons = gate(base, cand, cases)
    print(f"{cand['system']}: {'PASS' if ok else 'BLOCKED'} (overall {base['overall']:.2f} -> {cand['overall']:.2f})")
    for r in reasons:
        print("  -", r)
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main(sys.argv))
