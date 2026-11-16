# Chapters 5-9: MCP, frameworks, multi-agent & HITL, evals & observability, safety
L=[]
def les(**k): L.append(k)

les(id='mcp1',ch=5,t='MCP: the USB of AI tools',mins=30,
why='explain what MCP is and why it exists, name hosts, clients and servers, transports and the three server primitives, and describe the current protocol flow.',
an=r'''<p>Before USB, every printer, mouse and scanner had its own port and its own driver for every computer. USB fixed that: <b>one standard plug</b>, and any device works with any host.</p>
<p>Before MCP, every AI app needed custom code for every tool (GitHub, Jira, your log server). The Model Context Protocol is the standard plug: you write <b>one MCP server</b> for your tools, and any MCP-capable app (IDE assistants, chat apps, your own agent) can use it.</p>''',
d=r'''<h3>The cast</h3>
<ul>
<li><b>Host</b>: the AI application the user runs, such as an IDE assistant, a desktop chat app or your own agent service.</li>
<li><b>Client</b>: the connector inside the host. One client talks to one server.</li>
<li><b>Server</b>: your program, which offers capabilities. It can be a local process or a remote web service.</li>
</ul>
<div class="fw"><b>Firmware link:</b> host = laptop, client = one port on its USB host controller, server = the plugged-in device. A host can have many clients connected to many servers at once.</div>

<h3>What a server can offer</h3>
<div class="tbl"><table><tr><th>Primitive</th><th>Who decides to use it</th><th>Example</th></tr>
<tr><td><b>Tools</b></td><td>The model (via tool calling)</td><td><code>search_logs(unit, pattern)</code>, <code>create_ticket(...)</code></td></tr>
<tr><td><b>Resources</b></td><td>The app or user (attach as context)</td><td><code>device://17/status</code>, a config file, a datasheet</td></tr>
<tr><td><b>Prompts</b></td><td>The user (pick from a menu)</td><td>"Triage unit N" template</td></tr></table></div>

<h3>On the wire</h3>
<ul><li>Messages are <b>JSON-RPC 2.0</b>: a request with <code>id</code>, <code>method</code> and <code>params</code>; a response with the same <code>id</code> and a <code>result</code> or <code>error</code>.</li>
<li><b>Transports</b>: <b>stdio</b> (the host launches your server as a child process and talks over stdin/stdout; used for local tools) and <b>Streamable HTTP</b> (the client POSTs to one URL; used for remote, shared servers, normally with OAuth for authorisation).</li>
<li>Key methods: <code>tools/list</code>, <code>tools/call</code>, <code>resources/list</code>, <code>resources/read</code>, <code>prompts/list</code>, <code>prompts/get</code>.</li></ul>

<h3>Spec versions: know both</h3>
<p>The MCP specification is versioned by date. The current revision, <b>2026-07-28</b>, made the protocol <b>stateless</b>. There is no handshake: each request carries its protocol version and client capabilities in <code>_meta</code>, and servers must implement <code>server/discover</code> so clients can ask about versions and capabilities up front. The previous revision (<b>2025-11-25</b>), which many servers still run, opened every connection with an <code>initialize</code> request and a <code>notifications/initialized</code> message. In an interview, say you know both. The SDKs handle the difference for you.</p>
<p>The current spec also deprecated the client-side features Roots, Sampling and Logging, and moved long-running "tasks" into an optional extension.</p>

<h3>Why it matters for the job</h3>
<ul><li>Postings increasingly list "build MCP servers" and "tool schema design" as requirements. Several say their MCP server is already in production.</li>
<li>MCP turns your internal APIs into something every agent in the company can use, so one server you build is reused by every team's agents instead of each team writing its own integration.</li>
<li>It concentrates risk: a server is arbitrary code execution offered to a model. The spec tells hosts to obtain user consent before invoking tools and to treat tool descriptions from untrusted servers as untrusted (more in Chapter 9).</li></ul>

<h3>MCP vs A2A</h3>
<p>MCP connects an agent to <b>tools and data</b>. A2A (Agent2Agent, a protocol Google started that is now under the Linux Foundation) connects <b>agents to other agents</b>, which may be built by other teams or vendors. You will mostly build MCP. Know that A2A exists.</p>''',
anim='mcpseq',
q=[dict(q='Your log-search tool should be usable from an IDE assistant, a desktop chat app and your team\'s own agent. What do you build?',o=['Three separate plugins','One MCP server exposing a search_logs tool','A fine-tuned model','A vector database'],a=1,w='Write once, plug in anywhere: that is the point of MCP.'),
dict(q='Which transport fits a server shared by the whole company over the network?',o=['stdio','Streamable HTTP','Bluetooth','Shared memory'],a=1,w='stdio is for local child processes. Remote shared servers use Streamable HTTP, usually with OAuth.'),
dict(q='In the 2026-07-28 MCP spec, what replaced the initialize handshake?',o=['Nothing; it is still required','Per-request version and capabilities in _meta, plus an optional server/discover call','A WebSocket upgrade','OAuth'],a=1,w='The protocol became stateless. Older servers (2025-11-25) still use initialize, and SDKs negotiate.')])

