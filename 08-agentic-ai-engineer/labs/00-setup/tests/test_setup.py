import sys, importlib
import pytest

def test_python_version():
    assert sys.version_info >= (3, 10), "Use Python 3.10 or newer (3.12 recommended)"

@pytest.mark.parametrize("pkg", ["pydantic", "mcp", "langgraph"])
def test_packages_installed(pkg):
    importlib.import_module(pkg)

def test_ask_uses_fake_llm():
    from fakellm import ScriptedLLM, say
    from hello import ask
    llm = ScriptedLLM([say("pong")])
    assert ask(llm, "ping") == "pong"
    assert llm.calls[0]["messages"] == [{"role": "user", "content": "ping"}]
