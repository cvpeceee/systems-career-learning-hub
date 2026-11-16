"""Lab 03: one small adapter over two real provider APIs, plus structured output and streaming.

Think of this file as a HAL (hardware abstraction layer): the rest of your agent code talks to `call_model`
and a provider-neutral message format; only this file knows the wire format of OpenAI or Anthropic.

Provider-neutral messages used throughout these labs:
  {"role": "system"|"user", "content": str}
  {"role": "assistant", "content": str, "tool_calls": [{"id", "name", "args": dict}]}   # tool_calls optional
  {"role": "tool", "tool_call_id": str, "content": str}
"""
from __future__ import annotations
import json, os, re
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from fakellm import Reply, ToolCall

# ---------- OpenAI Responses API ----------
def to_openai(messages: list[dict]) -> tuple[str | None, list[dict]]:
    """Return (instructions, input_items) for client.responses.create(instructions=..., input=...)."""
    instructions, items = None, []
    for m in messages:
        role = m["role"]
        if role == "system":
            instructions = m["content"]
        elif role == "user":
            items.append({"role": "user", "content": m["content"]})
        elif role == "assistant":
            if m.get("content"):
                items.append({"role": "assistant", "content": m["content"]})
            # TODO-START: for each tool call append {"type": "function_call", "call_id": id, "name": name, "arguments": json.dumps(args)}
            for c in m.get("tool_calls", []):
                items.append({"type": "function_call", "call_id": c["id"], "name": c["name"], "arguments": json.dumps(c["args"])})
            # TODO-END
        elif role == "tool":
            # TODO-START: append {"type": "function_call_output", "call_id": ..., "output": content}
            items.append({"type": "function_call_output", "call_id": m["tool_call_id"], "output": m["content"]})
            # TODO-END
    return instructions, items

def openai_tools(tools: list[dict]) -> list[dict]:
    """Our tool spec {name, description, parameters(JSON Schema)} -> Responses API function tools."""
    return [{"type": "function", "name": t["name"], "description": t["description"], "parameters": t["parameters"]} for t in tools]

def from_openai(resp) -> Reply:
    """Response object (or anything shaped like it) -> Reply."""
    text, calls = [], []
    for item in resp.output:
        # TODO-START: "message" items hold content parts of type "output_text"; "function_call" items have call_id, name, arguments (a JSON string)
        if item.type == "message":
            text += [p.text for p in item.content if p.type == "output_text"]
        elif item.type == "function_call":
            calls.append(ToolCall(item.name, json.loads(item.arguments or "{}"), id=item.call_id))
        # TODO-END
    usage = getattr(getattr(resp, "usage", None), "total_tokens", 0) or 0
    return Reply("".join(text), calls, usage, "tool_use" if calls else "end_turn")

# ---------- Anthropic Messages API ----------
def to_anthropic(messages: list[dict]) -> tuple[str | None, list[dict]]:
    """Return (system, messages) for client.messages.create(system=..., messages=...).
    Anthropic wants tool results inside a *user* message as tool_result blocks, and consecutive results merged."""
    system, out = None, []
    for m in messages:
        role = m["role"]
        if role == "system":
            system = m["content"]
        elif role == "user":
            out.append({"role": "user", "content": m["content"]})
        elif role == "assistant":
            blocks = [{"type": "text", "text": m["content"]}] if m.get("content") else []
            # TODO-START: add {"type": "tool_use", "id", "name", "input": args} blocks for each tool call
            blocks += [{"type": "tool_use", "id": c["id"], "name": c["name"], "input": c["args"]} for c in m.get("tool_calls", [])]
            # TODO-END
            out.append({"role": "assistant", "content": blocks})
        elif role == "tool":
            block = {"type": "tool_result", "tool_use_id": m["tool_call_id"], "content": m["content"]}
            if m.get("is_error"):
                block["is_error"] = True
            # TODO-START: if the previous message is a user message whose content is a list of tool_result blocks, append to it; else start a new user message
            if out and out[-1]["role"] == "user" and isinstance(out[-1]["content"], list):
                out[-1]["content"].append(block)
            else:
                out.append({"role": "user", "content": [block]})
            # TODO-END
    return system, out

def anthropic_tools(tools: list[dict]) -> list[dict]:
    return [{"name": t["name"], "description": t["description"], "input_schema": t["parameters"]} for t in tools]

def from_anthropic(msg) -> Reply:
    text, calls = [], []
    for b in msg.content:
        # TODO-START: "text" blocks have .text; "tool_use" blocks have .id, .name, .input (already a dict)
        if b.type == "text":
            text.append(b.text)
        elif b.type == "tool_use":
            calls.append(ToolCall(b.name, dict(b.input), id=b.id))
        # TODO-END
    u = msg.usage
    return Reply("".join(text), calls, (u.input_tokens + u.output_tokens) if u else 0,
                 "tool_use" if msg.stop_reason == "tool_use" else (msg.stop_reason or "end_turn"))