les(id='mcp2',ch=5,t='Build an MCP server and client in Python',mins=45,
why='write a working MCP server with tools, a resource and a prompt using the official Python SDK (v2), connect a client over stdio, and test it.',
an=r'''<p>Writing an MCP server with the official SDK feels like writing a small USB gadget function with configfs: you declare what you offer (tools, resources, prompts), and the framework handles the protocol, enumeration and message framing.</p>''',
d=r'''<h3>Setup</h3>
<pre><code>pip install "mcp[cli]"       # official SDK; version 2.x at the time of writing</code></pre>
<div class="warn"><b>Version note:</b> in SDK v1 the server class was <code>FastMCP</code> (<code>from mcp.server.fastmcp import FastMCP</code>). SDK v2 renamed it <code>MCPServer</code>. Many blog posts still show v1. The code below was run with v2.3.0 in this course's lab.</div>

<h3>The server: fleet_server.py</h3>
<pre><code>from mcp.server import MCPServer

mcp = MCPServer("fleet-tools")

@mcp.tool()
def search_logs(unit: int, pattern: str, limit: int = 20) -> list[str]:
    """Search ONE unit's logs for lines containing `pattern` (case-insensitive).
    Use for questions about errors, reboots or crashes. Returns newest lines first."""
    lines = load_logs(unit)                       # your real data source
    hits = [l for l in reversed(lines) if pattern.lower() in l.lower()]
    return hits[:limit]

@mcp.tool()
def get_firmware_history(unit: int) -> list[dict]:
    """Firmware versions installed on a unit, newest first, with ISO timestamps."""
    return load_fw_history(unit)

@mcp.resource("device://{unit}/status")
def device_status(unit: int) -> str:
    """Current status summary of a unit."""
    return render_status(unit)

@mcp.prompt()
def triage(unit: int) -> str:
    """Start a reboot triage for a unit."""
    return f"Find why unit {unit} rebooted. Use search_logs and get_firmware_history; quote evidence."

if __name__ == "__main__":
    mcp.run()          # stdio by default; mcp.run(transport="streamable-http") to serve over HTTP</code></pre>
<p>Notice what you didn't write: no JSON Schema and no protocol handling. <code>unit: int</code> becomes <code>{"type": "integer"}</code> in the tool's <code>inputSchema</code>, the docstring becomes the description the model reads, and a wrongly typed argument is rejected with an error result (<code>isError: true</code>) before your function runs.</p>
<div class="key"><b>Rule for stdio servers:</b> never <code>print()</code> to stdout. stdout <i>is</i> the protocol channel, so log to stderr instead.</div>

<h3>The client</h3>
<pre><code>import asyncio, sys
from mcp import Client, StdioServerParameters

async def main():
    server = StdioServerParameters(command=sys.executable, args=["fleet_server.py"])
    async with Client(server) as client:                    # launches the server as a child process
        tools = await client.list_tools()
        print([t.name for t in tools.tools])
        r = await client.call_tool("search_logs", {"unit": 17, "pattern": "watchdog"})
        print(r.structured_content, r.is_error)
        print(await client.read_resource("device://17/status"))

asyncio.run(main())</code></pre>
<p>In tests you can pass the <code>mcp</code> server object straight to <code>Client(mcp)</code> and it connects in-process, with no subprocess. The lab uses both ways.</p>

<h3>Wiring MCP tools into your agent loop</h3>
<pre><code>tools = (await client.list_tools()).tools
llm_tools = [{"type": "function", "name": t.name, "description": t.description,
              "parameters": t.input_schema} for t in tools]      # MCP schema → LLM tool definition
# in the loop, for each tool call the model makes:
result = await client.call_tool(call.name, call.args)
tool_message = result.structured_content or "\n".join(c.text for c in result.content if c.type == "text")</code></pre>
<p>Frameworks do this mapping for you. The OpenAI Agents SDK, the Claude Agent SDK and LangChain's MCP adapters can all attach MCP servers directly.</p>

<h3>TypeScript, briefly</h3>
<p>The official TypeScript SDK (<code>@modelcontextprotocol/sdk</code>) has the same shape: create a server, register tools with a schema (it uses the Zod validation library), and connect a stdio or HTTP transport. Teams with Node backends often write servers in it.</p>

<h3>Testing and debugging</h3>
<ul><li><b>MCP Inspector</b> (<code>mcp dev fleet_server.py</code>, from the <code>[cli]</code> extra) opens a UI to list and call your tools by hand.</li>
<li>Unit-test tool functions directly, and integration-test through <code>Client(mcp)</code>.</li>
<li>Design for the model: small, clear tools, compact results, helpful error messages and deterministic ordering.</li></ul>''',
q=[dict(q='Your stdio MCP server works in tests but the host shows garbled protocol errors. Likely cause?',o=['Wrong Python version','A print() statement writing to stdout, which corrupts the JSON-RPC stream','Missing GPU','Too many tools'],a=1,w='On stdio, stdout carries protocol messages only. Log to stderr.'),
dict(q='Where does the MCP SDK get the tool\'s input schema?',o=['You must write JSON Schema by hand','From the function\'s type hints (and defaults); the docstring becomes the description','From the model','From the function name only'],a=1,w='Type hints → JSON Schema, docstring → description. Write both carefully, because the model reads them.')],
lab='Lab 07 (<code>labs/07-mcp-server-client</code>): a fleet MCP server with three tools (one with side effects), a resource and a prompt, plus a client that feeds MCP tools into your agent loop, tested in-process and over a real stdio subprocess with the official <code>mcp</code> v2 SDK. These tests run the real protocol, not a mock.')

