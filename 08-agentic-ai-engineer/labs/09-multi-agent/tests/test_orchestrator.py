import asyncio, time
import pytest
from fakellm import ScriptedLLM, say
from orchestrator import TokenBudget, BudgetExceeded, Subtask, route, run_subtasks, orchestrate

def make_worker(output, delay=0.2, tokens=100, fail=None):
    async def w(inp, budget):
        await budget.spend(tokens, who=output)
        await asyncio.sleep(delay)
        if fail:
            raise fail
        return f"{output}({inp})"
    return w

def test_route_valid_and_fallback():
    agents = ["logs", "firmware", "general"]
    assert route(ScriptedLLM([say(" Firmware\n")]), "why did D1 reboot", agents) == "firmware"
    assert route(ScriptedLLM([say("I think the logs agent")]), "x", agents) == "general"

def test_budget_blocks_overspend():
    async def go():
        b = TokenBudget(250)
        await b.spend(100); await b.spend(100)
        with pytest.raises(BudgetExceeded):
            await b.spend(100, who="w3")
        return b.used
    assert asyncio.run(go()) == 200

def test_workers_run_in_parallel_and_keep_order():
    workers = {"a": make_worker("A"), "b": make_worker("B"), "c": make_worker("C")}
    subs = [Subtask("s1", "a", "x"), Subtask("s2", "b", "y"), Subtask("s3", "c", "z")]
    t0 = time.perf_counter()
    out = asyncio.run(run_subtasks(subs, workers, TokenBudget(10_000)))
    dt = time.perf_counter() - t0
    assert [o.output for o in out] == ["A(x)", "B(y)", "C(z)"] and all(o.ok for o in out)
    assert dt < 0.5, f"{dt:.2f}s: workers ran sequentially"

def test_one_failure_does_not_sink_the_rest():
    workers = {"ok": make_worker("OK"), "bad": make_worker("BAD", fail=RuntimeError("log store down"))}
    out = asyncio.run(run_subtasks([Subtask("a", "ok", "1"), Subtask("b", "bad", "2"), Subtask("c", "nobody", "3")],
                                   workers, TokenBudget(10_000)))
    assert out[0].ok and not out[1].ok and out[1].error == "RuntimeError: log store down"
    assert not out[2].ok and out[2].error.startswith("KeyError")

def test_timeout_is_reported():
    out = asyncio.run(run_subtasks([Subtask("slow", "s", "")], {"s": make_worker("S", delay=1.0)}, TokenBudget(1000), timeout_s=0.1))
    assert out[0].error == "timeout"

def test_shared_budget_across_workers():
    workers = {"w": make_worker("W", tokens=400)}
    subs = [Subtask(f"s{i}", "w", str(i)) for i in range(3)]
    out = asyncio.run(run_subtasks(subs, workers, TokenBudget(1000)))
    assert sum(o.ok for o in out) == 2
    assert sum(1 for o in out if o.error and "BudgetExceeded" in o.error) == 1

def test_orchestrate_reports_gaps_honestly():
    planner = lambda goal: [Subtask("logs", "logs", goal), Subtask("fw", "fw", goal)]
    workers = {"logs": make_worker("watchdog at 23:12", delay=0.01), "fw": make_worker("x", delay=0.01, fail=TimeoutError())}
    report = asyncio.run(orchestrate("why did D1 reboot", planner, workers, TokenBudget(1000)))
    assert "watchdog at 23:12" in report and "Incomplete" in report and "fw: FAILED" in report