# ---------- the one function the rest of your code calls ----------
def call_model(messages: list[dict], tools: list[dict] | None = None, backend: str = "fake",
               model: str | None = None, fake=None, max_tokens: int = 1024) -> Reply:
    """backend: "fake" (pass fake=ScriptedLLM), "openai", or "anthropic". Model names change often, so pass
    them in (or set MODEL in your environment) instead of hard-coding them."""
    tools = tools or []
    model = model or os.environ.get("MODEL")
    if backend == "fake":
        return fake(messages, tools)
    if backend == "openai":
        from openai import OpenAI                     # reads OPENAI_API_KEY from the environment
        instr, items = to_openai(messages)
        kw = {"model": model, "input": items, "max_output_tokens": max_tokens}
        if instr: kw["instructions"] = instr
        if tools: kw["tools"] = openai_tools(tools)
        return from_openai(OpenAI().responses.create(**kw))
    if backend == "anthropic":
        import anthropic                              # reads ANTHROPIC_API_KEY from the environment
        system, msgs = to_anthropic(messages)
        kw = {"model": model, "messages": msgs, "max_tokens": max_tokens}
        if system: kw["system"] = system
        if tools: kw["tools"] = anthropic_tools(tools)
        return from_anthropic(anthropic.Anthropic().messages.create(**kw))
    raise ValueError(f"unknown backend {backend!r}")

# ---------- structured output with a repair loop ----------
M = TypeVar("M", bound=BaseModel)

def extract_json(text: str) -> str:
    """Models sometimes wrap JSON in ```json fences or add a sentence around it. Pull out the object."""
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fence:
        text = fence.group(1)
    s, e = text.find("{"), text.rfind("}")
    return text[s:e + 1] if s != -1 and e > s else text.strip()

def get_structured(llm, messages: list[dict], model_cls: Type[M], retries: int = 2) -> M:
    """Ask for JSON matching model_cls; if it doesn't validate, send the validation error back and retry.
    (Provider-native structured outputs - OpenAI responses.parse(text_format=...) or Anthropic
    output_config json_schema - make bad JSON rare, but you still validate: the *values* can be wrong.)"""
    msgs = list(messages) + [{"role": "user", "content":
            "Reply with only a JSON object matching this JSON Schema:\n" + json.dumps(model_cls.model_json_schema())}]
    last_err = None
    for attempt in range(retries + 1):
        reply = llm(msgs)
        # TODO-START: try model_cls.model_validate_json(extract_json(reply.text)); on ValidationError append the assistant reply and a user message containing the error, then loop
        try:
            return model_cls.model_validate_json(extract_json(reply.text))
        except ValidationError as e:
            last_err = e
            msgs += [{"role": "assistant", "content": reply.text},
                     {"role": "user", "content": f"That JSON was invalid:\n{e}\nReturn only the corrected JSON object."}]
        # TODO-END
    raise ValueError(f"no valid output after {retries + 1} attempts: {last_err}")

# ---------- streaming ----------
class StreamAccumulator:
    """Rebuilds a full Reply from streamed pieces. Normalised event kinds (see README for the real event names):
      {"kind": "text", "text": "..."}
      {"kind": "tool_start", "id": "...", "name": "..."}
      {"kind": "tool_args", "id": "...", "json": "<partial JSON string>"}
    Tool arguments arrive as JSON *fragments*: never json.loads a fragment; join them, parse at the end."""
    def __init__(self):
        self.text, self.order, self.names, self.args = [], [], {}, {}

    def feed(self, ev: dict) -> str | None:
        """Returns new text to show the user right away (or None)."""
        # TODO-START: append text; on tool_start remember id->name (keep order); on tool_args append the fragment for that id
        k = ev["kind"]
        if k == "text":
            self.text.append(ev["text"]); return ev["text"]
        if k == "tool_start":
            self.order.append(ev["id"]); self.names[ev["id"]] = ev["name"]; self.args[ev["id"]] = []
        elif k == "tool_args":
            self.args[ev["id"]].append(ev["json"])
        return None
        # TODO-END

    def result(self) -> Reply:
        # TODO-START: join text; for each tool id in order, json.loads the joined fragments ("" means {})
        calls = [ToolCall(self.names[i], json.loads("".join(self.args[i]) or "{}"), id=i) for i in self.order]
        return Reply("".join(self.text), calls, 0, "tool_use" if calls else "end_turn")
        # TODO-END
