# Lab 12: Production plumbing

Course lessons: 25, 28–30. Tests: 10 test functions (some are parametrised) in `tests/`.

## Why this matters
Rate limits, outages and cost overruns are the daily reality of agents in production. These patterns come up in system design rounds.

## Words you'll meet
- **Exponential backoff with jitter**: think of retransmit with growing, randomised gaps so devices don't collide again. Precisely: wait random(0, base·2^n) before retry n; honour the server's Retry-After header.
- **Token bucket**: think of a tank that refills at a fixed rate; each request takes some. Precisely: smooths bursts to a sustained rate, like a traffic shaper.
- **Circuit breaker**: think of a fuse that trips, then is tested again after cooling. Precisely: after repeated failures stop calling for a while (open), try one call (half-open), then close on success.
- **Span / trace**: think of a timestamped entry and exit in a logic-analyser capture. Precisely: a timed unit of work with an id and a parent id; nested spans form a tree.
- **TTL (time to live)**: think of an expiry date on a cached value. Precisely: how long a cached response stays valid.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `prod.py` → `with_retries`: loop attempts; return fn() on success; PermanentError -> re-raise immediately; TransientError -> re-raise if last attempt, else clock.sleep(delay)
- `prod.py` → `try_take`: refill, then take cost if available (return True) else return False
- `prod.py` → `call`: if open and cooldown not elapsed -> raise CircuitOpen; if elapsed -> half_open. Run fn: on success reset to closed/0; on exception count failure, open if half_open or failures >= threshold (record opened_at), re-raise
- `prod.py` → `call_with_fallback`: loop, return on first success, remember the exception otherwise; finally raise RuntimeError("all providers failed") from last
- `prod.py` → `get_or_call`: hit if key present and not older than ttl (count hits); else call fn, store (value, time), count misses
- `prod.py` → `span`: append json.dumps({"id", "parent", "name", "start", "dur", "status", "attrs"}) to self.lines
- `prod.py` → `usd`: sum over models of in/1e6*price_in + out/1e6*price_out

## Run
```bash
cd labs/12-production
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Wrap `call_model` with `with_retries`, then `CircuitBreaker.call`, then `call_with_fallback` across two providers. Map SDK exceptions: `openai.RateLimitError` / `anthropic.RateLimitError` → TransientError (read `retry-after` from the response headers); auth and bad-request errors → PermanentError. Both SDKs also retry some errors by default (`max_retries`), so decide on one layer to avoid retrying retries.

## Stretch
Export Tracer spans as OpenTelemetry spans (opentelemetry-sdk) and view them in a local Jaeger or Phoenix.
