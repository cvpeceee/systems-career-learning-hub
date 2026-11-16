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
    # TODO-START: unknown name -> (f"unknown tool '{name}'. Available: [...]", True); call fn(**args); exceptions -> (f"{Type}: {msg}", True); non-str results -> json.dumps
    if name not in tools:
        return f"unknown tool '{name}'. Available: {sorted(tools)}", True
    try:
        out = tools[name](**args)
    except Exception as e:
        return f"{type(e).__name__}: {e}", True
    return (out if isinstance(out, str) else json.dumps(out)), False
    # TODO-END

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
        # TODO-START: (1) no tool calls -> return Result(reply.text, "done", ...). (2) token_budget exceeded -> stop "budget". (3) for each call: key=(name, sorted args json); if seen more than max_repeats times -> stop "loop"; else run_tool, append {"role":"tool","tool_call_id","content","is_error"} and a trace entry {"step","type":"tool","name","args","is_error"}
        if not reply.tool_calls:
            return Result(reply.text, "done", step, tokens, messages, trace)
        if token_budget is not None and tokens > token_budget:
            return Result(None, "budget", step, tokens, messages, trace)
        for c in reply.tool_calls:
            key = (c.name, json.dumps(c.args, sort_keys=True))
            seen[key] = seen.get(key, 0) + 1
            if seen[key] > max_repeats:
                return Result(None, "loop", step, tokens, messages, trace)
            content, is_err = run_tool(tools, c.name, c.args)
            messages.append({"role": "tool", "tool_call_id": c.id, "content": content, "is_error": is_err})
            trace.append({"step": step, "type": "tool", "name": c.name, "args": c.args, "is_error": is_err})
        # TODO-END
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
    # TODO-START: groups = _groups(rest); pop groups from the front until count(head + note + flattened groups) <= max_tokens (keep at least the last group); note = {"role": "user", "content": f"[{n} earlier messages trimmed to fit the context window]"}
    groups, dropped = _groups(rest), 0
    def build():
        note = [{"role": "user", "content": f"[{dropped} earlier messages trimmed to fit the context window]"}] if dropped else []
        return head + note + [m for g in groups for m in g]
    while len(groups) > 1 and count(build()) > max_tokens:
        dropped += len(groups.pop(0))
    return build()
    # TODO-END

def compact(messages: list[dict], summarize: Callable[[list[dict]], str], keep_last: int = 2) -> list[dict]:
    """Instead of deleting old turns, replace them with ONE summary message written by a model
    (summarize(old_messages) -> str). Keeps the system prompt, the goal, and the last `keep_last` groups verbatim.
    Like log rotation that keeps a digest of the rotated file instead of throwing it away."""
    head, groups = messages[:2], _groups(messages[2:])
    if len(groups) <= keep_last:
        return messages
    # TODO-START: old = flattened groups[:-keep_last]; summary message = {"role": "user", "content": "[Summary of earlier work] " + summarize(old)}; return head + [summary] + flattened last groups
    old = [m for g in groups[:-keep_last] for m in g]
    recent = [m for g in groups[-keep_last:] for m in g]
    return head + [{"role": "user", "content": "[Summary of earlier work] " + summarize(old)}] + recent
    # TODO-END