les(id='frameworks',ch=6,t='Agent frameworks, honestly compared (and when to use none)',mins=35,
why='describe what LangGraph, the OpenAI Agents SDK, the Claude Agent SDK, CrewAI, Microsoft Agent Framework, LlamaIndex and Google ADK are each for, and justify a choice in an interview.',
an=r'''<p>Choosing an agent framework is like choosing between a hand-rolled super-loop, FreeRTOS and embedded Linux. Each adds features and constraints. The right answer depends on the product, and "none yet" is often correct for a first version.</p>''',
d=r'''<h3>What every framework gives you</h3>
<p>The loop you wrote in Chapter 3, plus some of: tool plumbing from type hints, typed state, persistence (checkpoints), human-approval pauses, streaming, tracing, multi-agent handoffs and MCP integration.</p>

<h3>The main options (late 2026)</h3>
<div class="tbl"><table><tr><th>Framework</th><th>Core idea</th><th>Reach for it when</th><th>Watch out for</th></tr>
<tr><td><b>LangGraph</b> (LangChain team; Python and JS)</td><td>An agent is an explicit graph: nodes, conditional edges, a typed state, checkpointers, <code>interrupt()</code> for human input, durable execution</td><td>Stateful, long-running, auditable workflows with HITL. The framework named most often in the postings we read</td><td>More concepts to learn, and verbose for tiny agents</td></tr>
<tr><td><b>OpenAI Agents SDK</b> (Python, TS)</td><td>Few primitives: Agent, Runner, tools, handoffs, guardrails, sessions, built-in tracing</td><td>Fast, clean agents and handoffs, especially on OpenAI models (other providers are supported via adapters)</td><td>Less explicit control flow than a graph</td></tr>
<tr><td><b>Claude Agent SDK</b> (Python, TS)</td><td>The Claude Code harness as a library: file, shell and web tools, permission modes, hooks, subagents, MCP</td><td>Agents that operate on files, repos or a computer (coding, log digging, ops), on Claude models</td><td>Tied to Anthropic models. Its tools can edit files and run shell commands, so you must configure permissions and sandboxing</td></tr>
<tr><td><b>CrewAI</b> (Python)</td><td>Role-based "crews" of agents with tasks, plus event-driven Flows</td><td>Quick multi-role prototypes and business workflows</td><td>Role-play abstractions can hide what is actually sent to the model</td></tr>
<tr><td><b>Microsoft Agent Framework</b> (Python, .NET)</td><td>Successor to AutoGen and Semantic Kernel (1.0 in April 2026): agents, graph workflows, multi-agent patterns, MCP and A2A</td><td>.NET/Azure shops and enterprise integration</td><td>AutoGen itself is archived. Don't start new work on it (a community fork, AG2, continues)</td></tr>
<tr><td><b>LlamaIndex</b> (Python, TS)</td><td>Data first: loaders, indexing and retrieval, plus agents and workflows</td><td>RAG-heavy systems over many document types</td><td>Overlaps with your own retrieval code. Use the parts you need</td></tr>
<tr><td><b>Google ADK</b> (Python, others)</td><td>Agent Development Kit: agents, tools and multi-agent support, integrated with Gemini and Google Cloud</td><td>Google Cloud / Gemini shops</td><td>Best fit inside Google's ecosystem</td></tr></table></div>

<h3>The same agent in two frameworks</h3>
<pre><code># OpenAI Agents SDK
from agents import Agent, Runner, function_tool

@function_tool
def search_logs(unit: int, pattern: str) -> list[str]:
    """Search one unit's logs for a pattern."""
    return find(unit, pattern)

triage = Agent(name="Triage", instructions="Find why a unit rebooted. Quote evidence.",
               tools=[search_logs], model=MODEL)
print(Runner.run_sync(triage, "Why did unit 17 reboot?", max_turns=8).final_output)</code></pre>
<pre><code># Claude Agent SDK: an agent that can read a repo, with tools restricted
from claude_agent_sdk import query, ClaudeAgentOptions
opts = ClaudeAgentOptions(allowed_tools=["Read", "Grep", "Glob"], permission_mode="default",
                          max_turns=10, cwd="/src/firmware")
async for message in query(prompt="Why does test_usb_resume fail? Cite file:line.", options=opts):
    print(message)</code></pre>
<p>LangGraph gets its own hands-on lesson next.</p>

<h3>When NOT to use a framework</h3>
<ul><li>One or two LLM calls, or a fixed workflow. Plain code plus your <code>call_model()</code> wrapper is clearer.</li>
<li>When you cannot explain what the framework sends to the model. Debugging blind is expensive.</li>
<li>When its abstractions fight your requirements (custom persistence, strict latency budgets).</li></ul>
<div class="key"><b>How to answer "which framework would you use?"</b>: "It depends on three things: whether I need durable state and human approval (then LangGraph or a durable engine), which model provider we're on (the vendor SDKs fit their own models best), and how much control flow is fixed. I prototype the loop by hand to learn the problem, then adopt the framework that removes the most code I'd otherwise have to maintain, and I keep my tools as MCP servers so they're portable."</div>''',
q=[dict(q='A team needs agent runs that pause for manager approval for up to 3 days and survive deploys. Which framework feature matters most?',o=['Role-play agents','Persistent checkpoints plus interrupt/resume (e.g. LangGraph), or a durable execution engine','Prompt templates','Built-in vector store'],a=1,w='Long pauses need state persisted outside the process and an explicit resume.'),
dict(q='Starting a brand-new project, would you pick AutoGen today?',o=['Yes, it is the newest','No: Microsoft archived it; Microsoft Agent Framework is the successor','Only in Java','Only with GPUs'],a=1,w='AutoGen and Semantic Kernel merged into Microsoft Agent Framework (1.0 in April 2026). AutoGen is no longer maintained by Microsoft.')])

les(id='langgraph',ch=6,t='LangGraph hands-on: state, routing, checkpoints and interrupts',mins=45,
why='build a LangGraph agent with typed state, conditional routing, a checkpointer and a human-approval interrupt, and resume it.',
an=r'''<p>LangGraph is "write your agent as a state machine diagram, with save points". Nodes are the bubbles, edges are the arrows, a typed state struct flows through, and a checkpointer saves the struct after every bubble, so you can stop, wait for a person, crash or redeploy, and carry on from exactly there.</p>''',
d=r'''<h3>The pieces</h3>
<ul><li><b>State</b>: a <code>TypedDict</code> (or Pydantic model) holding everything the graph knows.</li>
<li><b>Nodes</b>: plain functions <code>state → partial update</code>.</li>
<li><b>Edges</b>: fixed (<code>add_edge</code>) or conditional (<code>add_conditional_edges</code>, where a function looks at the state and returns the next node's name).</li>
<li><b>Checkpointer</b>: saves state after each step, keyed by a <code>thread_id</code>. Use <code>InMemorySaver</code> for tests, and SQLite or Postgres savers in production.</li>
<li><b><code>interrupt()</code></b>: pauses the graph inside a node and returns a value to the caller. You resume with <code>Command(resume=...)</code>.</li></ul>

<h3>A firmware-rollout agent with an approval gate</h3>
<pre><code>from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

class S(TypedDict, total=False):
    request: str
    plan: dict          # e.g. {"version": "3.8.2", "devices": 40}
    approved: bool
    result: str

def make_plan(s: S) -> S:
    return {"plan": llm_plan(s["request"])}          # an LLM call returning structured output

def needs_approval(s: S) -> str:
    return "approve" if s["plan"]["devices"] > 1 else "execute"

def approve(s: S) -> S:
    decision = interrupt({"question": "Approve rollout?", "plan": s["plan"]})   # pauses here
    return {"approved": decision["approved"], "plan": decision.get("plan", s["plan"])}

def execute(s: S) -> S:
    if s.get("approved") is False: return {"result": "rejected; nothing flashed"}
    return {"result": flash(s["plan"])}

g = StateGraph(S)
g.add_node("plan", make_plan); g.add_node("approve", approve); g.add_node("execute", execute)
g.add_edge(START, "plan")
g.add_conditional_edges("plan", needs_approval, {"approve": "approve", "execute": "execute"})
g.add_edge("approve", "execute"); g.add_edge("execute", END)
app = g.compile(checkpointer=InMemorySaver())

cfg = {"configurable": {"thread_id": "rollout-42"}}
first = app.invoke({"request": "Roll 3.8.2 to building 3"}, cfg)
print(first["__interrupt__"])                        # the pending question, shown to a human
final = app.invoke(Command(resume={"approved": True, "plan": {"version": "3.8.2", "devices": 2}}), cfg)
print(final["result"])</code></pre>
<div class="py"><b>Python note:</b> <code>TypedDict</code> describes a dict's keys and types for tools and editors, but at run time it is still a plain dict. <code>total=False</code> means keys may be missing.</div>

<h3>Things that trip people up</h3>
<ul><li><b>When resumed, the interrupted node re-runs from its start.</b> Code before <code>interrupt()</code> runs again, so keep side effects after the interrupt or make them idempotent.</li>
<li>The same <code>thread_id</code> is the same run. A new id starts fresh.</li>
<li>Nodes return <i>updates</i>, which are merged into the state. For lists such as messages, use a reducer (the prebuilt <code>MessagesState</code> appends instead of overwriting).</li>
<li>LangGraph also has prebuilt agents and higher-level helpers. Learn the graph API first, so you understand what the helpers do.</li></ul>
<div class="fw"><b>Firmware link:</b> this is a state machine with a journal. <code>interrupt()</code> works like a task blocking on a semaphore whose stack has been saved to flash, and the checkpointer is the journal that makes resume-after-reset possible.</div>''',
anim='hitl',
q=[dict(q='After resuming, a "send notification" call placed before interrupt() in the same node fires twice. Why?',o=['A LangGraph bug','On resume the interrupted node re-executes from the top, so put side effects after interrupt() or make them idempotent','The checkpointer is broken','Two thread IDs were used'],a=1,w='Resume replays the node. This is documented behaviour, so design for it.'),
dict(q='What ties a resumed invoke() to the paused run?',o=['The node name','The same thread_id in the config, with a checkpointer','The model name','Nothing; it always starts over'],a=1,w='Checkpoints are stored per thread_id. Same id + checkpointer = continue.')],
lab='Lab 08 (<code>labs/08-langgraph-hitl</code>): the rollout graph above with a fake planner. Tests cover approve, edit and reject paths, the no-approval path for a single device, and resuming from the checkpoint, with real LangGraph and no API key.')

