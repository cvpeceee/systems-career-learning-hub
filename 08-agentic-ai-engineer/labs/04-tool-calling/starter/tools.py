"""Lab 04: tools - turning ordinary Python functions into things a model can call safely.

A tool is like an RPC endpoint (remote procedure call): a name, a typed argument schema, and a handler.
The model only *requests* a call; your code validates the arguments, runs the handler, and sends the result back.
"""
from __future__ import annotations
import inspect, json, typing
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Any, Callable, Literal, get_args, get_origin

_PY_TO_JSON = {str: "string", int: "integer", float: "number", bool: "boolean"}

def type_to_schema(tp) -> dict:
    """Python type hint -> JSON Schema fragment. Supports str/int/float/bool, list[T], Literal[...], Optional[T]."""
    origin = get_origin(tp)
    # TODO: Literal -> {"type": <type of first value>, "enum": [...]}; list[T] -> {"type": "array", "items": schema(T)}; Optional[T] (Union with None) -> schema(T); plain -> {"type": _PY_TO_JSON[tp]}
    raise NotImplementedError('TODO: Literal -> {"type": <type of first value>, "enum": [...]}; list[T] -> {"type": "array", "items": schema(T)}; Optional[T] (Union with None) -> schema(T); plain -> {"type": _PY_TO_JSON[tp]}')

def schema_for(fn: Callable) -> dict:
    """Build the tool spec {name, description, parameters} from a function's signature and docstring.
    Parameters without a default are required. The docstring's first paragraph is the description the model reads,
    so write it like an API doc: what it does, when to use it."""
    hints = typing.get_type_hints(fn)
    props, required = {}, []
    for name, p in inspect.signature(fn).parameters.items():
        # TODO: props[name] = type_to_schema(hints[name]); add name to required if p.default is inspect.Parameter.empty
        raise NotImplementedError('TODO: props[name] = type_to_schema(hints[name]); add name to required if p.default is inspect.Parameter.empty')
    doc = inspect.getdoc(fn) or ""
    return {"name": fn.__name__, "description": doc.split("\n\n")[0].strip(),
            "parameters": {"type": "object", "properties": props, "required": required, "additionalProperties": False}}

_JSON_CHECK = {"string": lambda v: isinstance(v, str), "integer": lambda v: isinstance(v, int) and not isinstance(v, bool),
               "number": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool), "boolean": lambda v: isinstance(v, bool),
               "array": lambda v: isinstance(v, list)}

def validate(schema: dict, args: dict) -> list[str]:
    """Return a list of human-readable problems (empty list = valid). These messages go back to the model,
    so make them specific enough that it can fix its next attempt."""
    errs = []
    props, required = schema["properties"], schema.get("required", [])
    # TODO: missing required -> "missing required argument 'x'"; unknown key -> "unknown argument 'x'"; wrong type -> "'x' must be <type>"; enum -> "'x' must be one of [...]"; arrays: check each item's type
    raise NotImplementedError('TODO: missing required -> "missing required argument \'x\'"; unknown key -> "unknown argument \'x\'"; wrong type -> "\'x\' must be <type>"; enum -> "\'x\' must be one of [...]"; arrays: check each item\'s type')
    return errs

@dataclass
class ToolResult:
    call_id: str
    content: str
    is_error: bool = False

    def as_message(self) -> dict:
        return {"role": "tool", "tool_call_id": self.call_id, "content": self.content, "is_error": self.is_error}

class Registry:
    def __init__(self):
        self.fns: dict[str, Callable] = {}
        self.schemas: dict[str, dict] = {}

    def tool(self, fn: Callable) -> Callable:
        """Decorator: @reg.tool registers fn. (Python note: a decorator is a function that takes a function and
        returns one - here we just record it and hand back the original, like registering an ISR in a vector table.)"""
        self.fns[fn.__name__] = fn
        self.schemas[fn.__name__] = schema_for(fn)
        return fn

    def specs(self) -> list[dict]:
        return list(self.schemas.values())

    def dispatch(self, call) -> ToolResult:
        """Never raise into the agent loop: every failure becomes an error *result* the model can read and react to."""
        # TODO: unknown tool -> error result listing available tools; validation problems -> error result; run the function, json.dumps non-str results; exceptions -> error result "ToolError: <Type>: <msg>"
        raise NotImplementedError('TODO: unknown tool -> error result listing available tools; validation problems -> error result; run the function, json.dumps non-str results; exceptions -> error result "ToolError: <Type>: <msg>"')

    def dispatch_parallel(self, calls: list, max_workers: int = 8) -> list[ToolResult]:
        """Run independent calls concurrently (the model may request several in one turn).
        Results must come back in the SAME order as the calls so each result pairs with its call id."""
        # TODO: use ThreadPoolExecutor.map(self.dispatch, calls) - map preserves input order
        raise NotImplementedError('TODO: use ThreadPoolExecutor.map(self.dispatch, calls) - map preserves input order')
