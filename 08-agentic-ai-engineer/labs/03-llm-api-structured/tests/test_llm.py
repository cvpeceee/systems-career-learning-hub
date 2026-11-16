import json
import pytest
from pydantic import BaseModel, Field
from fakellm import ScriptedLLM, say, Reply, ToolCall
from llm import to_openai, from_openai, to_anthropic, from_anthropic, call_model, get_structured, extract_json, StreamAccumulator

HISTORY = [
    {"role": "system", "content": "You are a fleet assistant."},
    {"role": "user", "content": "Firmware on D1 and D2?"},
    {"role": "assistant", "content": "", "tool_calls": [{"id": "c1", "name": "get_fw", "args": {"device": "D1"}},
                                                        {"id": "c2", "name": "get_fw", "args": {"device": "D2"}}]},
    {"role": "tool", "tool_call_id": "c1", "content": "1.4.2"},
    {"role": "tool", "tool_call_id": "c2", "content": "1.3.9"},
]

def test_to_openai_items():
    instr, items = to_openai(HISTORY)
    assert instr == "You are a fleet assistant."
    assert items[1] == {"type": "function_call", "call_id": "c1", "name": "get_fw", "arguments": '{"device": "D1"}'}
    assert items[3] == {"type": "function_call_output", "call_id": "c1", "output": "1.4.2"}
    assert len(items) == 5

def test_to_anthropic_merges_tool_results_into_one_user_message():
    system, msgs = to_anthropic(HISTORY)
    assert system == "You are a fleet assistant."
    assert [m["role"] for m in msgs] == ["user", "assistant", "user"]
    assert [b["type"] for b in msgs[1]["content"]] == ["tool_use", "tool_use"]
    assert msgs[1]["content"][0]["input"] == {"device": "D1"}
    assert [b["tool_use_id"] for b in msgs[2]["content"]] == ["c1", "c2"]

def test_from_openai_with_real_sdk_types():
    from openai.types.responses import Response, ResponseOutputMessage, ResponseOutputText, ResponseFunctionToolCall
    resp = Response.model_construct(output=[
        ResponseOutputMessage(id="m1", type="message", role="assistant", status="completed",
                              content=[ResponseOutputText(type="output_text", text="Checking.", annotations=[])]),
        ResponseFunctionToolCall(type="function_call", call_id="c9", name="get_fw", arguments='{"device":"D7"}'),
    ])
    r = from_openai(resp)
    assert r.text == "Checking." and r.stop_reason == "tool_use"
    assert (r.tool_calls[0].name, r.tool_calls[0].args, r.tool_calls[0].id) == ("get_fw", {"device": "D7"}, "c9")

def test_from_anthropic_with_real_sdk_types():
    from anthropic.types import Message
    msg = Message.model_validate({"id": "msg_1", "type": "message", "role": "assistant", "model": "any",
        "content": [{"type": "text", "text": "Let me check."},
                    {"type": "tool_use", "id": "tu_1", "name": "get_fw", "input": {"device": "D7"}}],
        "stop_reason": "tool_use", "stop_sequence": None, "usage": {"input_tokens": 50, "output_tokens": 20}})
    r = from_anthropic(msg)
    assert r.text == "Let me check." and r.usage == 70 and r.stop_reason == "tool_use"
    assert r.tool_calls[0].id == "tu_1" and r.tool_calls[0].args == {"device": "D7"}

def test_call_model_fake_backend():
    fake = ScriptedLLM([say("hi")])
    assert call_model([{"role": "user", "content": "x"}], backend="fake", fake=fake).text == "hi"
    with pytest.raises(ValueError):
        call_model([], backend="nope")

def test_extract_json():
    assert json.loads(extract_json('Sure!\n```json\n{"a": 1}\n```')) == {"a": 1}
    assert json.loads(extract_json('Here you go: {"a": {"b": 2}} hope it helps')) == {"a": {"b": 2}}

class Ticket(BaseModel):
    product: str
    severity: int = Field(ge=1, le=4)

def test_structured_repair_loop_fixes_bad_output():
    llm = ScriptedLLM([say('{"product": "dock", "severity": 9}'), say('{"product": "dock", "severity": 3}')])
    t = get_structured(llm, [{"role": "user", "content": "triage"}], Ticket)
    assert t == Ticket(product="dock", severity=3)
    second = llm.calls[1]["messages"]
    assert second[-1]["role"] == "user" and "invalid" in second[-1]["content"].lower()
    assert "severity" in second[-1]["content"]  # the actual validation error is sent back

def test_structured_gives_up():
    llm = ScriptedLLM([say("not json")], repeat_last=True)
    with pytest.raises(ValueError):
        get_structured(llm, [{"role": "user", "content": "x"}], Ticket, retries=2)
    assert len(llm.calls) == 3

def test_stream_accumulator_rebuilds_text_and_split_tool_args():
    acc = StreamAccumulator(); shown = []
    for ev in [{"kind": "text", "text": "Check"}, {"kind": "text", "text": "ing…"},
               {"kind": "tool_start", "id": "c1", "name": "get_fw"},
               {"kind": "tool_args", "id": "c1", "json": '{"dev'}, {"kind": "tool_args", "id": "c1", "json": 'ice": "D1"}'},
               {"kind": "tool_start", "id": "c2", "name": "ping"}]:
        t = acc.feed(ev)
        if t: shown.append(t)
    r = acc.result()
    assert shown == ["Check", "ing…"] and r.text == "Checking…"
    assert [(c.name, c.args) for c in r.tool_calls] == [("get_fw", {"device": "D1"}), ("ping", {})]
