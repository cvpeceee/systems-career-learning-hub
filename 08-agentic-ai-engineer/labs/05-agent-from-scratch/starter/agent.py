"""Lab 05: the agent loop, with no framework.

An agent is a while-loop around a model call - like a firmware main loop polling for events:
  ask model -> if it requested tools, run them and append results -> ask again -> ... until it answers.
The engineering is in the guard rails: step limits, token budgets, loop detection, errors-as-results, tracing.
"""
from __future__ import annotations
import json, time
from dataclasses import dataclass, field
from typing import Callable
from fakellm import approx_tokens

@dataclass
class Result:
    answer: str | None
    stop: str                      # "done" | "max_steps" | "budget" | "loop"
    steps: int
    tokens: int
    messages: list[dict]
    trace: list[dict] = field(default_factory=list)

def run_tool(tools: dict[str, Callable], name: str, args: dict) -> tuple[str, bool]:
    """Returns (content, is_error). Unknown tools and exceptions become error text for the model, never crashes."""
    # TODO: unknown name -> (f"unknown tool '{name}'. Available: [...]", True); call fn(**args); exceptions -> (f"{Type}: {msg}", True); non-str results -> json.dumps
    raise NotImplementedError('TODO: unknown name -> (f"unknown tool \'{name}\'. Available: [...]", True); call fn(**args); exceptions -> (f"{Type}: {msg}", True); non-str results -> json.dumps')

def run_agent(llm, goal: str, tools: dict[str, Callable], specs: list[dict] | None = None,
              system: str = "You are a careful assistant. Use tools when you need facts.",
              max_steps: int = 8, token_budget: int | None = None, max_repeats: int = 2) -> Result:
    messages = [{"role": "system", "content": system}, {"role": "user", "content": goal}]
    trace, tokens, seen = [], 0, {}
    for step in range(1, max_steps + 1):
        t0 = time.perf_counter()
        reply = llm(messages, specs or [])
        tokens += reply.usage
        trace.append({"step": step, "type": "llm", "tokens": reply.usage, "tool_calls": len(reply.tool_calls),
                      "ms": round((time.perf_counter() - t0) * 1000, 2)})
        messages.append(reply.as_message())
        # TODO: (1) no tool calls -> return Result(reply.text, "done", ...). (2) token_budget exceeded -> stop "budget". (3) for each call: key=(name, sorted args json); if seen more than max_repeats times -> stop "loop"; else run_tool, append {"role":"tool","tool_call_id","content","is_error"} and a trace entry {"step","type":"tool","name","args","is_error"}
        raise NotImplementedError('TODO: (1) no tool calls -> return Result(reply.text, "done", ...). (2) token_budget exceeded -> stop "budget". (3) for each call: key=(name, sorted args json); if seen more than max_repeats times -> stop "loop"; else run_tool, append {"role":"tool","tool_call_id","content","is_error"} and a trace entry {"step","type":"tool","name","args","is_error"}')
    return Result(None, "max_steps", max_steps, tokens, messages, trace)

def _groups(messages: list[dict]) -> list[list[dict]]:
    """Split history into units that must stay together: an assistant message with tool_calls plus all its tool results."""
    groups, cur = [], None
    for m in messages:
        if m["role"] == "tool" and cur is not None:
            cur.append(m)
        else:
            cur = [m]; groups.append(cur)
    return groups

def trim_history(messages: list[dict], max_tokens: int, count: Callable[[list], int] = approx_tokens) -> list[dict]:
    """Drop the OLDEST middle turns until the history fits, keeping the system prompt and the original goal.
    Never split a tool call from its result: providers reject a tool result whose call is missing (and vice versa).
    Inserts a note saying how many messages were removed, so the model knows context is missing."""
    if count(messages) <= max_tokens:
        return messages
    head, rest = messages[:2], messages[2:]
    # TODO: groups = _groups(rest); pop groups from the front until count(head + note + flattened groups) <= max_tokens (keep at least the last group); note = {"role": "user", "content": f"[{n} earlier messages trimmed to fit the context window]"}
    raise NotImplementedError('TODO: groups = _groups(rest); pop groups from the front until count(head + note + flattened groups) <= max_tokens (keep at least the last group); note = {"role": "user", "content": f"[{n} earlier messages trimmed to fit the context window]"}')

def compact(messages: list[dict], summarize: Callable[[list[dict]], str], keep_last: int = 2) -> list[dict]:
    """Instead of deleting old turns, replace them with ONE summary message written by a model
    (summarize(old_messages) -> str). Keeps the system prompt, the goal, and the last `keep_last` groups verbatim.
    Like log rotation that keeps a digest of the rotated file instead of throwing it away."""
    head, groups = messages[:2], _groups(messages[2:])
    if len(groups) <= keep_last:
        return messages
    # TODO: old = flattened groups[:-keep_last]; summary message = {"role": "user", "content": "[Summary of earlier work] " + summarize(old)}; return head + [summary] + flattened last groups
    raise NotImplementedError('TODO: old = flattened groups[:-keep_last]; summary message = {"role": "user", "content": "[Summary of earlier work] " + summarize(old)}; return head + [summary] + flattened last groups')
