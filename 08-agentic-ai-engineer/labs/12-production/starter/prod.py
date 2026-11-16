"""Lab 12: production plumbing around model calls.

Everything here takes an injectable clock, so tests run instantly and deterministically - the same trick as
mocking a hardware timer in firmware unit tests.
  with_retries    - exponential backoff + jitter, honours Retry-After, retries only transient errors
  TokenBucket     - client-side rate limiting (requests or tokens per second)
  CircuitBreaker  - stop calling a failing provider for a while (closed -> open -> half-open -> closed)
  call_with_fallback - try providers in order
  ResponseCache   - exact-match cache with TTL (time to live)
  Tracer          - nested spans written as JSON lines, the shape OpenTelemetry-style tools use
  CostTracker     - tokens and dollars per model
"""
from __future__ import annotations
import hashlib, json, random, time, uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Any, Callable

class FakeClock:
    def __init__(self, t: float = 0.0):
        self.t, self.sleeps = t, []
    def now(self) -> float:
        return self.t
    def sleep(self, s: float) -> None:
        self.sleeps.append(s); self.t += s

class TransientError(Exception):
    """429 rate limited, 500/502/503/529 overloaded, timeouts: worth retrying."""
    def __init__(self, msg: str = "", retry_after: float | None = None):
        super().__init__(msg); self.retry_after = retry_after

class PermanentError(Exception):
    """400 bad request, 401 auth, 404: retrying will not help."""

def with_retries(fn: Callable[[], Any], clock, max_attempts: int = 5, base: float = 0.5, cap: float = 20.0,
                 rng: random.Random | None = None) -> Any:
    """Delay before retry n (n=1,2,...) = Retry-After if the server sent one, else a random value in
    [0, min(cap, base * 2**(n-1))]  ("full jitter", so many clients don't retry in lock-step)."""
    rng = rng or random.Random()
    # TODO: loop attempts; return fn() on success; PermanentError -> re-raise immediately; TransientError -> re-raise if last attempt, else clock.sleep(delay)
    raise NotImplementedError('TODO: loop attempts; return fn() on success; PermanentError -> re-raise immediately; TransientError -> re-raise if last attempt, else clock.sleep(delay)')

class TokenBucket:
    """Holds up to `capacity` tokens, refilled at `rate` per second. A request takes `cost` tokens or waits."""
    def __init__(self, rate: float, capacity: float, clock):
        self.rate, self.capacity, self.clock = rate, capacity, clock
        self.tokens, self.last = capacity, clock.now()

    def _refill(self):
        now = self.clock.now()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now

    def try_take(self, cost: float = 1.0) -> bool:
        # TODO: refill, then take cost if available (return True) else return False
        raise NotImplementedError('TODO: refill, then take cost if available (return True) else return False')

    def take(self, cost: float = 1.0) -> float:
        """Block (via clock.sleep) until cost is available; return seconds waited."""
        waited = 0.0
        while not self.try_take(cost):
            need = (cost - self.tokens) / self.rate
            self.clock.sleep(need); waited += need
        return waited

class CircuitOpen(Exception):
    pass

class CircuitBreaker:
    """closed: calls pass; after `threshold` consecutive failures -> open: calls fail fast for `cooldown` s;
    then half-open: ONE trial call; success -> closed, failure -> open again."""
    def __init__(self, clock, threshold: int = 3, cooldown: float = 30.0):
        self.clock, self.threshold, self.cooldown = clock, threshold, cooldown
        self.state, self.failures, self.opened_at = "closed", 0, 0.0

    def call(self, fn: Callable[[], Any]) -> Any:
        # TODO: if open and cooldown not elapsed -> raise CircuitOpen; if elapsed -> half_open. Run fn: on success reset to closed/0; on exception count failure, open if half_open or failures >= threshold (record opened_at), re-raise
        raise NotImplementedError('TODO: if open and cooldown not elapsed -> raise CircuitOpen; if elapsed -> half_open. Run fn: on success reset to closed/0; on exception count failure, open if half_open or failures >= threshold (record opened_at), re-raise')

def call_with_fallback(providers: list[tuple[str, Callable[[], Any]]]) -> tuple[str, Any]:
    """Try each (name, fn) in order; return (name, result) of the first success. If all fail, raise the last error.
    Fallback answers can differ in quality: log which provider served each request."""
    last = None
    # TODO: loop, return on first success, remember the exception otherwise; finally raise RuntimeError("all providers failed") from last
    raise NotImplementedError('TODO: loop, return on first success, remember the exception otherwise; finally raise RuntimeError("all providers failed") from last')

class ResponseCache:
    """Exact-match cache keyed on (model, messages, params). Only safe for deterministic-enough requests
    (e.g. temperature 0 classification), never for anything personalised without the user id in the key."""
    def __init__(self, clock, ttl: float = 3600):
        self.clock, self.ttl, self.store, self.hits, self.misses = clock, ttl, {}, 0, 0

    @staticmethod
    def key(model: str, messages: list[dict], **params) -> str:
        blob = json.dumps({"m": model, "msgs": messages, "p": params}, sort_keys=True)
        return hashlib.sha256(blob.encode()).hexdigest()

    def get_or_call(self, k: str, fn: Callable[[], Any]) -> Any:
        # TODO: hit if key present and not older than ttl (count hits); else call fn, store (value, time), count misses
        raise NotImplementedError('TODO: hit if key present and not older than ttl (count hits); else call fn, store (value, time), count misses')

class Tracer:
    """Spans with ids and parent ids, one JSON object per line. A span = one timed unit of work
    (an agent run, an LLM call, a tool call). Nested spans form a tree you can read like a call stack."""
    def __init__(self, clock):
        self.clock, self.lines, self._stack = clock, [], []

    @contextmanager
    def span(self, name: str, **attrs):
        sid = uuid.uuid4().hex[:8]
        parent = self._stack[-1] if self._stack else None
        start = self.clock.now(); self._stack.append(sid); status = "ok"
        try:
            yield attrs        # caller may add attributes, e.g. attrs["tokens"] = 123
        except Exception as e:
            status = f"error: {type(e).__name__}"; raise
        finally:
            self._stack.pop()
            # TODO: append json.dumps({"id", "parent", "name", "start", "dur", "status", "attrs"}) to self.lines
            raise NotImplementedError('TODO: append json.dumps({"id", "parent", "name", "start", "dur", "status", "attrs"}) to self.lines')

    def tree(self) -> dict[str | None, list[str]]:
        """parent id -> [child span names], handy for asserting structure."""
        out: dict = {}
        for l in self.lines:
            s = json.loads(l); out.setdefault(s["parent"], []).append(s["name"])
        return out

@dataclass
class CostTracker:
    prices: dict[str, tuple[float, float]]           # model -> (usd per 1M input, usd per 1M output)
    totals: dict[str, list[int]] = field(default_factory=dict)

    def add(self, model: str, input_tokens: int, output_tokens: int) -> None:
        t = self.totals.setdefault(model, [0, 0]); t[0] += input_tokens; t[1] += output_tokens

    def usd(self) -> float:
        # TODO: sum over models of in/1e6*price_in + out/1e6*price_out
        raise NotImplementedError('TODO: sum over models of in/1e6*price_in + out/1e6*price_out')