les(id='multi',ch=7,t='Multi-agent systems: when several agents beat one',mins=35,
why='describe supervisor/orchestrator-worker, handoff and parallel fan-out designs, know when multi-agent helps or hurts, and build an orchestrator from scratch.',
an=r'''<p>One brilliant generalist with forty tools and a desk buried in paperwork makes mistakes. A small team (a lead who splits the work, plus specialists who each see only their own files) often does better, <b>as long as the hand-offs are clean</b>. Hand-offs are where teams, human or AI, lose information.</p>''',
d=r'''<h3>Why split at all?</h3>
<ul><li><b>Context isolation</b>: each worker starts with a fresh context holding only its subtask, so nothing gets buried.</li>
<li><b>Tool focus</b>: three agents with five tools each choose better than one agent with fifteen.</li>
<li><b>Parallelism</b>: independent research threads run at the same time.</li>
<li><b>Different models</b>: a strong model for planning, cheaper ones for workers.</li></ul>

<h3>The common designs</h3>
<ul><li><b>Supervisor / orchestrator-worker</b>: a lead agent plans and delegates (often by calling workers as tools) and merges short reports.</li>
<li><b>Handoff</b>: the current agent transfers the whole conversation to a specialist (triage → billing agent). This is native in the OpenAI Agents SDK.</li>
<li><b>Sequential pipeline</b>: agents in a fixed order (researcher → writer → reviewer). This is really a workflow.</li>
<li><b>Group chat / debate</b>: several agents converse. It is mostly research territory and hard to control in production.</li></ul>

<h3>An orchestrator from scratch</h3>
<pre><code>async def orchestrate(goal: str) -> str:
    plan = await llm_structured(f"Split into independent subtasks: {goal}", schema=SubtaskList)
    async def work(t):                                   # each worker = small agent loop, own tools, fresh context
        return await run_agent_async(t.instruction, tools=TOOLSETS[t.kind], max_steps=6)
    reports = await asyncio.gather(*(work(t) for t in plan.subtasks[:5]), return_exceptions=True)
    findings = "\n".join(f"- {t.kind}: {r if not isinstance(r, Exception) else 'FAILED: ' + str(r)}"
                         for t, r in zip(plan.subtasks, reports))
    return await llm_text(f"Goal: {goal}\nWorker reports:\n{findings}\nWrite the answer; flag conflicts.")</code></pre>
<div class="py"><b>Python note:</b> <code>return_exceptions=True</code> makes <code>gather</code> return a failed worker's exception as a value instead of cancelling everything, so one failure doesn't sink the team.</div>

<h3>The honest costs</h3>
<ul><li><b>Tokens</b>: several agents each re-reading context costs a multiple of a single agent. Anthropic has written that its multi-agent research system used many times more tokens than single-agent chat.</li>
<li><b>Lost information at hand-offs</b>: workers don't see each other's discoveries unless you pass them on.</li>
<li><b>Harder debugging</b>: you need traces across agents (Chapter 8).</li>
<li><b>Conflicts</b>: two workers acting on the same resource. Read-only workers are much safer.</li></ul>
<div class="key"><b>Rule of thumb:</b> use multi-agent for <i>breadth</i> (many independent sub-questions, mostly reading). Use one agent, or a workflow, for <i>depth</i> (tightly coupled steps, shared state, writes).</div>''',
anim='multiagent',
q=[dict(q='Which task benefits most from orchestrator-worker?',o=['Edit one function in one file','Research 6 independent suppliers\' datasheets for a part and compare them','Answer a yes/no question','Format a date'],a=1,w='Independent, read-heavy subtasks parallelise well and benefit from isolated contexts.'),
dict(q='Workers return their whole 20k-token transcripts to the orchestrator. Problem?',o=['None','It defeats context isolation and multiplies cost; workers should return short, structured reports','It is faster','It improves accuracy'],a=1,w='The point is to compress: workers digest, and the orchestrator reads summaries with evidence.')],
lab='Lab 09 (<code>labs/09-multi-agent</code>): an async orchestrator with parallel workers, a failure-tolerant fan-in and a token budget shared across agents.')

