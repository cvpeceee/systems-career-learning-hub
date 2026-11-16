"""Run against a real model:  BACKEND=openai MODEL=<model-id> python demo.py   (needs OPENAI_API_KEY)
                         or:  BACKEND=anthropic MODEL=<model-id> python demo.py (needs ANTHROPIC_API_KEY)
Without BACKEND it uses the fake model, so it always runs."""
import os, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "common"))
from pydantic import BaseModel
from fakellm import ScriptedLLM, say
from llm import call_model, get_structured

class Ticket(BaseModel):
    product: str
    severity: int   # 1 (low) .. 4 (critical)
    summary: str

backend = os.environ.get("BACKEND", "fake")
fake = ScriptedLLM([say('{"product": "dock", "severity": 3, "summary": "Dock not detected after sleep"}')])
llm = lambda msgs, tools=None: call_model(msgs, tools, backend=backend, fake=fake)
t = get_structured(llm, [{"role": "system", "content": "You triage support tickets."},
                         {"role": "user", "content": "Customer: my dock vanishes every time the laptop wakes up. Pretty annoying, blocks my work."}], Ticket)
print(backend, "->", t)
