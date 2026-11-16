from fakellm import ScriptedLLM, Reply, ToolCall, say, call
from agent import run_agent, run_tool, trim_history

FW = {"D1": "1.4.2", "D2": "1.3.9"}
def get_fw(device: str) -> str:
    return FW[device]
TOOLS = {"get_fw": get_fw}

def test_answers_directly_without_tools():
    r = run_agent(ScriptedLLM([say("42")]), "meaning?", TOOLS)
    assert (r.answer, r.stop, r.steps) == ("42", "done", 1)

def test_tool_round_trip_feeds_result_back():
    llm = ScriptedLLM([call("get_fw", device="D2"),
                       lambda msgs, tools: say(f"D2 runs {msgs[-1]['content']}")])
    r = run_agent(llm, "fw of D2?", TOOLS)
    assert r.answer == "D2 runs 1.3.9" and r.stop == "done" and r.steps == 2
    tool_msg = r.messages[3]
    assert tool_msg["role"] == "tool" and tool_msg["tool_call_id"] == r.messages[2]["tool_calls"][0]["id"]

def test_parallel_calls_in_one_turn():
    llm = ScriptedLLM([Reply(tool_calls=[ToolCall("get_fw", {"device": "D1"}), ToolCall("get_fw", {"device": "D2"})]),
                       say("done")])
    r = run_agent(llm, "both", TOOLS)
    assert [m["content"] for m in r.messages if m["role"] == "tool"] == ["1.4.2", "1.3.9"]

def test_unknown_tool_and_exception_become_error_results():
    assert run_tool(TOOLS, "nope", {})[1] is True
    content, err = run_tool(TOOLS, "get_fw", {"device": "ZZ"})
    assert err and content.startswith("KeyError")
    llm = ScriptedLLM([call("get_fw", device="ZZ"), say("That device doesn't exist.")])
    r = run_agent(llm, "fw of ZZ?", TOOLS)
    assert r.stop == "done" and r.messages[3]["is_error"] is True

def test_max_steps_stops_a_runaway_agent():
    llm = ScriptedLLM([lambda m, t: Reply(tool_calls=[ToolCall("get_fw", {"device": "D1" if len(m) % 2 else "D2"})])], repeat_last=True)
    r = run_agent(llm, "loop forever", TOOLS, max_steps=3, max_repeats=99)
    assert r.stop == "max_steps" and r.answer is None and len(llm.calls) == 3

def test_loop_detection():
    llm = ScriptedLLM([call("get_fw", device="D1")], repeat_last=True)
    r = run_agent(llm, "stuck", TOOLS, max_steps=10, max_repeats=2)
    assert r.stop == "loop" and r.steps == 3

def test_token_budget():
    llm = ScriptedLLM([Reply(tool_calls=[ToolCall("get_fw", {"device": "D1"})], usage=600)], repeat_last=True)
    r = run_agent(llm, "expensive", TOOLS, token_budget=1000, max_repeats=99)
    assert r.stop == "budget" and r.tokens == 1200

def test_trace_records_llm_and_tool_steps():
    llm = ScriptedLLM([call("get_fw", device="D1"), say("ok")])
    r = run_agent(llm, "x", TOOLS)
    assert [t["type"] for t in r.trace] == ["llm", "tool", "llm"]
    assert r.trace[1]["name"] == "get_fw" and r.trace[1]["args"] == {"device": "D1"}

def _history(n_turns):
    msgs = [{"role": "system", "content": "sys"}, {"role": "user", "content": "goal"}]
    for i in range(n_turns):
        msgs.append({"role": "assistant", "content": "", "tool_calls": [{"id": f"c{i}", "name": "get_fw", "args": {"device": "D1"}}]})
        msgs.append({"role": "tool", "tool_call_id": f"c{i}", "content": "x" * 400})
    return msgs

def test_trim_keeps_head_and_never_orphans_tool_results():
    msgs = _history(10)
    count = lambda ms: sum(len(str(m)) for m in ms) // 4
    out = trim_history(msgs, max_tokens=400, count=count)
    assert out[:2] == msgs[:2]
    assert "trimmed" in out[2]["content"]
    assert count(out) <= 400 or len([m for m in out if m["role"] == "tool"]) == 1
    call_ids = {c["id"] for m in out if m.get("tool_calls") for c in m["tool_calls"]}
    result_ids = {m["tool_call_id"] for m in out if m["role"] == "tool"}
    assert call_ids == result_ids and out[-1] == msgs[-1]

def test_trim_noop_when_it_fits():
    msgs = _history(1)
    assert trim_history(msgs, 10_000) is msgs

def test_compact_summarises_old_groups_and_keeps_pairs():
    from agent import compact
    msgs = _history(5)
    seen = []
    def summarize(old):
        seen.extend(old); return "checked D1 three times, firmware 1.4.2"
    out = compact(msgs, summarize, keep_last=2)
    assert out[:2] == msgs[:2]
    assert out[2]["content"].startswith("[Summary of earlier work] checked D1")
    assert out[3:] == msgs[-4:]                      # last 2 groups (call + result each) verbatim
    assert len(seen) == 6 and seen[0]["role"] == "assistant" and seen[-1]["role"] == "tool"
    assert compact(_history(2), summarize, keep_last=2) == _history(2)