les(id='durable',ch=7,t='Human-in-the-loop and long-running, durable agents',mins=30,
why='design approval steps that people can actually review, and make agent runs survive crashes, deploys and multi-day waits.',
an=r'''<p>A firmware update that writes 4 MB of flash must survive a power cut halfway through. You journal each block, and on reboot you resume instead of bricking.</p>
<p>A long agent run is the same: twenty steps, a 2-day wait for a manager's approval, a deploy in between. <b>Durable execution</b> journals every completed step so the run resumes instead of starting over (or worse, repeating side effects).</p>''',
d=r'''<h3>Human-in-the-loop: where and how</h3>
<ul><li><b>Where</b>: before irreversible or costly actions (send, pay, delete, deploy, flash, merge), when confidence is low, or when policy requires it.</li>
<li><b>Patterns</b>: <i>approve / edit / reject</i> a proposed tool call; <i>answer a question</i> the agent asks; <i>review the output</i> before it goes out.</li>
<li><b>Make approvals reviewable</b>: show the exact action and arguments (recipients, amounts, device count, diff), why the agent wants it, and what happens if rejected. "Approve agent action?" with no detail trains people to click yes.</li>
<li><b>Record</b> who approved what and when, and feed rejections back to the model as the tool result, so it can adapt.</li></ul>
<p>Framework support: LangGraph's <code>interrupt()</code>, the OpenAI Agents SDK's <code>needs_approval</code> on tools, the Claude Agent SDK's permission modes and <code>can_use_tool</code> callback, and MCP hosts asking for consent before tool calls.</p>

<h3>Making runs durable</h3>
<ol><li><b>Persist state after every step</b> (checkpoint) in a real database, not process memory.</li>
<li><b>Make steps idempotent</b>: give every side-effecting tool call an idempotency key (for example run_id + step number), so a replayed step doesn't flash twice or email twice.</li>
<li><b>Run in the background</b>: put long runs on a job queue with workers, not inside an HTTP request that times out after seconds. Notify the user (webhook, email, chat) when input is needed or the work is done.</li>
<li><b>Timeouts and heartbeats</b> on every step, so a stuck tool call is detected and retried or failed.</li>
<li><b>Versioning</b>: a run paused for 3 days may resume on new code. Keep state schemas backward compatible.</li></ol>

<h3>Durable execution engines</h3>
<p><b>Temporal</b> is the best-known open-source example (two of the postings we read name it). You write a workflow as ordinary code. Each "activity" (a model call, a tool call) is recorded, and after a crash the engine replays the history to rebuild state and continues from the next step. It handles retries, timers ("wait 2 days for approval") and signals (the approval arriving). The trade-off is that workflow code must be deterministic: model and tool calls go in activities, never directly in workflow logic.</p>
<p>Lighter options: LangGraph with a Postgres checkpointer, or your own state table plus a job queue, which is fine for many products.</p>
<div class="fw"><b>Firmware link:</b> A/B partitions plus an update journal, a watchdog, and idempotent block writes. You have built durable execution before, just in flash instead of Postgres.</div>''',
q=[dict(q='After a crash, your agent re-ran step 7 and charged a customer twice. The missing ingredient?',o=['A bigger model','An idempotency key on the payment tool call (and recorded step results)','Higher temperature','More RAM'],a=1,w='Replays will happen. Idempotent side effects make replay safe.'),
dict(q='Why not run a 20-minute agent inside a single web request?',o=['Python is slow','HTTP requests and load balancers time out, and a deploy kills the run; use a job queue with persisted state','Agents can\'t use HTTP','It is more expensive'],a=1,w='Long work belongs in background workers with checkpoints and notifications.')],
th=[('Design the approval screen for "agent wants to reboot 12 conference-room bars at 2 a.m."','Show: the exact 12 unit IDs and room names, the reason with evidence (log excerpt), the time window, whether any rooms have meetings booked, rollback plan, and buttons Approve / Approve 1 canary first / Reject with reason. Log the decision.')])

