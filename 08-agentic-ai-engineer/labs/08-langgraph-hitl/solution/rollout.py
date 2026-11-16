"""Lab 08: a LangGraph agent that pauses for human approval and resumes - even in a new process.

Graph: START -> plan -> (devices > 1 ? approve : execute) -> execute -> END
  plan     : turns the request into a structured plan (a fake planner here; an LLM with structured output in real life)
  approve  : interrupt() pauses the run and hands the plan to a human; Command(resume=...) continues it
  execute  : "flashes" devices (records to FLASHED) unless rejected
A checkpointer saves state after every step, keyed by thread_id - like a journal that lets firmware resume
after a reset. InMemorySaver is for tests; use a database-backed saver (e.g. Postgres) in production.
"""
from __future__ import annotations
import re
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

FLASHED: list[dict] = []          # side-effect log so tests can check what really happened
APPROVAL_PROMPTS: list[dict] = [] # counts how often the approve node runs (it re-runs on resume!)

class S(TypedDict, total=False):
    request: str
    plan: dict
    approved: bool
    reviewer_note: str
    result: str

def fake_planner(request: str) -> dict:
    """Stand-in for an LLM call returning structured output like {"version": "3.8.2", "devices": ["D1", "D2"]}."""
    version = (re.search(r"\d+\.\d+\.\d+", request) or [None])[0] or "latest"
    devices = re.findall(r"\b[DL]\d+\b", request)
    return {"version": version, "devices": devices}

def plan_node(s: S) -> S:
    # TODO-START: return {"plan": fake_planner(s["request"])}
    return {"plan": fake_planner(s["request"])}
    # TODO-END

def route_after_plan(s: S) -> str:
    """Single-device changes run straight away; fleet changes need a human."""
    # TODO-START: return "approve" if more than one device in the plan, else "execute"
    return "approve" if len(s["plan"]["devices"]) > 1 else "execute"
    # TODO-END

def approve_node(s: S) -> S:
    APPROVAL_PROMPTS.append(dict(s["plan"]))   # runs again on resume: side effects BEFORE interrupt() repeat
    # TODO-START: decision = interrupt({"question": "Approve rollout?", "plan": s["plan"]}); expect {"action": "approve"|"edit"|"reject", "plan"?, "note"?}; return approved flag, (edited) plan and reviewer_note
    decision = interrupt({"question": "Approve rollout?", "plan": s["plan"]})
    action = decision.get("action")
    if action == "reject":
        return {"approved": False, "reviewer_note": decision.get("note", "")}
    if action == "edit":
        return {"approved": True, "plan": decision["plan"], "reviewer_note": decision.get("note", "")}
    return {"approved": True}
    # TODO-END

def execute_node(s: S) -> S:
    # TODO-START: if approved is False -> result "rejected: <note>; nothing flashed"; else append {"device", "version"} to FLASHED for each device and return result "flashed N device(s) to <version>"
    if s.get("approved") is False:
        return {"result": f"rejected: {s.get('reviewer_note', '')}; nothing flashed"}
    plan = s["plan"]
    for d in plan["devices"]:
        FLASHED.append({"device": d, "version": plan["version"]})
    return {"result": f"flashed {len(plan['devices'])} device(s) to {plan['version']}"}
    # TODO-END

def build(checkpointer=None):
    g = StateGraph(S)
    g.add_node("plan", plan_node); g.add_node("approve", approve_node); g.add_node("execute", execute_node)
    g.add_edge(START, "plan")
    g.add_conditional_edges("plan", route_after_plan, {"approve": "approve", "execute": "execute"})
    g.add_edge("approve", "execute"); g.add_edge("execute", END)
    return g.compile(checkpointer=checkpointer or InMemorySaver())

if __name__ == "__main__":
    app = build(); cfg = {"configurable": {"thread_id": "rollout-42"}}
    first = app.invoke({"request": "Roll 3.8.2 to D1 D2 D3"}, cfg)
    print("paused with:", first["__interrupt__"][0].value)
    ans = input("approve / reject? ").strip() or "approve"
    print(app.invoke(Command(resume={"action": ans}), cfg)["result"])
