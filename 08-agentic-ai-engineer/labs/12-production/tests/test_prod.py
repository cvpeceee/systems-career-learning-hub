import json, random
import pytest
from prod import (FakeClock, TransientError, PermanentError, with_retries, TokenBucket, CircuitBreaker, CircuitOpen,
                  call_with_fallback, ResponseCache, Tracer, CostTracker)

def flaky(fails, exc=None):
    state = {"n": 0}
    def fn():
        state["n"] += 1
        if state["n"] <= fails:
            raise exc or TransientError("503")
        return "ok"
    return fn, state

def test_retries_then_succeeds_with_bounded_backoff():
    clock = FakeClock(); fn, st = flaky(3)
    assert with_retries(fn, clock, rng=random.Random(0)) == "ok" and st["n"] == 4
    assert len(clock.sleeps) == 3
    for n, s in enumerate(clock.sleeps, start=1):
        assert 0 <= s <= 0.5 * 2 ** (n - 1)

def test_honours_retry_after():
    clock = FakeClock(); fn, _ = flaky(1, TransientError("429", retry_after=7))
    with_retries(fn, clock)
    assert clock.sleeps == [7]

def test_permanent_errors_are_not_retried():
    clock = FakeClock(); fn, st = flaky(5, PermanentError("401"))
    with pytest.raises(PermanentError):
        with_retries(fn, clock)
    assert st["n"] == 1 and clock.sleeps == []

def test_gives_up_after_max_attempts():
    clock = FakeClock(); fn, st = flaky(99)
    with pytest.raises(TransientError):
        with_retries(fn, clock, max_attempts=4)
    assert st["n"] == 4 and len(clock.sleeps) == 3

def test_token_bucket():
    clock = FakeClock(); b = TokenBucket(rate=2, capacity=4, clock=clock)
    assert all(b.try_take() for _ in range(4)) and not b.try_take()
    clock.t += 1.0
    assert b.try_take() and b.try_take() and not b.try_take()
    assert b.take(1) == pytest.approx(0.5)
    clock.t += 100
    b._refill(); assert b.tokens == 4   # never exceeds capacity

def test_circuit_breaker_full_cycle():
    clock = FakeClock(); cb = CircuitBreaker(clock, threshold=2, cooldown=10)
    bad = lambda: (_ for _ in ()).throw(TransientError("down"))
    for _ in range(2):
        with pytest.raises(TransientError): cb.call(bad)
    assert cb.state == "open"
    with pytest.raises(CircuitOpen): cb.call(lambda: "never runs")
    clock.t += 10
    with pytest.raises(TransientError): cb.call(bad)      # half-open trial fails -> open again
    assert cb.state == "open"
    clock.t += 10
    assert cb.call(lambda: "ok") == "ok" and cb.state == "closed" and cb.failures == 0

def test_fallback():
    def down(): raise TransientError("primary down")
    assert call_with_fallback([("primary", down), ("backup", lambda: "B")]) == ("backup", "B")
    with pytest.raises(RuntimeError) as ei:
        call_with_fallback([("a", down), ("b", down)])
    assert isinstance(ei.value.__cause__, TransientError)

def test_cache_hits_and_ttl():
    clock = FakeClock(); c = ResponseCache(clock, ttl=60); calls = []
    k = ResponseCache.key("m", [{"role": "user", "content": "classify: dock"}], temperature=0)
    assert k == ResponseCache.key("m", [{"role": "user", "content": "classify: dock"}], temperature=0)
    assert k != ResponseCache.key("m", [{"role": "user", "content": "classify: dock"}], temperature=1)
    f = lambda: calls.append(1) or "hardware"
    c.get_or_call(k, f); c.get_or_call(k, f)
    assert (c.hits, c.misses, len(calls)) == (1, 1, 1)
    clock.t += 61; c.get_or_call(k, f)
    assert len(calls) == 2

def test_tracer_builds_a_span_tree():
    clock = FakeClock(); tr = Tracer(clock)
    with tr.span("agent_run", user="u1"):
        with tr.span("llm_call") as a:
            clock.t += 1.5; a["tokens"] = 900
        with pytest.raises(ValueError):
            with tr.span("tool:get_fw"):
                raise ValueError("bad device")
    spans = [json.loads(l) for l in tr.lines]
    by = {s["name"]: s for s in spans}
    assert by["llm_call"]["parent"] == by["agent_run"]["id"] and by["agent_run"]["parent"] is None
    assert by["llm_call"]["dur"] == 1.5 and by["llm_call"]["attrs"]["tokens"] == 900
    assert by["tool:get_fw"]["status"] == "error: ValueError"
    assert tr.tree()[by["agent_run"]["id"]] == ["llm_call", "tool:get_fw"]

def test_cost_tracker():
    ct = CostTracker({"big": (3.0, 15.0), "small": (0.25, 1.25)})
    ct.add("big", 1_000_000, 100_000); ct.add("small", 2_000_000, 0); ct.add("big", 0, 100_000)
    assert ct.usd() == pytest.approx(3.0 + 3.0 + 0.5)
