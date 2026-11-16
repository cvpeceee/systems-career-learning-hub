import asyncio, json, sys, pathlib
import pytest
from mcp import Client, StdioServerParameters
from fakellm import ScriptedLLM, call, say
import fleet_server
from fleet_server import mcp as server
from client_demo import to_specs, result_text, run_agent_over_mcp

def run(coro):
    return asyncio.run(coro)

def test_tools_are_discoverable_with_schemas():
    async def go():
        async with Client(server) as c:
            return (await c.list_tools()).tools
    tools = {t.name: t for t in run(go())}
    assert set(tools) == {"list_devices", "get_firmware", "schedule_update"}
    assert tools["get_firmware"].input_schema["required"] == ["device_id"]
    assert "human" in tools["schedule_update"].description

def test_call_tool_structured_result():
    async def go():
        async with Client(server) as c:
            return await c.call_tool("get_firmware", {"device_id": "D1"})
    r = run(go())
    assert not r.is_error
    assert r.structured_content["outdated"] is True and r.structured_content["latest"] == "2.1.4"
    assert json.loads(result_text(r))["installed"] == "2.1.3"

def test_list_devices_filter():
    async def go():
        async with Client(server) as c:
            return await c.call_tool("list_devices", {"product": "laptop"})
    text = result_text(run(go()))
    assert "L7" in text and "D1" not in text

def test_tool_errors_come_back_as_is_error():
    async def go():
        async with Client(server) as c:
            return await c.call_tool("get_firmware", {"device_id": "ZZ"}), await c.call_tool("schedule_update", {"device_id": "L7", "version": "1.9.2"})
    missing, offline = run(go())
    assert missing.is_error and "unknown device" in result_text(missing)
    assert offline.is_error and "offline" in result_text(offline)

def test_side_effect_tool():
    fleet_server.SCHEDULED.clear()
    async def go():
        async with Client(server) as c:
            return await c.call_tool("schedule_update", {"device_id": "D1", "version": "2.1.4"})
    assert not run(go()).is_error
    assert fleet_server.SCHEDULED == [{"device_id": "D1", "version": "2.1.4"}]

def test_resource_and_prompt():
    async def go():
        async with Client(server) as c:
            return await c.read_resource("fleet://devices/D2"), await c.get_prompt("triage", {"device_id": "D2"})
    res, prompt = run(go())
    assert "2.1.4" in res.contents[0].text
    assert "D2" in prompt.messages[0].content.text

def test_specs_bridge_to_provider_format():
    async def go():
        async with Client(server) as c:
            return to_specs((await c.list_tools()).tools)
    specs = {s["name"]: s for s in run(go())}
    assert specs["get_firmware"]["parameters"]["type"] == "object"
    assert specs["list_devices"]["description"].startswith("List fleet devices")

def test_agent_loop_over_mcp_in_process():
    llm = ScriptedLLM([call("get_firmware", device_id="D2"), lambda m, t: say("outdated=" + str(json.loads(m[-1]["content"])["outdated"]))])
    async def go():
        async with Client(server) as c:
            return await run_agent_over_mcp(llm, "Is D2 outdated?", c)
    answer, msgs = run(go())
    assert answer == "outdated=False"
    assert {t["name"] for t in llm.calls[0]["tools"]} >= {"get_firmware"}

def test_stdio_transport_subprocess():
    path = pathlib.Path(fleet_server.__file__)
    params = StdioServerParameters(command=sys.executable, args=[str(path)])
    async def go():
        async with Client(params) as c:
            names = [t.name for t in (await c.list_tools()).tools]
            r = await c.call_tool("get_firmware", {"device_id": "D1"})
            return names, r
    names, r = run(go())
    assert "get_firmware" in names and r.structured_content["device_id"] == "D1"

def test_crash_details_stay_on_the_server():
    """Only ToolError text reaches the model; an unexpected exception is reported generically."""
    from mcp.server import MCPServer
    s = MCPServer("crashy")
    @s.tool()
    def leaky() -> str:
        """Always crashes."""
        raise RuntimeError("db password is hunter2")
    async def go():
        async with Client(s) as c:
            return await c.call_tool("leaky", {})
    r = run(go())
    assert r.is_error and "hunter2" not in result_text(r)
