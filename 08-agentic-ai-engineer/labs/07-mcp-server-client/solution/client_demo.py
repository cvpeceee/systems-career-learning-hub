"""An MCP *host* side: connect to a server, discover its tools, and let an agent loop use them.
python client_demo.py   (starts fleet_server.py as a subprocess over stdio; uses the fake LLM)"""
from __future__ import annotations
import asyncio, json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "common"))
from mcp import Client, StdioServerParameters

def to_specs(mcp_tools) -> list[dict]:
    """MCP tool list -> the {name, description, parameters} specs our Lab 03 adapter sends to OpenAI/Anthropic."""
    # TODO-START: one dict per tool: name, description ("" if None), parameters = tool.input_schema
    return [{"name": t.name, "description": t.description or "", "parameters": t.input_schema} for t in mcp_tools]
    # TODO-END

def result_text(res) -> str:
    """Prefer structured content (JSON) when the server provides it, else join the text blocks."""
    if res.structured_content is not None:
        return json.dumps(res.structured_content)
    return "".join(getattr(b, "text", "") for b in res.content)

async def run_agent_over_mcp(llm, goal: str, client, max_steps: int = 6) -> tuple[str | None, list[dict]]:
    """The Lab 05 loop, but tools live in another process behind MCP."""
    specs = to_specs((await client.list_tools()).tools)
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        reply = llm(messages, specs)
        messages.append(reply.as_message())
        if not reply.tool_calls:
            return reply.text, messages
        for c in reply.tool_calls:
            # TODO-START: res = await client.call_tool(c.name, c.args); append a tool message with result_text(res) and is_error=res.is_error
            res = await client.call_tool(c.name, c.args)
            messages.append({"role": "tool", "tool_call_id": c.id, "content": result_text(res), "is_error": bool(res.is_error)})
            # TODO-END
    return None, messages

async def main():
    from fakellm import ScriptedLLM, call, say
    server = StdioServerParameters(command=sys.executable, args=[str(pathlib.Path(__file__).with_name("fleet_server.py"))])
    async with Client(server) as client:
        print("tools:", [t.name for t in (await client.list_tools()).tools])
        llm = ScriptedLLM([call("get_firmware", device_id="D1"),
                           lambda m, t: say(f"D1 firmware info: {m[-1]['content']}")])
        answer, _ = await run_agent_over_mcp(llm, "Is D1 outdated?", client)
        print("answer:", answer)

if __name__ == "__main__":
    asyncio.run(main())
