# Lab 04: Tools the model can call safely

Course lessons: 10. Tests: 6 test functions (some are parametrised) in `tests/`.

## Why this matters
Tools turn a chatbot into an agent. Most production bugs live at this boundary: bad arguments, exceptions, wrong pairing of call and result.

## Words you'll meet
- **Tool**: think of an RPC (remote procedure call) endpoint with a typed signature. Precisely: a name, a description the model reads, a JSON Schema for arguments, and your handler.
- **JSON Schema**: think of a struct definition written in JSON. Precisely: describes argument names, types, enums and which are required; providers send it to the model.
- **Errors as results**: think of returning an error code instead of crashing the whole system. Precisely: a failed tool call becomes a tool message with is_error, so the model can read it and try something else.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `tools.py` → `type_to_schema`: Literal -> {"type": <type of first value>, "enum": [...]}; list[T] -> {"type": "array", "items": schema(T)}; Optional[T] (Union with None) -> schema(T); plain -> {"type": _PY_TO_JSON[tp]}
- `tools.py` → `schema_for`: props[name] = type_to_schema(hints[name]); add name to required if p.default is inspect.Parameter.empty
- `tools.py` → `validate`: missing required -> "missing required argument 'x'"; unknown key -> "unknown argument 'x'"; wrong type -> "'x' must be <type>"; enum -> "'x' must be one of [...]"; arrays: check each item's type
- `tools.py` → `dispatch`: unknown tool -> error result listing available tools; validation problems -> error result; run the function, json.dumps non-str results; exceptions -> error result "ToolError: <Type>: <msg>"
- `tools.py` → `dispatch_parallel`: use ThreadPoolExecutor.map(self.dispatch, calls) - map preserves input order

## Run
```bash
cd labs/04-tool-calling
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Pass `registry.specs()` as `tools` to `call_model` from Lab 03, then `registry.dispatch_parallel(reply.tool_calls)` and append each `result.as_message()`.

## Stretch
Support nested Pydantic models as parameters by using `Model.model_json_schema()`, and validate with Pydantic instead of the hand-written checker.