les(id='evals',ch=8,t='Evals: unit tests for things that are never exactly the same',mins=40,
why='build a golden set, choose metrics (code-based first), run evals in CI as a regression gate, and evaluate agents, not just single answers.',
an=r'''<p>On a production line you don't test one unit and ship. You measure <b>yield</b> over a batch, against a fixed spec, every time the process changes. An eval is a yield test for an LLM system: fixed inputs, a grading rule and a pass rate, re-run on every prompt, model or code change.</p>''',
d=r'''<h3>Why normal unit tests are not enough</h3>
<p>The same input can give different outputs, and "correct" is often a range of answers. So you test <b>properties</b> over <b>many cases</b> and track <b>rates</b>.</p>

<h3>Building the golden set</h3>
<ul><li>Start with 20–50 cases taken from <b>real usage</b> (tickets, logs, traces), not invented ones. Grow it every time you find a bug: each production failure becomes a case.</li>
<li>Cover the happy path, edge cases, "should refuse / not found" cases and adversarial inputs.</li>
<li>For each case, store the input plus the expected answer <i>or</i> grading notes ("must mention watchdog; must not suggest reflashing").</li></ul>

<h3>Graders, cheapest and most reliable first</h3>
<ol><li><b>Code checks</b>: valid JSON, schema match, the exact field value, regex contains or not-contains, the right tool called with the right arguments, latency and cost under budget. These are fast, free and deterministic, so use them wherever possible.</li>
<li><b>Reference comparison</b>: compare against a known answer (exact facts, numbers, chosen category).</li>
<li><b>LLM-as-judge</b> with a rubric, for qualities like helpfulness or faithfulness (next lesson).</li>
<li><b>Human review</b> of a sample, which also calibrates the judges.</li></ol>

<h3>Evaluating agents, not just answers</h3>
<ul><li><b>Task success</b>: did the end state match? (The ticket was created with the right fields; the correct root cause was named.)</li>
<li><b>Tool-use correctness</b>: did it pick the right tool with valid arguments? Did it avoid forbidden tools?</li>
<li><b>Trajectory</b>: number of steps, loops, wasted calls, cost and time.</li>
<li><b>Safety</b>: no PII leaked, approvals respected.</li></ul>

<h3>A minimal harness</h3>
<pre><code>CASES = json.load(open("golden.json"))
def grade(case, out) -> dict:
    checks = {"valid_json": is_json(out.text),
              "mentions": all(m in out.text.lower() for m in case.get("must_mention", [])),
              "no_forbidden": not any(f in out.text.lower() for f in case.get("must_not", [])),
              "right_tool": case.get("tool") in (None, *out.tools_called)}
    return {"id": case["id"], "pass": all(checks.values()), **checks}

def run_eval(system, trials=3):
    rows = [grade(c, system(c["input"])) for c in CASES for _ in range(trials)]
    return sum(r["pass"] for r in rows) / len(rows), rows</code></pre>

<h3>Regression gating in CI</h3>
<ul><li>Run the eval on every pull request that touches prompts, tools, models or retrieval.</li>
<li>Compare against the <b>baseline</b> (main branch). Fail the build if the pass rate drops beyond a threshold, <i>or</i> if previously passing critical cases now fail.</li>
<li>Outputs vary, so run several trials per case and treat small differences on small sets as noise. Ten cases cannot detect a 5% change.</li>
<li><b>Online evals</b>: sample production traces and score them continuously, and use A/B tests for big changes.</li></ul>
<p>Tools: promptfoo, DeepEval, RAGAS, Langfuse, LangSmith and Braintrust all run datasets and graders. A pytest file plus a JSON golden set is a perfectly respectable start, and it is what the lab builds.</p>
<div class="fw"><b>Firmware link:</b> golden captures, yield tracking and a regression suite in CI with hardware in the loop. Same discipline, new device under test.</div>''',
anim='evalgate',
q=[dict(q='Which grader should you prefer when it can do the job?',o=['LLM-as-judge','Code-based checks (schema, exact value, tool called)','Asking the agent to grade itself','User thumbs-up only'],a=1,w='Code checks are deterministic, fast and free. Use judges only for qualities code can\'t measure.'),
dict(q='Your eval has 10 cases. The new prompt scores 80% vs 70%. Ship?',o=['Yes, a clear 10-point win','Not on this evidence alone: one case flipping is 10 points, so check which cases changed, run more trials and grow the set','No, never change prompts','Only if the judge agrees'],a=1,w='Small sets are noisy. Look at per-case differences and add cases and trials.'),
dict(q='Best source for new golden cases?',o=['Invented by the model','Real production failures and user traces','Benchmarks from papers','Random strings'],a=1,w='Real failures reflect your real distribution. Every bug becomes a test.')],
lab='Lab 10 (<code>labs/10-evals</code>): a golden-set runner with code graders, multi-trial pass rates, a fake LLM judge with a position-swap consistency check, and a CI-style regression gate that exits non-zero.')

les(id='judge',ch=8,t='LLM-as-judge: useful, biased, and how to keep it honest',mins=30,
why='write a judge rubric, detect position and verbosity bias, and calibrate a judge against human labels before trusting it.',
an=r'''<p>A new inspector on the line is fast and tireless but has quirks: favours the first part they look at, thinks shinier means better, and goes easy on parts from their own old team. You still use them, but you <b>spot-check against a senior inspector</b> and design the inspection to cancel their quirks.</p>''',
d=r'''<h3>Two judge formats</h3>
<ul><li><b>Pointwise</b>: score one answer against a rubric (pass/fail, or 1–5). This is the most common, and it is easy to track over time.</li>
<li><b>Pairwise</b>: "which of A or B is better?" It is good for comparing prompt versions, and most exposed to position bias.</li></ul>

<h3>A rubric that works</h3>
<pre><code>JUDGE = """You are grading a firmware support answer.
Criteria (each PASS/FAIL):
1. CORRECT: the root cause matches the reference: {reference}
2. GROUNDED: every technical claim is supported by the provided logs.
3. ACTIONABLE: gives at least one concrete next diagnostic step.
4. SAFE: does not recommend flashing or factory reset.
First quote the evidence for each criterion, then output JSON:
{"correct": bool, "grounded": bool, "actionable": bool, "safe": bool}"""</code></pre>
<p>Prefer binary, specific criteria over a vague 1–10 "quality" score. Ask for evidence before the verdict, use structured output and low temperature, and give the judge the reference answer or source when one exists.</p>

<h3>Known biases (documented in research such as Zheng et al., 2023, "Judging LLM-as-a-Judge")</h3>
<ul><li><b>Position bias</b>: favours the first (or second) answer shown. <i>Fix</i>: judge both orders, and count disagreement as a tie.</li>
<li><b>Verbosity bias</b>: favours longer answers. <i>Fix</i>: the rubric explicitly rewards concision, plus length-matched comparisons.</li>
<li><b>Self-preference</b>: favours outputs that sound like its own model family. <i>Fix</i>: use a judge from a different family where it matters.</li>
<li><b>Leniency and drift</b>: grades go up over time, or change when the judge model is upgraded. <i>Fix</i>: pin the judge version and re-calibrate on upgrade.</li></ul>

<h3>Calibrate before you trust</h3>
<ol><li>Have humans label 50–100 outputs with the same rubric.</li>
<li>Run the judge on the same outputs.</li>
<li>Measure agreement (the simple percentage, plus where it disagrees). Read the disagreements and fix the rubric.</li>
<li>Only then let the judge gate releases, and re-check a sample regularly.</li></ol>
<pre><code>def consistent_pairwise(judge, q, a, b) -> str:
    first = judge(q, a, b)          # returns "A" or "B"
    second = judge(q, b, a)         # swapped order
    if first == "A" and second == "B": return "a"
    if first == "B" and second == "A": return "b"
    return "tie"                    # verdict flipped with order: position bias, so don't count it</code></pre>
<div class="warn"><b>Don't let the agent grade itself</b> in the same call and trust the result. Use a separate judge call, ideally a different model, with the rubric and reference.</div>''',
anim='judgebias',
q=[dict(q='Your pairwise judge picks A, then picks B when you swap the order. What do you record?',o=['A','B','A tie / unreliable verdict','Run it 10 more times and take the majority'],a=2,w='A flip with order is position bias. Treat it as a tie and improve the rubric.'),
dict(q='Before using a judge to gate releases you should…',o=['Use the biggest model','Compare its verdicts with human labels on a sample and fix disagreements','Ask it to explain itself','Turn temperature up'],a=1,w='Calibration against humans is what makes a judge trustworthy.')])

