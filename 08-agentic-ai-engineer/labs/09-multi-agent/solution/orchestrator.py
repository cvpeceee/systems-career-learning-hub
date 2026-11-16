"""Lab 09: orchestrator-worker multi-agent system with asyncio.

Like a firmware scheduler dispatching independent jobs to worker tasks and collecting completions:
  route   - a supervisor picks which specialist handles a request
  fan out - independent subtasks run concurrently (asyncio.gather)
  isolate - one worker failing or timing out must not sink the whole run (return_exceptions=True)
  budget  - all workers share one token budget, so a chatty worker can't spend everyone's money
Python note: `async def` functions return coroutines; `await` yields control while waiting (like a cooperative
RTOS task blocking on I/O). asyncio runs them on ONE thread, so the shared budget needs no OS mutex, but we still
use asyncio.Lock to make the check-then-spend step atomic across awaits.
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import Awaitable, Callable

class BudgetExceeded(Exception):
    pass

class TokenBudget:
    def __init__(self, total: int):
        self.total, self.used, self._lock = total, 0, asyncio.Lock()

    async def spend(self, n: int, who: str = "?") -> None:
        # TODO-START: under the lock, raise BudgetExceeded(f"{who} needs {n}, only {left} left") if used + n > total; else add n to used
        async with self._lock:
            if self.used + n > self.total:
                raise BudgetExceeded(f"{who} needs {n}, only {self.total - self.used} left")
            self.used += n
        # TODO-END

@dataclass
class Subtask:
    name: str
    agent: str
    input: str

@dataclass
class Outcome:
    name: str
    ok: bool
    output: str
    error: str | None = None

Worker = Callable[[str, TokenBudget], Awaitable[str]]

def route(llm, request: str, agents: list[str], default: str = "general") -> str:
    """Supervisor: ask the model which agent should handle the request. Never trust the answer blindly:
    anything not in the list falls back to `default`."""
    # TODO-START: prompt the llm with the agent names; strip/lower its text; return it if it is a valid agent, else default
    reply = llm([{"role": "system", "content": "Reply with exactly one agent name from: " + ", ".join(agents)},
                 {"role": "user", "content": request}])
    choice = reply.text.strip().lower()
    return choice if choice in agents else default
    # TODO-END

async def run_subtasks(subtasks: list[Subtask], workers: dict[str, Worker], budget: TokenBudget,
                       timeout_s: float = 5.0) -> list[Outcome]:
    """Run all subtasks concurrently; return one Outcome per subtask, in the same order."""
    async def one(st: Subtask) -> str:
        if st.agent not in workers:
            raise KeyError(f"no worker named {st.agent!r}")
        return await asyncio.wait_for(workers[st.agent](st.input, budget), timeout_s)
    # TODO-START: results = await asyncio.gather(*(one(st) for st in subtasks), return_exceptions=True); map each to Outcome(ok=False, error="<Type>: <msg>") for exceptions (TimeoutError -> "timeout") else Outcome(ok=True)
    results = await asyncio.gather(*(one(st) for st in subtasks), return_exceptions=True)
    out = []
    for st, r in zip(subtasks, results):
        if isinstance(r, asyncio.TimeoutError):
            out.append(Outcome(st.name, False, "", "timeout"))
        elif isinstance(r, BaseException):
            out.append(Outcome(st.name, False, "", f"{type(r).__name__}: {r}"))
        else:
            out.append(Outcome(st.name, True, r))
    return out
    # TODO-END

def synthesize(goal: str, outcomes: list[Outcome]) -> str:
    """Combine worker outputs into one report, and say plainly what's missing. (In production a model writes this,
    given the outcomes; the honesty about gaps is the part you must enforce.)"""
    ok = [f"- {o.name}: {o.output}" for o in outcomes if o.ok]
    bad = [f"- {o.name}: FAILED ({o.error})" for o in outcomes if not o.ok]
    lines = [f"Report for: {goal}"] + ok
    if bad:
        lines += ["Incomplete - these parts failed:"] + bad
    return "\n".join(lines)

async def orchestrate(goal: str, planner: Callable[[str], list[Subtask]], workers: dict[str, Worker],
                      budget: TokenBudget, timeout_s: float = 5.0) -> str:
    subtasks = planner(goal)
    return synthesize(goal, await run_subtasks(subtasks, workers, budget, timeout_s))
