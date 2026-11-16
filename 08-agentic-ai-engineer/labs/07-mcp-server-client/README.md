# Lab 07: A real MCP server and client

Course lessons: 17–18. Tests: 10 test functions (some are parametrised) in `tests/`.

## Why this matters
MCP is how tools get shared across hosts (Claude Desktop, Claude Code, Cursor, VS Code, ChatGPT connectors and your own agents). Many postings now list it by name.

## Words you'll meet
- **MCP (Model Context Protocol)**: think of USB for AI tools: build the device once, plug it into any host. Precisely: an open protocol (JSON-RPC messages) between hosts/clients and servers that offer tools, resources and prompts.
- **stdio transport**: think of talking to a device over its serial port. Precisely: the host starts the server as a subprocess and exchanges messages over stdin/stdout.
- **Resource**: think of a read-only register you can query by address. Precisely: data addressed by URI, e.g. fleet://devices/D1.
- **ToolError vs crash**: think of an error code you return on purpose vs a hard fault. Precisely: `ToolError` text reaches the model; any other exception is logged on the server and the model sees only a generic message.

## Your tasks (in `starter/`)
Each item is a `# TODO` that raises `NotImplementedError` until you replace it.

- `client_demo.py` → `to_specs`: one dict per tool: name, description ("" if None), parameters = tool.input_schema
- `client_demo.py` → `run_agent_over_mcp`: res = await client.call_tool(c.name, c.args); append a tool message with result_text(res) and is_error=res.is_error
- `fleet_server.py` → `list_devices`: return [{"id": id, **info}] for every device whose product matches (or all if product is None)
- `fleet_server.py` → `get_firmware`: raise ToolError(f"unknown device {device_id!r}") if missing; else return {"device_id", "installed", "latest", "outdated": installed != latest}
- `fleet_server.py` → `schedule_update`: validate device exists and is online (raise ToolError otherwise); append {"device_id", "version"} to SCHEDULED; return a confirmation string

## Run
```bash
cd labs/07-mcp-server-client
python -m pytest -q tests                       # your starter
LAB_TARGET=solution python -m pytest -q tests   # the reference
```
Work one TODO at a time. `python -m pytest -q tests -k <word>` runs only the tests whose names contain that word.

## With a real model
Version note: this uses the official `mcp` Python SDK **v2** (`from mcp.server import MCPServer`, `from mcp import Client`).
In v1 the server class was `FastMCP` (`from mcp.server.fastmcp import FastMCP`), and most tutorials online still show v1.

Plug the server into a desktop host. Example for Claude Desktop (`claude_desktop_config.json`):
```json
{"mcpServers": {"fleet": {"command": "/full/path/to/.venv/bin/python", "args": ["/full/path/to/fleet_server.py"]}}}
```
`python solution/client_demo.py` runs the full host side over stdio with the fake model. Swap in `call_model` from Lab 03 for a real one.

## Stretch
Expose the server over Streamable HTTP (see the SDK README for the HTTP transport) and add a bearer-token check.