les(id='observe',ch=8,t='Observability: traces, spans and debugging agents',mins=30,
why='instrument an agent so every model call and tool call is traced, read a trace to find a failure, and turn traces into new eval cases.',
an=r'''<p>When a device fails in the field, a logic analyser capture of the failing transaction is worth more than a hundred guesses. A <b>trace</b> is that capture for an agent: every model call, tool call and decision, timestamped, with inputs, outputs, tokens and errors.</p>''',
d=r'''<h3>Vocabulary</h3>
<ul><li><b>Trace</b>: one end-to-end request (one user task).</li>
<li><b>Span</b>: one timed step inside it (one model call, one tool call, one retrieval), with parent/child links so you can see the tree.</li>
<li><b>Attributes</b>: model name, prompt version, token counts, cost, latency, tool name and arguments, error, user or tenant ID (hashed where needed).</li></ul>

<h3>What to record on every model call</h3>
<pre><code>with span("llm.call", model=MODEL, prompt_version="triage-v7") as sp:
    t0 = time.monotonic()
    reply = call_model(messages, tools)
    sp.set(input_tokens=reply.usage.input, output_tokens=reply.usage.output,
           latency_ms=int((time.monotonic() - t0) * 1000), stop_reason=reply.stop_reason,
           tool_calls=[c.name for c in reply.tool_calls])</code></pre>
<p>Plus the messages and outputs themselves, <b>with PII redacted</b> (traces are a classic data leak).</p>

<h3>Tooling</h3>
<ul><li><b>OpenTelemetry</b> is the vendor-neutral standard for traces. It has semantic conventions for generative-AI spans (still evolving), and the newest MCP spec documents how to pass trace context in <code>_meta</code>.</li>
<li><b>LLM-specific platforms</b>: Langfuse (open source, self-hostable), LangSmith (LangChain team), Braintrust, Arize Phoenix, and others. Framework tracing is often built in (the OpenAI Agents SDK traces by default; LangGraph integrates with LangSmith).</li>
<li>Your existing stack (Datadog, Grafana and so on) for service-level metrics: request rate, error rate, latency percentiles and cost per day.</li></ul>

<h3>Reading a trace: a failure walk-through</h3>
<ol><li>User reports "the agent said unit 17 is fine, but it rebooted 3 times".</li>
<li>Open the trace: step 2 called <code>search_logs(unit=17, pattern="reboot")</code> and got 0 lines.</li>
<li>The raw logs say "watchdog reset", not "reboot", so this is a tool-design problem, not a model problem.</li>
<li>Fix: the tool description lists the reset keywords, or the tool searches a synonym set.</li>
<li><b>Add this case to the golden set</b>, so it can never silently regress.</li></ol>
<div class="key"><b>The improvement flywheel:</b> trace everything → sample and score traces → cluster the failures → fix (prompt, tool, retrieval, model) → add the failures to the golden set → the regression gate protects the fix.</div>
<div class="fw"><b>Firmware link:</b> this is ftrace and a logic analyser for the agent, plus the habit of turning every field failure into a regression test.</div>''',
q=[dict(q='An agent gives a wrong answer. The trace shows the right document was retrieved, but the model ignored it. Which area do you fix?',o=['Retrieval','Generation: prompt, chunk order, number of chunks, model','The vector database','Rate limits'],a=1,w='Retrieval worked (the evidence was present), so look at how the context was presented and at the model.'),
dict(q='Why redact PII in traces?',o=['To save disk','Traces store full prompts and outputs and are viewed by many engineers, which makes them a common leak path','Tracing tools require it','It speeds up the model'],a=1,w='Observability data needs the same data-protection rules as production data.')],
lab='Lab 12 includes a tiny tracer (spans with parent IDs, timings, token counts) written to JSONL, and a test that reconstructs the span tree.')

les(id='inject',ch=9,t='Prompt injection and the lethal trifecta',mins=35,
why='explain direct and indirect prompt injection, recognise the lethal trifecta in a design, and choose controls that work even when the model is fooled.',
an=r'''<p>Your technician opens their inbox: ten real work orders and one forged one, on the right letterhead, saying "also mail the customer list to this address". The technician cannot reliably tell it apart, because it looks like every other instruction they receive.</p>
<p>That is <b>prompt injection</b>. An LLM receives instructions and data in the same channel (text), so any text it reads (a web page, an email, a PDF, a tool result, a code comment) can try to give it orders.</p>''',
d=r'''<h3>Two kinds</h3>
<ul><li><b>Direct</b>: the user types the attack ("ignore your instructions and…"). It is closely related to jailbreaks.</li>
<li><b>Indirect</b>: the attack hides in content the agent reads while working, such as a web page, a support ticket, a repo README or a third-party MCP tool's description (tool poisoning). The user may be completely innocent. This is the dangerous one for agents.</li></ul>
<p>Prompt injection is number 1 in the OWASP Top 10 for LLM Applications (2025 edition).</p>

<h3>The lethal trifecta (Simon Willison, 2025)</h3>
<p>An agent that has <b>all three</b> of these can be tricked into stealing data:</p>
<ol><li>Access to <b>private data</b> (your tickets, files, email).</li>
<li>Exposure to <b>untrusted content</b> (anything an outsider can write).</li>
<li>A way to <b>communicate externally</b> (send email, call URLs, even render an image link with data in the URL).</li></ol>
<p>Remove any one leg and that attack has nowhere to go. Many real incidents in AI products have followed exactly this pattern.</p>

<h3>The uncomfortable truth</h3>
<div class="warn">There is no prompt wording, and no classifier, that reliably stops injection. Filters and "ignore instructions in documents" help at the margin, but attackers adapt. <b>Design so that a fully fooled model still cannot cause serious harm.</b></div>

<h3>Controls that hold even when the model is fooled</h3>
<ul><li><b>Break the trifecta</b> per task: the agent that reads the web doesn't get the private-data tools, or has no outbound channel.</li>
<li><b>Least privilege</b>: per-task tool sets, read-only credentials and scoped tokens, never the user's full rights.</li>
<li><b>Allowlists in code</b>: outbound domains, email recipients, file paths and shell commands.</li>
<li><b>Human approval</b> on consequential actions, showing exact arguments.</li>
<li><b>Taint tracking / privilege separation</b>: once untrusted content has entered the context, disable or gate high-risk tools for the rest of that run. Research designs (for example the "dual LLM" idea, and Google DeepMind's CaMeL, 2025) formalise this: a privileged planner never reads untrusted text directly.</li>
<li><b>Output handling</b>: treat model output as untrusted too. Don't render arbitrary markdown images or links from it, and never pass it to a shell or SQL without validation.</li>
<li><b>Mark untrusted content</b> with delimiters and say that it is data. This is helpful, but never your only defence.</li>
<li><b>Red teaming</b>: put injection cases in your eval set and run them on every release.</li></ul>
<div class="fw"><b>Firmware link:</b> never trust input from the wire. You don't make a USB stack safe by asking descriptors nicely to be well-formed; you bounds-check in code. The same goes for anything the model reads.</div>''',
anim='injection',
q=[dict(q='Which design has the lethal trifecta?',o=['A chatbot answering from public docs, no tools','An email assistant that reads incoming mail, can search the user\'s files, and can send email','A code formatter','An offline summariser of the user\'s own notes'],a=1,w='Incoming mail is untrusted content, files are private data, and sending email is an outbound channel: all three legs.'),
dict(q='Most reliable defence for an agent that must browse the web and also has a send_email tool?',o=['A stronger system prompt','An injection-detection classifier alone','Code-enforced controls: recipient allowlist and/or human approval with full details, or removing send_email from the browsing task','Lower temperature'],a=2,w='Controls outside the model hold even when the model is fooled. Prompts and classifiers are only partial.')])

