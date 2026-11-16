# Lab 03: Real provider APIs, structured output, streaming

Course lessons: 7–9. Tests: 9 test functions (some are parametrised) in `tests/`.

## Why this matters
Every agent framework is a wrapper over these calls. Knowing the wire format lets you debug any of them.

## Words you'll meet
- **Adapter / HAL**: think of a hardware abstraction layer: one driver interface, many chips. Precisely: `call_model()` plus a neutral message format; only `llm.py` knows each provider's format.
- **Responses API**: think of OpenAI's current request/response shape. Precisely: `client.responses.create(model, input, instructions, tools)`; output items of type `message` and `function_call`.
- **Messages API**: think of Anthropic's request/response shape. Precisely: `client.messages.create(model, system, messages, tools, max_tokens)`; content blocks of type `text` and `tool_use`; tool results go back as `tool_result` blocks in a user message.
- **Structured output**: think of a form with fixed fields instead of a free-text letter. Precisely: the model returns JSON matching a schema; you still validate it (here with Pydantic).
- **Repair loop**: think of a NACK (negative acknowledgement) with the reason, so the sender can retransmit correctly. Precisely: send the validation error back to the model and ask again, a bounded number of times.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `llm.py` → `to_openai`: for each tool call append {"type": "function_call", "call_id": id, "name": name, "arguments": json.dumps(args)}
- `llm.py` → `to_openai`: append {"type": "function_call_output", "call_id": ..., "output": content}
- `llm.py` → `from_openai`: "message" items hold content parts of type "output_text"; "function_call" items have call_id, name, arguments (a JSON string)
- `llm.py` → `to_anthropic`: add {"type": "tool_use", "id", "name", "input": args} blocks for each tool call
- `llm.py` → `to_anthropic`: if the previous message is a user message whose content is a list of tool_result blocks, append to it; else start a new user message
- `llm.py` → `from_anthropic`: "text" blocks have .text; "tool_use" blocks have .id, .name, .input (already a dict)
- `llm.py` → `get_structured`: try model_cls.model_validate_json(extract_json(reply.text)); on ValidationError append the assistant reply and a user message containing the error, then loop
- `llm.py` → `feed`: append text; on tool_start remember id->name (keep order); on tool_args append the fragment for that id
- `llm.py` → `result`: join text; for each tool id in order, json.loads the joined fragments ("" means {})

## Run
```bash
cd labs/03-llm-api-structured
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
```bash
export OPENAI_API_KEY=...   ; BACKEND=openai    MODEL=<model-id> python solution/demo.py
export ANTHROPIC_API_KEY=...; BACKEND=anthropic MODEL=<model-id> python solution/demo.py
```
Real streaming event names, mapped onto `StreamAccumulator` kinds:
- OpenAI Responses (`stream=True`): `response.output_text.delta` → text; `response.output_item.added` with a function_call item → tool_start; `response.function_call_arguments.delta` → tool_args.
- Anthropic (`stream=True`): `content_block_start` with a `tool_use` block → tool_start; `content_block_delta` with `text_delta` → text, or with `input_json_delta` (`partial_json`) → tool_args.

Provider-native structured output: OpenAI `client.responses.parse(model=..., input=..., text_format=Ticket)`; Anthropic `output_config={"format": {"type": "json_schema", "schema": ...}}` on supported models. Keep `get_structured` as a fallback, because it works with any model.

## Stretch
Add a `backend="openai_compatible"` that points the OpenAI client at a local server (`OpenAI(base_url="http://localhost:11434/v1", api_key="x")` for Ollama).
