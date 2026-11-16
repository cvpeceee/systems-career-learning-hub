import pytest
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command
import rollout
from rollout import build, fake_planner

@pytest.fixture(autouse=True)
def clean():
    rollout.FLASHED.clear(); rollout.APPROVAL_PROMPTS.clear()

def cfg(t):
    return {"configurable": {"thread_id": t}}

def test_planner():
    assert fake_planner("Roll 3.8.2 to D1 and D2") == {"version": "3.8.2", "devices": ["D1", "D2"]}

def test_single_device_runs_without_approval():
    out = build().invoke({"request": "Roll 3.8.2 to D1"}, cfg("t1"))
    assert "__interrupt__" not in out
    assert out["result"] == "flashed 1 device(s) to 3.8.2" and rollout.FLASHED == [{"device": "D1", "version": "3.8.2"}]

def test_fleet_change_pauses_and_nothing_is_flashed_yet():
    app = build()
    out = app.invoke({"request": "Roll 3.8.2 to D1 D2 D3"}, cfg("t2"))
    intr = out["__interrupt__"][0].value
    assert intr["question"] == "Approve rollout?" and intr["plan"]["devices"] == ["D1", "D2", "D3"]
    assert rollout.FLASHED == []
    assert app.get_state(cfg("t2")).next == ("approve",)

def test_approve_path():
    app = build(); app.invoke({"request": "Roll 3.8.2 to D1 D2"}, cfg("t3"))
    out = app.invoke(Command(resume={"action": "approve"}), cfg("t3"))
    assert out["result"] == "flashed 2 device(s) to 3.8.2" and len(rollout.FLASHED) == 2

def test_edit_path_uses_the_humans_plan():
    app = build(); app.invoke({"request": "Roll 3.8.2 to D1 D2 D3"}, cfg("t4"))
    out = app.invoke(Command(resume={"action": "edit", "plan": {"version": "3.8.2", "devices": ["D1"]}, "note": "canary first"}), cfg("t4"))
    assert rollout.FLASHED == [{"device": "D1", "version": "3.8.2"}] and out["reviewer_note"] == "canary first"

def test_reject_path_flashes_nothing():
    app = build(); app.invoke({"request": "Roll 3.8.2 to D1 D2"}, cfg("t5"))
    out = app.invoke(Command(resume={"action": "reject", "note": "freeze week"}), cfg("t5"))
    assert out["result"] == "rejected: freeze week; nothing flashed" and rollout.FLASHED == []

def test_resume_from_a_fresh_app_instance_sharing_the_checkpointer():
    """Simulates a restart: the graph object is rebuilt, only the saved checkpoints survive."""
    saver = InMemorySaver()
    build(saver).invoke({"request": "Roll 4.0.0 to D1 D2"}, cfg("t6"))
    out = build(saver).invoke(Command(resume={"action": "approve"}), cfg("t6"))
    assert out["result"] == "flashed 2 device(s) to 4.0.0"

def test_interrupted_node_reruns_from_the_top_on_resume():
    app = build(); app.invoke({"request": "Roll 1.0.0 to D1 D2"}, cfg("t7"))
    app.invoke(Command(resume={"action": "approve"}), cfg("t7"))
    assert len(rollout.APPROVAL_PROMPTS) == 2   # code before interrupt() ran twice: keep it idempotent

def test_threads_are_isolated():
    app = build()
    app.invoke({"request": "Roll 1.0.0 to D1 D2"}, cfg("a"))
    app.invoke({"request": "Roll 2.0.0 to D3 D4"}, cfg("b"))
    out = app.invoke(Command(resume={"action": "approve"}), cfg("b"))
    assert out["result"].endswith("2.0.0") and app.get_state(cfg("a")).next == ("approve",)