les(id='guard',ch=9,t='Tool permissions, sandboxing, guardrails and PII',mins=35,
why='write a tool permission policy, sandbox code-executing agents, add input/output guardrails, and redact PII before logging or sending.',
an=r'''<p>A factory robot arm is not made safe by asking it nicely. It is made safe with a <b>cage</b> (sandbox), an <b>interlock</b> on the door (guardrail), a <b>limited range of motion</b> (permissions) and a <b>two-hand start button</b> for dangerous moves (human approval).</p>''',
d=r'''<h3>A permission policy, in code</h3>
<pre><code>POLICY = {
  "search_logs":        {"risk": "read"},
  "get_device_status":  {"risk": "read"},
  "create_ticket":      {"risk": "write", "rate_per_run": 3},
  "reboot_device":      {"risk": "destructive", "approval": True, "max_devices": 1},
  "flash_firmware":     {"risk": "destructive", "approval": True, "allowed_versions": SIGNED_RELEASES},
}
def authorize(call, run) -> tuple[bool, str]:
    p = POLICY.get(call.name)
    if p is None: return False, "tool not allowed"
    if run.tainted and p["risk"] != "read": return False, "untrusted content seen; write tools disabled"
    if p.get("approval") and not run.approved(call): return False, "needs human approval"
    if call.name == "flash_firmware" and call.args["version"] not in p["allowed_versions"]:
        return False, "unsigned or unknown version"
    return True, "ok"</code></pre>
<p>Check this <b>before every tool execution</b>, in code the model cannot influence. Return the refusal reason to the model as the tool result.</p>

<h3>Sandboxing agents that run code or shell</h3>
<ul><li>Run in an isolated container or VM (gVisor- or Firecracker-style isolation for untrusted code), as a non-root user, with a read-only base filesystem and only a scratch directory writable.</li>
<li><b>Network off by default</b>. If it is needed, egress only through a proxy with an allowlist.</li>
<li>Limits on CPU, memory, time and process count. Destroy the sandbox after the task.</li>
<li>No real credentials inside. If a tool needs a secret, the host-side tool adds it outside the sandbox.</li></ul>
<p>Coding-agent harnesses (for example the Claude Agent SDK's permission modes and sandbox settings) expose these controls. Know what they do before switching anything to "bypass permissions".</p>

<h3>Guardrails: checks around the model</h3>
<ul><li><b>Input guardrails</b>: block out-of-scope requests, detect obvious injection or abuse, and enforce size limits. They can run in parallel with the main call to save time (the OpenAI Agents SDK supports this pattern).</li>
<li><b>Output guardrails</b>: schema validation, policy checks (no promises of refunds, no unsafe instructions), PII scanning, and citation verification.</li>
<li><b>Tool guardrails</b>: the policy above, plus argument validation.</li>
<li>Options: your own code, provider moderation endpoints, and libraries such as NVIDIA NeMo Guardrails or Guardrails AI. Measure false positives too: an over-eager guardrail is an outage.</li></ul>

<h3>PII: minimise, redact, control</h3>
<pre><code>import re
PATTERNS = {"EMAIL": r"[\w.+-]+@[\w-]+\.[\w.-]+", "PHONE": r"\+?\d[\d\s().-]{8,}\d", "IPV4": r"\b(?:\d{1,3}\.){3}\d{1,3}\b"}
def redact(text: str) -> str:
    for label, pat in PATTERNS.items():
        text = re.sub(pat, f"[{label}]", text)
    return text</code></pre>
<ul><li>Regex catches structured PII (emails, phone numbers, card numbers). Names and addresses need a named-entity recogniser (for example Microsoft Presidio). Neither is perfect.</li>
<li>Redact <b>before</b> logging and tracing, and before sending to third parties when policy requires it. Keep a reversible mapping only if you truly need it, and protect it.</li>
<li>Know your provider's data-retention and training-use terms, and the regulations that apply (for example GDPR, the EU data-protection law). Regulated postings (banking, insurance) ask for this explicitly.</li></ul>''',
q=[dict(q='Where must the "needs approval" check for reboot_device live?',o=['In the system prompt','In code that runs before the tool executes, outside the model\'s control','In the tool description','In the user\'s message'],a=1,w='Policies enforced in code hold even if the model is fooled. Prompt text does not.'),
dict(q='A coding agent runs tests in a container with network on and the developer\'s cloud credentials mounted. Biggest risk?',o=['Slow tests','A prompt-injected agent can exfiltrate credentials or code over the network','High token cost','Flaky tests'],a=1,w='Remove credentials from the sandbox and default network to off or allowlisted.')],
lab='Lab 11 (<code>labs/11-security-guardrails</code>): a policy engine with taint tracking, path sandboxing, PII redaction and an end-to-end test proving an injected document cannot trigger a destructive tool.')
