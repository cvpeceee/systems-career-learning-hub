from common import S, V
V = [
V('a07-rag', 'Agentic AI · 7', 'RAG: answers grounded in your own documents', [
S('title', items=['The pipeline', 'Hybrid search and reranking', 'Citations and measurement'], say=[
  "This video covers the most common pattern in production systems: answering from your own documents."]),
S('analogy', 'An open-book exam', items=[
  'Without RAG: the model answers from memory',
  'With RAG: first find the right pages, then answer from them',
  'And cite the page for every claim'], say=[
  "Think of an exam.",
  "Without retrieval, the model answers from memory, which may be outdated, or may never have contained your internal documents at all.",
  "With retrieval augmented generation, or RAG, your code first finds the most relevant passages in your own documents, and puts them in the prompt. It becomes an open book exam.",
  "And you require a citation for every claim, so anyone can check the page."]),
S('flow', 'The RAG pipeline', items=['Split documents into chunks', 'Index them twice: keywords and vectors', 'Retrieve candidates with both', 'Merge the two lists', 'Rerank the shortlist', 'Answer with citations, then verify'],
  subs=['with some overlap', 'BM25 + embeddings', 'top 10 from each', 'reciprocal rank fusion', 'a slower, sharper model', 'no citation, no answer'], say=[
  "Here is the full pipeline, which you build in lab six.",
  "Split documents into chunks, short passages with a little overlap so no fact is cut in half.",
  "Index every chunk twice: once for keyword search, once as embedding vectors.",
  "For each question, retrieve candidates with both methods.",
  "Merge the two ranked lists. A simple, robust way is reciprocal rank fusion, which scores each chunk by its positions in the lists, not by raw scores.",
  "Rerank the shortlist with a slower model that reads the question and each passage together.",
  "Finally, the model answers using only those passages, citing them, and your code checks that every citation points to a real passage. If not, the answer becomes: I don't know."]),
S('bullets', 'Measure retrieval, separately from answers', items=[
  'Build a set of real questions with known right documents',
  'recall@k: did the right document make the top k?',
  'MRR: how close to the top was it?',
  'Change one thing, re-measure'], say=[
  "How do you know any of this works? You measure.",
  "Build a set of real questions where you know which document holds the answer.",
  "Recall at k asks: did the right document make the top k results?",
  "M R R, mean reciprocal rank, asks how close to the top it was.",
  "Then change one thing at a time, such as chunk size or adding the reranker, and measure again. In the lab's small example, hybrid search lifts recall at 3 from 0.75 to 1.0."]),
S('recap', 'Recap', items=['RAG = find the right passages, then answer from them', 'Hybrid search: keywords + vectors, merged', 'Rerank, cite, verify citations', 'Measure recall@k and MRR'], say=[
  "Recap.",
  "RAG means finding the right passages first, then answering only from them.",
  "Hybrid search combines keywords and vectors.",
  "Rerank, cite, and verify the citations in code.",
  "And measure retrieval with recall at k and M R R."]),
]),
V('a08-mcp', 'Agentic AI · 8', 'MCP: one standard plug for AI tools', [
S('title', items=['Why a standard', 'Hosts, clients, servers', 'What a server offers'], say=[
  "This video explains a new standard for plugging tools into chat apps, and why so many job postings mention it."]),
S('analogy', 'USB for AI tools', items=[
  'Before USB: a different port and driver for every device',
  'MCP: build a tool server once, any MCP host can use it',
  'Open protocol, official SDKs in Python, TypeScript and more'], say=[
  "Think back to computers before USB.",
  "Every device needed its own port and its own driver.",
  "MCP, the Model Context Protocol, does for AI tools what USB did for devices. You build a tool server once, and any application that speaks MCP can plug it in: desktop chat apps, code editors, and your own agents.",
  "It is an open protocol with official libraries in Python, TypeScript and other languages."]),
S('seq', 'What happens when a host connects', lanes=['Host app + model', 'MCP client', 'MCP server'], msgs=[(1, 2, 'start server (stdio) or connect (HTTP)'), (1, 2, 'list tools'), (2, 1, 'names, descriptions, schemas'), (0, 1, 'model requests get_firmware(D1)'), (1, 2, 'call tool'), (2, 1, 'result (or is_error)')], say=[
  "Here is a connection, step by step.",
  "The host starts the server as a local process and talks over standard input and output, or connects to a remote server over HTTP.",
  "The client asks: which tools do you have?",
  "The server answers with names, descriptions and argument schemas, exactly what tool calling needs.",
  "Later, the model requests a tool, just like in the tool calling video.",
  "The client forwards the call to the server.",
  "And the server returns the result, or an error flag the model can read."]),
S('bullets', 'What an MCP server can offer, and one warning', items=[
  'Tools: actions the model can call',
  'Resources: read-only data with an address',
  'Prompts: reusable templates a user picks',
  'Only connect servers you trust: descriptions reach the model'], say=[
  "An MCP server can offer three kinds of things.",
  "Tools: actions the model may call, possibly with side effects.",
  "Resources: read-only data with an address, like fleet colon slash slash devices slash D1.",
  "Prompts: reusable templates a user can pick.",
  "And one warning. A server's tool descriptions go straight into the model's context, so a malicious server can plant instructions there. Only connect servers you trust, and review what they expose."]),
S('code', 'A server with the official Python SDK, version 2', code='''from mcp.server import MCPServer        # v1 called this FastMCP

mcp = MCPServer("fleet-tools")

@mcp.tool()
def get_firmware(device_id: str) -> Firmware:
    """Return installed and latest firmware for one device."""
    ...

if __name__ == "__main__":
    mcp.run()                            # stdio by default''', hl=[[0], [2], [4, 5], [6], [9, 10]], say=[
  "Here is a real server with the official Python library, version two. Most tutorials online still show version one, where the class was called Fast M C P.",
  "Create the server and give it a name.",
  "A decorator registers a normal Python function as a tool. The type hints become the argument schema.",
  "The docstring becomes the description the model reads.",
  "And run starts it on standard input and output. Lab seven tests this server both in the same process and as a real subprocess."]),
S('recap', 'Recap', items=['MCP = a standard plug between AI apps and tools', 'Host and client connect; the server offers capabilities', 'Tools, resources, prompts', 'Trust and review every server'], say=[
  "Recap.",
  "MCP is a standard plug between AI applications and tools.",
  "The host's client connects, and the server offers its capabilities.",
  "Those are tools, resources and prompts.",
  "And treat every server as code you are choosing to trust."]),
]),
V('a09-human-approval', 'Agentic AI · 9', 'Human approval and resume with LangGraph', [
S('title', items=['Agents as graphs', 'Pause for a person', 'Resume, even after a restart'], say=[
  "This video shows how a long-running job pauses for a human decision and picks up exactly where it stopped."]),
S('flow', 'The rollout agent as a graph', items=['plan: turn the request into a structured plan', 'route: one device, or many?', 'approve: pause and ask a human', 'execute: flash, or do nothing if rejected'],
  subs=['model call', 'plain code', 'interrupt()', 'side effects here'], say=[
  "LangGraph describes an agent as a graph, which is a state machine you draw in code. Here is our rollout agent.",
  "The plan step asks a model to turn the request into a structured plan: version and device list.",
  "A routing step, which is plain code, checks how many devices are affected.",
  "If more than one, the approve step pauses and asks a human.",
  "The execute step flashes the devices, or does nothing if the human rejected the plan."]),
S('seq', 'Pause, wait, resume', lanes=['Your app', 'Graph', 'Checkpoint store', 'Human'], msgs=[(0, 1, 'invoke(request, thread_id)'), (1, 2, 'save state after each step'), (1, 0, 'paused: here is the plan'), (0, 3, 'show plan, wait (hours?)'), (3, 0, 'approve / edit / reject'), (0, 1, 'Command(resume=decision)'), (1, 1, 'continue from the checkpoint')], say=[
  "Here is the timeline.",
  "Your app starts the graph with the request and a thread ID, which names this particular run.",
  "After every step, the graph saves its state to a checkpoint store. This is a checkpoint, like a journal in flash that survives a reset.",
  "At the approve step, the graph pauses and hands the plan back to your app.",
  "Your app shows the plan to a person. That could take minutes or days. Nothing is running meanwhile.",
  "The person approves, edits the plan, or rejects it.",
  "Your app resumes the run with that decision, using the same thread ID.",
  "And the graph continues from its last checkpoint, even if the original process restarted in between."]),
S('bullets', 'Two details that bite in production', items=[
  'On resume, the paused step re-runs from its first line',
  'So keep side effects after the pause, or make them repeat-safe',
  'Use a database-backed checkpoint store, not memory',
  'Very long or business-critical flows: a durable workflow engine'], say=[
  "Two details catch people out.",
  "When you resume, the paused step runs again from its first line, not from the middle.",
  "So anything with side effects, like sending a notification, goes after the pause, or must be safe to repeat.",
  "In production, store checkpoints in a database, such as Postgres, not in memory.",
  "And for flows that run for days or must never be lost, teams also use durable workflow engines such as Temporal."]),
S('recap', 'Recap', items=['A graph = a state machine of steps', 'interrupt() pauses; Command(resume=...) continues', 'Checkpoints make pauses survive restarts', 'Paused steps re-run: keep side effects safe'], say=[
  "Recap.",
  "A LangGraph agent is a state machine of steps.",
  "Interrupt pauses for a human, and a resume command continues with their decision.",
  "Checkpoints let a pause survive restarts.",
  "And the paused step re-runs, so keep side effects after the pause. Lab eight tests every one of these paths."]),
]),
V('a10-evals', 'Agentic AI · 10', 'Evals: proving your agent works, every time you change it', [
S('title', items=['Golden sets', 'Graders', 'Gates in CI'], say=[
  "This video is about automated tests for systems whose answers vary from run to run."]),
S('analogy', 'Unit tests, adapted for randomness', items=[
  'A golden set: real inputs with checkable expectations',
  'Outputs vary, so run each case several times',
  'Report pass rates, not single pass/fail'], say=[
  "Evals are unit tests, adapted for software that is a little random.",
  "You keep a golden set: real inputs, each with something checkable. For example, must mention version 2.1.4, and must call the knowledge base search tool.",
  "Because outputs vary from run to run, you run each case several times.",
  "And you report pass rates instead of one pass or fail, the way you would burn in hardware over many cycles."]),
S('bullets', 'Three kinds of grader, cheapest first', items=[
  'Code checks: contains, called tool X, did NOT call tool Y, length',
  'LLM judge with a rubric, for things code cannot check',
  'Humans, to calibrate the judge and review edge cases',
  'Judges are biased: swap answer order, check agreement'], say=[
  "There are three kinds of grader. Use the cheapest one that works.",
  "Code checks: does the answer contain this phrase, did the agent call this tool, did it avoid calling the dangerous one, is it short enough. Fast, free and exact.",
  "An LLM judge, which is a model scoring answers against a written rubric, for qualities like helpfulness that code cannot check.",
  "And humans, to check that the judge agrees with people, and to review edge cases.",
  "LLM judges have known biases, for example favouring whichever answer is shown first. So ask twice with the order swapped, and only trust verdicts that agree."]),
S('flow', 'Evals as a release gate', items=['Change a prompt, model or tool', 'CI runs the golden set, several trials each', 'Compare with the last release', 'Block if quality drops or a critical case fails', 'Every production failure becomes a new case'],
  subs=['a pull request', 'minutes, not weeks', 'per case, not just average', 'exit code 1', 'the set keeps growing'], say=[
  "Here is how evals protect a team.",
  "Someone changes a prompt, a model or a tool.",
  "Continuous integration runs the golden set automatically, several trials per case.",
  "The results are compared with the last release, case by case, not only the average.",
  "If quality drops, or any critical case fails even once, the gate fails the build.",
  "And every failure found in production becomes a new case, so the same bug cannot return quietly."]),
S('recap', 'Recap', items=['Golden set + several trials + pass rates', 'Code graders first, LLM judges with care', 'Check judges for position bias', 'Gate releases on per-case results'], say=[
  "Recap.",
  "Evals use a golden set, several trials, and pass rates.",
  "Use code graders first, and LLM judges with care.",
  "Check judges for position bias by swapping the order.",
  "And gate every release on per case results. Lab ten builds the harness and the gate."]),
]),
V('a11-prompt-injection', 'Agentic AI · 11', 'Prompt injection, and defences that hold', [
S('title', items=['What injection is', 'The dangerous combination', 'Defence in code'], say=[
  "This video covers the top security risk when software reads untrusted text and can act on it, and the defences that hold."]),
S('analogy', 'Commands hidden in data', items=[
  'The model reads instructions and data as one stream of text',
  'Injected text in a page, email or ticket can steer it',
  'No prompt reliably stops this'], say=[
  "Remember from the start of the course: a model just continues text.",
  "It reads your instructions and the documents it fetched as one stream of text, with no hard boundary between them.",
  "So text planted in a web page, an email or a support ticket can steer it. That is prompt injection, like a malicious command smuggled inside a data packet.",
  "Telling the model to ignore such text helps a little, but no prompt reliably stops it. Security has to live outside the model."]),
S('icons', 'The dangerous combination', items=[('lock', 'Private data', 'customer records, keys'), ('doc', 'Untrusted content', 'web, email, tickets'), ('cloud', 'A way to send data out', 'email, web requests')], say=[
  "Security researcher Simon Willison describes a lethal trifecta.",
  "An agent with access to private data,",
  "that also reads untrusted content,",
  "and can also send data out, can be tricked into leaking that data. Remove any one of the three, and the leak path closes."]),
S('flow', 'Defences, enforced in code', items=['Least privilege: only the tools this task needs', 'Taint: after reading outside content, block risky actions', 'Human approval for anything destructive', 'Sandbox files and network; redact secrets', 'Log every decision for audit'],
  subs=['like an MPU region', 'checked by code, not the model', 'a person clicks yes', 'allow-lists', 'traces'], say=[
  "Here are defences that hold even when the model is fooled.",
  "Least privilege: give each agent only the tools its task needs, like a memory protection region that allows only what a task must touch.",
  "Taint tracking: once outside content enters the conversation, your code blocks writes and destructive actions for that run.",
  "Human approval for anything destructive or irreversible.",
  "Sandbox file and network access with allow lists, and redact personal data and secrets from what is logged or returned.",
  "And log every decision, so you can audit what happened. Lab eleven proves that an injected page cannot trigger a destructive tool."]),
S('recap', 'Recap', items=['Injection = instructions hidden in data', 'Private data + untrusted input + a way out = danger', 'Enforce permissions in code, not prompts', 'Approval, sandboxing, redaction, audit logs'], say=[
  "Recap.",
  "Prompt injection is instructions hidden in data.",
  "Private data, untrusted input and a way to send data out is the dangerous combination.",
  "Enforce permissions in code, not in prompts.",
  "And add human approval, sandboxing, redaction and audit logs."]),
]),
V('a12-production', 'Agentic AI · 12', 'Production: retries, limits, tracing and cost', [
S('title', items=['Surviving errors', 'Seeing inside', 'Controlling cost'], say=[
  "This last core video covers what it takes to run all of this for real users."]),
S('bullets', 'Surviving provider errors', items=[
  'Retry only temporary errors: rate limits, overload, timeouts',
  'Exponential backoff with random jitter; honour Retry-After',
  'Circuit breaker: stop calling a failing provider for a while',
  'Fallback to a second model or provider'], say=[
  "First, the provider will fail sometimes. Plan for it.",
  "Retry only temporary errors, such as rate limits, overload and timeouts. Never retry a bad request or a failed login.",
  "Wait longer after each failure, with some randomness so thousands of clients do not retry at the same instant. If the server says how long to wait, wait exactly that long.",
  "A circuit breaker stops calling a provider that keeps failing, then tries one request after a cool-down, like a fuse that resets.",
  "And a fallback sends the request to a second model or provider when the first is down."]),
S('flow', 'Seeing inside every run', items=['One trace per user request', 'A span for every model call and tool call', 'Record tokens, latency, errors, versions', 'Dashboards and alerts on top'],
  subs=['the whole story', 'nested, like a call stack', 'per span', 'p95 latency, cost per task'], say=[
  "Second, you must be able to see inside every run.",
  "Each user request gets one trace, the full story of that run.",
  "Inside it, every model call and tool call is a span, a timed step with a parent, nested like a call stack.",
  "Each span records tokens, latency, errors, and which prompt and model version ran.",
  "Dashboards and alerts sit on top: slowest requests, cost per task, error rates. OpenTelemetry is the common standard, and tools like LangSmith and Langfuse specialise in agent traces."]),
S('bullets', 'Controlling cost and latency', items=[
  'Measure cost per task, not just per call',
  'Prompt caching for long, repeated prefixes',
  'Route easy requests to smaller, cheaper models',
  'Stream output so users see progress early'], say=[
  "Third, cost and speed.",
  "Measure cost per completed task, because one task can mean many model calls.",
  "Use prompt caching from the provider when many requests share a long identical beginning, such as a big system prompt or document.",
  "Route easy requests to smaller, cheaper models, and save the large ones for hard cases. Prove the switch with your evals.",
  "And stream the output so users see progress within a second or two, even when the full answer takes longer."]),
S('recap', 'Recap', items=['Retry temporary errors with backoff and jitter', 'Breakers and fallbacks for outages', 'Trace every model and tool call', 'Cost per task, caching, routing, streaming'], say=[
  "Recap.",
  "Retry temporary errors, with backoff and jitter.",
  "Use circuit breakers and fallbacks for outages.",
  "Trace every model call and tool call.",
  "And manage cost per task with caching, routing and streaming. Lab twelve builds every one of these pieces, and the capstones put them together."]),
]),
]
