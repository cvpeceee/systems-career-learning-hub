"""Lab 07: a real MCP server, using the official Python SDK (mcp v2: `MCPServer`; v1 called it FastMCP).

MCP (Model Context Protocol) is like USB for AI tools: write the server once, and any MCP host
(Claude Desktop, Claude Code, Cursor, VS Code, ChatGPT connectors, your own agent) can plug it in.
A server offers three kinds of things:
  tools     - functions the model may call (actions)        -> @mcp.tool()
  resources - read-only data addressed by URI (context)     -> @mcp.resource("scheme://...")
  prompts   - reusable prompt templates the user picks       -> @mcp.prompt()
Run over stdio:  python fleet_server.py
"""
from __future__ import annotations
from typing import TypedDict
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

# Raise ToolError for problems the MODEL should read ("unknown device"). Any other exception is treated as a
# crash: the SDK logs it on the server and the model only sees "Error executing tool <name>" - so internal
# details (paths, stack traces, secrets) never leak into the conversation.

mcp = MCPServer("fleet-tools")

DEVICES = {
    "D1": {"product": "dock", "firmware": "2.1.3", "online": True},
    "D2": {"product": "dock", "firmware": "2.1.4", "online": True},
    "L7": {"product": "laptop", "firmware": "1.9.0", "online": False},
}
LATEST = {"dock": "2.1.4", "laptop": "1.9.2"}
SCHEDULED: list[dict] = []   # side effects land here so tests can inspect them

@mcp.tool()
def list_devices(product: str | None = None) -> list[dict]:
    """List fleet devices, optionally only one product ("dock" or "laptop")."""
    # TODO: return [{"id": id, **info}] for every device whose product matches (or all if product is None)
    raise NotImplementedError('TODO: return [{"id": id, **info}] for every device whose product matches (or all if product is None)')

class Firmware(TypedDict):   # a typed return value gives clients structured_content plus an output schema
    device_id: str
    installed: str
    latest: str
    outdated: bool

@mcp.tool()
def get_firmware(device_id: str) -> Firmware:
    """Return the installed and latest firmware for one device, and whether it is outdated."""
    # TODO: raise ToolError(f"unknown device {device_id!r}") if missing; else return {"device_id", "installed", "latest", "outdated": installed != latest}
    raise NotImplementedError('TODO: raise ToolError(f"unknown device {device_id!r}") if missing; else return {"device_id", "installed", "latest", "outdated": installed != latest}')

@mcp.tool()
def schedule_update(device_id: str, version: str) -> str:
    """Schedule a firmware update for one ONLINE device. Has side effects: hosts should ask a human first."""
    # TODO: validate device exists and is online (raise ToolError otherwise); append {"device_id", "version"} to SCHEDULED; return a confirmation string
    raise NotImplementedError('TODO: validate device exists and is online (raise ToolError otherwise); append {"device_id", "version"} to SCHEDULED; return a confirmation string')

@mcp.resource("fleet://devices/{device_id}")
def device_record(device_id: str) -> str:
    """The raw record for one device, as text."""
    d = DEVICES.get(device_id)
    return f"{device_id}: {d}" if d else f"{device_id}: not found"

@mcp.prompt()
def triage(device_id: str) -> str:
    """Start a triage conversation for one device."""
    return f"Triage device {device_id}: check firmware with get_firmware, then propose next steps. Do not schedule updates without approval."

if __name__ == "__main__":
    mcp.run()   # stdio transport by default
