"""A fake LLM so every lab runs offline with no API key.

It returns the same shape our real adapters return (see labs/03-llm-api-structured/solution/llm.py):
a Reply with text, tool_calls, token usage and a stop_reason. Tests script exactly what the "model" says,
so agent logic can be tested deterministically, the way you'd test firmware against a simulated peripheral.
"""
from __future__ import annotations
import itertools, json
from dataclasses import dataclass, field
from typing import Callable

_ids = itertools.count(1)

@dataclass
class ToolCall:
    name: str
    args: dict
    id: str = field(default_factory=lambda: f"call_{next(_ids)}")

@dataclass
class Reply:
    text: str = ""
    tool_calls: list[ToolCall] = field(default_factory=list)
    usage: int = 0                 # total tokens billed for this call (input + output), approximate
    stop_reason: str = "end_turn"  # "end_turn" | "tool_use" | "max_tokens"

    def as_message(self) -> dict:
        """The assistant message to append to history (provider-neutral shape used in these labs)."""
        m = {"role": "assistant", "content": self.text}
        if self.tool_calls:
            m["tool_calls"] = [{"id": c.id, "name": c.name, "args": c.args} for c in self.tool_calls]
        return m

def approx_tokens(messages: list[dict]) -> int:
    """~4 characters per token: a common rule of thumb for English with GPT-style tokenizers."""
    return max(1, sum(len(json.dumps(m)) for m in messages) // 4)

class ScriptedLLM:
    """Replays a script. Each item is a Reply, or a function(messages, tools) -> Reply for reactive behaviour."""
    def __init__(self, script: list[Reply | Callable[[list, list], Reply]], repeat_last: bool = False):
        self.script, self.i, self.calls, self.repeat_last = list(script), 0, [], repeat_last

    def __call__(self, messages: list[dict], tools: list | None = None, **kw) -> Reply:
        self.calls.append({"messages": [dict(m) for m in messages], "tools": tools, **kw})
        if self.i >= len(self.script):
            if self.repeat_last and self.script:
                item = self.script[-1]
            else:
                raise RuntimeError("ScriptedLLM: script exhausted (the agent called the model more times than expected)")
        else:
            item = self.script[self.i]; self.i += 1
        r = item(messages, tools) if callable(item) else item
        if not r.usage:
            r.usage = approx_tokens(messages) + max(1, len(r.text) // 4)
        if r.tool_calls and r.stop_reason == "end_turn":
            r.stop_reason = "tool_use"
        return r

def say(text: str) -> Reply:
    return Reply(text=text)

def call(name: str, **args) -> Reply:
    return Reply(tool_calls=[ToolCall(name, args)])
