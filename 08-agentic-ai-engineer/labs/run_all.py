"""Run every lab's tests against solution/ (must pass) and starter/ (expected to fail until you do the TODOs).
Writes ../TEST_RESULTS.txt.  Usage: python run_all.py"""
import os, pathlib, re, subprocess, sys, datetime, platform
ROOT = pathlib.Path(__file__).parent
rows, ok = [], True
for lab in sorted(p for p in ROOT.glob("[0-9][0-9]-*") if (p / "tests").exists()):
    res = {}
    for target in ("solution", "starter"):
        env = dict(os.environ, LAB_TARGET=target, PYTHONDONTWRITEBYTECODE="1")
        r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", str(lab / "tests")],
                           capture_output=True, text=True, env=env, cwd=lab, timeout=600)
        tail = (r.stdout.strip().splitlines() or ["?"])[-1]
        p = int(m.group(1)) if (m := re.search(r"(\d+) passed", tail)) else 0
        f = int(m.group(1)) if (m := re.search(r"(\d+) failed", tail)) else 0
        e = int(m.group(1)) if (m := re.search(r"(\d+) error", tail)) else 0
        res[target] = (p, f, e, tail)
        if target == "solution" and (f or e or not p): ok = False; print(r.stdout[-3000:], r.stderr[-2000:])
    rows.append((lab.name, res))
    print(f"{lab.name:28s} solution: {res['solution'][3]:40s} | starter: {res['starter'][3]}")
import importlib.metadata as md
def v(p):
    try: return md.version(p)
    except Exception: return "n/a"
out = ["08-agentic-ai-engineer: lab test results",
       f"Run: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} (America/Chicago) on {platform.platform()}, Python {platform.python_version()}",
       f"Libraries: pytest {v('pytest')}, pydantic {v('pydantic')}, mcp {v('mcp')}, langgraph {v('langgraph')}",
       "No API keys were used: model calls are served by labs/common/fakellm.py. Labs 07 and 08 run the real mcp and langgraph libraries.",
       "Starter = the TODO version you fill in; failures there are expected until you implement it.", ""]
for name, res in rows:
    s, t = res["solution"], res["starter"]
    out.append(f"{name:28s} solution: {s[0]} passed, {s[1]} failed, {s[2]} errors   | starter: {t[0]} passed, {t[1]} failed, {t[2]} errors (expected)")
tot = sum(r["solution"][0] for _, r in rows)
out += ["", f"TOTAL solution tests passing: {tot}  ({'ALL GREEN' if ok else 'FAILURES PRESENT'})"]
(ROOT.parent / "TEST_RESULTS.txt").write_text("\n".join(out) + "\n")
print("\n".join(out[-2:])); sys.exit(0 if ok else 1)
