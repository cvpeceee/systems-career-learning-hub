# Chapter 3 (tools and agents) and Chapter 4 (RAG)
L=[]
def les(**k): L.append(k)

les(id='tools',ch=3,t='Tool calling: letting the model ask your code to act',mins=35,
why='define tools with JSON Schema, run the request → execute → return loop with both major APIs, and handle tool errors properly.',
an=r'''<p>The model is a dispatcher on the radio. It cannot touch anything. It can only say "Unit 4, check the pressure gauge at site 17." A <b>technician</b> (your code) does the actual work and radios back the reading.</p>
<p><b>Tool calling</b> (also called function calling) is that radio protocol: the model replies with a structured request to call one of the functions you listed, your code runs it, and you send the result back.</p>''',
d=r'''<h3>The four moves</h3>
<ol><li><b>Describe</b> each tool: name, description and a JSON Schema for its arguments.</li>
<li><b>The model requests</b>: instead of text, it returns <code>name + arguments</code> and the stop reason says "tool use".</li>
<li><b>You execute</b>: validate arguments, check permissions, run the function, catch errors.</li>
<li><b>You return</b> the result as a tool message and call the model again.</li></ol>

<h3>OpenAI Responses API</h3>
<pre><code>tools = [{
  "type": "function", "name": "get_device_status",
  "description": "Get online state and firmware version of one device.",
  "parameters": {"type": "object",
                 "properties": {"device_id": {"type": "integer"}},
                 "required": ["device_id"], "additionalProperties": False},
}]
inputs = [{"role": "user", "content": "Is device 42 online?"}]
resp = client.responses.create(model=MODEL, input=inputs, tools=tools)
for item in resp.output:
    if item.type == "function_call":
        args = json.loads(item.arguments)               # arguments arrive as a JSON string
        result = get_device_status(**args)
        inputs += [item, {"type": "function_call_output", "call_id": item.call_id,
                          "output": json.dumps(result)}]
resp = client.responses.create(model=MODEL, input=inputs, tools=tools)
print(resp.output_text)</code></pre>

<h3>Anthropic Messages API</h3>
<pre><code>tools = [{"name": "get_device_status", "description": "Get online state and firmware version of one device.",
          "input_schema": {"type": "object", "properties": {"device_id": {"type": "integer"}}, "required": ["device_id"]}}]
msgs = [{"role": "user", "content": "Is device 42 online?"}]
r = client.messages.create(model=MODEL, max_tokens=500, tools=tools, messages=msgs)
if r.stop_reason == "tool_use":
    msgs.append({"role": "assistant", "content": r.content})   # keep the model's tool request
    results = [{"type": "tool_result", "tool_use_id": b.id, "content": json.dumps(get_device_status(**b.input))}
               for b in r.content if b.type == "tool_use"]
    msgs.append({"role": "user", "content": results})
    r = client.messages.create(model=MODEL, max_tokens=500, tools=tools, messages=msgs)</code></pre>
<div class="py"><b>Python note:</b> <code>get_device_status(**args)</code> unpacks a dict into keyword arguments, so <code>{"device_id": 42}</code> becomes <code>device_id=42</code>.</div>
<p>The shapes differ slightly, but the protocol is identical. Both can request <b>several tool calls in one reply</b> (parallel calls). Run independent ones concurrently and return every result, matched by its ID.</p>

<h3>Handling failure like an engineer</h3>
<ul>
<li><b>Bad arguments</b>: validate against the schema. On failure, return the error <i>to the model</i> as the tool result ("device_id must be an integer"). Models usually self-correct on the next turn.</li>
<li><b>Tool crashed or timed out</b>: return a short error result (and set the error flag if the API has one). Don't crash the whole agent, and don't hide the error.</li>
<li><b>Huge results</b>: truncate or summarise before returning. A 2 MB log in the context window costs money and buries the signal.</li>
<li><b>Dangerous tools</b> (write, delete, flash, pay, send): require human approval or a policy check in code (Chapter 9).</li>
</ul>
<div class="fw"><b>Firmware link:</b> a tool is an ioctl. Validate every argument from user space, return error codes instead of panicking, and keep the dangerous ioctls behind a capability check.</div>

<h3>Tool design checklist</h3>
<ul><li>Use few, well-named tools with clear boundaries. Ten overlapping tools confuse the model.</li>
<li>Write descriptions that say <i>when</i> to use each tool and what it returns.</li>
<li>Prefer IDs and enums over free text in arguments.</li>
<li>Return compact, structured results, with the next useful ID included.</li>
<li>Make write tools <b>idempotent</b> where possible (pass a request ID), because retries happen.</li></ul>''',
anim='toolcall',
q=[dict(q='The model requests <code>get_device_status({"device_id": "forty-two"})</code>. What should your code do?',o=['Crash','Guess 42','Return a tool result saying device_id must be an integer, and let the model retry','Silently skip the call'],a=2,w='Validation errors go back to the model as the tool result. It sees the error and corrects itself.'),
dict(q='Who executes the tool?',o=['The provider\'s servers','The model','Your application code','The user'],a=2,w='With custom function tools, your code runs them. (Providers also offer some hosted tools, such as web search, that run on their side.)'),
dict(q='The model returned two tool calls in one reply. What must you send back?',o=['Only the first result','Both results, each matched to its call ID','A new user message','Nothing until the user replies'],a=1,w='Every tool request needs a matching result, linked by its ID, or the next API call fails or the model gets confused.')],
lab='Lab 04 (<code>labs/04-tool-calling</code>): build a tool registry that generates JSON Schema from Python type hints, validates arguments, and turns exceptions into tool-error results.')

les(id='loop',ch=3,t='The agent loop, from scratch, with no framework',mins=45,
why='write a complete, safe agent loop in about 60 lines: tools, state, step and cost limits, tracing and a final answer.',
an=r'''<p>Every firmware main loop looks the same: read inputs, decide, act, repeat until told to stop, with a watchdog in case something hangs.</p>
<p>An agent is the same main loop with an LLM doing the "decide" step: <b>call the model → if it requested tools, run them and append the results → call the model again → stop when it gives a final answer or a limit is hit.</b> Everything else is detail.</p>''',
d=r'''<h3>The whole thing</h3>
<pre><code>from dataclasses import dataclass, field

@dataclass
class AgentState:
    messages: list = field(default_factory=list)
    steps: int = 0
    tokens: int = 0
    trace: list = field(default_factory=list)

def run_agent(goal: str, llm, tools: dict, max_steps=8, max_tokens=50_000) -> str:
    s = AgentState(messages=[{"role": "system", "content": SYSTEM},
                             {"role": "user", "content": goal}])
    while True:
        if s.steps >= max_steps:   return "Stopped: step limit reached. Partial findings: ..."
        if s.tokens >= max_tokens: return "Stopped: token budget reached."
        reply = llm(s.messages, tools=[t.schema for t in tools.values()])
        s.steps += 1; s.tokens += reply.usage
        s.messages.append(reply.as_message())
        if not reply.tool_calls:                       # no tool requested: this is the answer
            s.trace.append(("final", reply.text))
            return reply.text
        for call in reply.tool_calls:                  # run every requested tool
            tool = tools.get(call.name)
            try:
                out = tool.run(**call.args) if tool else f"error: unknown tool {call.name}"
            except Exception as e:
                out = f"error: {type(e).__name__}: {e}"
            s.trace.append(("tool", call.name, call.args, str(out)[:200]))
            s.messages.append({"role": "tool", "tool_call_id": call.id, "content": str(out)[:4000]})</code></pre>
<div class="py"><b>Python note:</b> <code>field(default_factory=list)</code> gives each AgentState its own new list. A plain <code>= []</code> default would be shared between instances (the mutable-default gotcha).</div>

<h3>What each line protects you from</h3>
<ul>
<li><b>max_steps</b>: a model that keeps calling tools forever. This is the watchdog.</li>
<li><b>Token or cost budget</b>: a runaway bill. Every step re-sends the history.</li>
<li><b>Unknown tool / exception → error string</b>: one bad call doesn't kill the run, and the model can recover.</li>
<li><b>Truncating results</b>: one huge tool output blowing the context window.</li>
<li><b>trace</b>: the ability to answer "why did it do that?" later (Chapter 8).</li>
</ul>

<h3>Stopping conditions, completely</h3>
<ol><li><b>Natural</b>: the model replies with no tool calls.</li>
<li><b>Hard limits</b>: steps, tokens or cost, and wall-clock time.</li>
<li><b>Explicit</b>: a <code>finish(answer)</code> tool. This is useful when you need the final answer in a structured shape.</li>
<li><b>External</b>: the user cancels, or a human rejects an approval.</li>
<li><b>Loop detection</b>: the same tool with the same arguments three times in a row means stop or nudge.</li></ol>
<p>When a hard limit fires, return what was learned so far plus "stopped because…". Don't return a silent failure.</p>

<h3>Why build it by hand first?</h3>
<p>Every framework (LangGraph, OpenAI Agents SDK and the rest) is this loop with extras: persistence, tracing UI, handoffs. Interviewers regularly ask you to write it on a whiteboard, and when a framework misbehaves you need to know what it is doing underneath.</p>
<div class="fw"><b>Firmware link:</b> <code>while(1){ read(); decide(); act(); kick_watchdog(); }</code>. The LLM is the decide() call, and you still own the watchdog.</div>''',
anim='agentloop',
q=[dict(q='Which line most directly prevents an infinite agent loop?',o=['Truncating tool output','The max_steps check','The system prompt','Catching exceptions'],a=1,w='A hard step limit is the watchdog. Pair it with a token or cost budget and a time limit.'),
dict(q='A tool raises an exception mid-run. Best behaviour?',o=['Crash the agent','Return the error text as the tool result so the model can adapt, and record it in the trace','Retry forever','Hide it and return an empty string'],a=1,w='Errors are information. The model often tries a different approach, and the trace keeps the evidence.'),
dict(q='The step limit is reached. What should the agent return?',o=['Nothing','An exception with no context','The partial findings plus a clear "stopped because step limit" message','A random answer'],a=2,w='Fail loudly but usefully. Partial results with a reason are far better than silence.')],
lab='Lab 05 (<code>labs/05-agent-from-scratch</code>): implement this loop against a scripted fake LLM. Tests check final answers, step limits, unknown-tool handling, exceptions, loop detection and the trace.',
video=None)

les(id='patterns',ch=3,t='Workflows vs agents, and the patterns that matter',mins=35,
why='choose between a fixed workflow and an agent, and name and sketch prompt chaining, routing, parallelisation, orchestrator-workers, evaluator-optimiser, ReAct and plan-and-execute.',
an=r'''<p>An <b>assembly line</b> is fast, cheap and predictable, but it only builds one thing. A <b>craftsman</b> handles anything, but is slower and you cannot predict exactly what they will do.</p>
<p>LLM systems sit on that same spectrum. A workflow is the assembly line: your code decides the path and the LLM fills in steps. An agent is the craftsman: the LLM decides the path. <b>Start as far toward the assembly line as the problem allows.</b></p>''',
d=r'''<p>This lesson follows the vocabulary of Anthropic's widely cited engineering post <i>Building effective agents</i> (December 2024). Interviewers use these names.</p>
<h3>Workflow patterns (your code controls the flow)</h3>
<ul>
<li><b>Prompt chaining</b>: step A's output feeds step B, with code checks between steps. Example: extract errors from the log → classify them → draft the ticket.</li>
<li><b>Routing</b>: a cheap classifier picks the handler. Example: "billing" → billing prompt, "USB" → firmware prompt with log tools. Easy requests can go to a small model.</li>
<li><b>Parallelisation</b>: run independent calls at once and combine them. Example: three reviewers check security, style and correctness in parallel; or run the same check three times and vote.</li>
<li><b>Orchestrator-workers</b>: an LLM splits a task into subtasks it decides at run time, workers do them, and it merges the results. This is the bridge to multi-agent (Chapter 7).</li>
<li><b>Evaluator-optimiser</b>: one call drafts, another critiques against criteria, and you loop until it passes or hits a limit. This is also called reflection.</li>
</ul>

<h3>Agent patterns (the LLM controls the flow)</h3>
<ul>
<li><b>ReAct</b> (Yao et al., 2022): alternate a short thought, an action (tool call) and an observation. Modern tool-calling APIs are essentially ReAct built in. The loop you just wrote <i>is</i> a ReAct agent.</li>
<li><b>Plan-and-execute</b>: first produce an explicit plan (a list of steps), then execute the steps, re-planning when one fails. You get a visible plan a human can approve, fewer expensive "big model" calls (a cheaper model can execute steps), and easier progress tracking.</li>
</ul>
<pre><code>plan = llm_structured(f"Goal: {goal}. Write 3-6 concrete steps.", schema=Plan)
for step in plan.steps:
    result = run_agent(step.description, llm, tools, max_steps=4)   # small ReAct loop per step
    done.append((step, result))
    if "error" in result.lower():
        plan = replan(goal, done)                                     # adjust the remaining steps</code></pre>

<h3>Choosing: the questions to ask</h3>
<div class="tbl"><table><tr><th>Question</th><th>If yes → lean to…</th></tr>
<tr><td>Can I write the steps down in advance?</td><td>Workflow</td></tr>
<tr><td>Do the steps depend on what earlier steps found?</td><td>Agent</td></tr>
<tr><td>Is a wrong action costly or irreversible?</td><td>Workflow, or agent with approvals</td></tr>
<tr><td>Is latency or cost tight?</td><td>Workflow (fewer calls)</td></tr>
<tr><td>Is the input space open-ended (any question about any device)?</td><td>Agent</td></tr></table></div>
<div class="key"><b>Interview line:</b> "I start with the simplest thing: one well-prompted call with retrieval. I add workflow steps when I can see a fixed structure, and I make it an agent only where the path truly depends on intermediate results. Then I measure each step's value with evals."</div>
<div class="fw"><b>Firmware link:</b> a workflow is a fixed state machine. An agent is a state machine whose transition function is an LLM. You would never let the LLM choose transitions on a safety path without guards, and the same applies here.</div>''',
anim='flow',animdata=dict(title='Evaluator-optimiser in action',items=[['Draft','Generator writes a release note from the commit list.'],['Critique','Evaluator checks against criteria: every user-visible change listed, no internal jargon, under 150 words. Result: "missing the USB fix in commit a1b2".'],['Revise','Generator revises using the critique.'],['Re-check','Evaluator passes it, or the loop stops after 3 rounds and flags a human.']]),
q=[dict(q='Support tickets fall into 4 known categories, each with a fixed handling procedure. Best design?',o=['A fully autonomous multi-agent system','Routing: classify, then run the fixed procedure for that category','One giant prompt','Fine-tuning'],a=1,w='Known categories with fixed procedures make routing to workflows cheaper, faster and easier to test.'),
dict(q='Which is a key benefit of plan-and-execute over pure ReAct?',o=['It never needs tools','The plan is explicit, so it can be shown, approved and tracked, and steps can use cheaper models','It always uses fewer tokens','It doesn\'t need stopping conditions'],a=1,w='Making the plan visible helps humans, monitoring and cost. It still needs limits and re-planning.')],
th=[('Your manager asks for "an agent that writes the weekly firmware status report from Jira and Git". Workflow or agent? Sketch it.','Mostly a workflow: (1) code fetches the week\'s tickets and merged commits, (2) one LLM call groups them by area, (3) one call drafts the report in a fixed template, (4) an evaluator call checks every ticket is mentioned. No open-ended tool choice is needed.')])

les(id='memory',ch=3,t='State, memory and context management',mins=35,
why='design short-term and long-term memory, keep long conversations within the context window, and pass state cleanly between steps.',
an=r'''<p>A technician on a long job keeps a <b>notepad</b> for today: what they tried and what they saw. That is short-term memory. The company keeps a <b>service history database</b> for every unit: last year's repairs and the customer's preferences. That is long-term memory, and someone must decide what is worth writing into it and look it up next time.</p>''',
d=r'''<h3>Three kinds of "memory", and where each lives</h3>
<div class="tbl"><table><tr><th>Kind</th><th>Where it lives</th><th>Example</th></tr>
<tr><td><b>Agent state</b></td><td>Your program's variables / a checkpoint store</td><td>Step count, current plan, IDs found so far, approval status</td></tr>
<tr><td><b>Short-term memory</b></td><td>The message list sent to the model</td><td>This conversation's turns and tool results</td></tr>
<tr><td><b>Long-term memory</b></td><td>A database (rows, documents or vectors)</td><td>"User prefers logs in UTC", "unit 17 had a PHY fix in March"</td></tr></table></div>
<p>The model itself remembers nothing between calls. All memory is your code choosing what to put in the next prompt.</p>

<h3>Keeping short-term memory inside the window</h3>
<ol>
<li><b>Sliding window</b>: keep the system prompt and the last N turns. It is simple, but it forgets early facts.</li>
<li><b>Summarise (compaction)</b>: when history passes a threshold, replace the old turns with a model-written summary of decisions, facts and open questions. Keep the recent turns verbatim.</li>
<li><b>Clear old tool results</b>: a 3,000-line log from step 2 rarely matters at step 9. Keep a one-line note ("searched unit 17 logs: 3 watchdog hits at 23:12").</li>
<li><b>Notes / scratchpad file</b>: let the agent write key findings to a notes tool and re-read them. Long-running coding agents use this.</li>
</ol>
<pre><code>def compact(messages, llm, keep_last=6, limit_tokens=30_000):
    if count_tokens(messages) < limit_tokens: return messages
    system, old, recent = messages[0], messages[1:-keep_last], messages[-keep_last:]
    summary = llm([{"role": "user", "content":
        "Summarise for continuing this task: decisions made, facts found (with IDs), open questions.\n"
        + render(old)}]).text
    return [system, {"role": "user", "content": f"[Summary of earlier work]\n{summary}"}] + recent</code></pre>
<p>Careful: never cut between a tool request and its result. APIs reject orphaned tool results.</p>

<h3>Long-term memory, done responsibly</h3>
<ul>
<li><b>Write path</b>: after a session, extract durable facts as structured records (subject, fact, source, date). Don't dump whole transcripts.</li>
<li><b>Read path</b>: at the start of a task, retrieve relevant memories (by user, device ID, or semantic search) and inject a short "Known facts" block.</li>
<li><b>Hygiene</b>: memories go stale and can be wrong. Store their source and date, let users view and delete them, and never store secrets or unnecessary PII.</li>
<li><b>Security</b>: a memory written from untrusted content can carry an injected instruction into future sessions. Treat memory as untrusted input too.</li>
</ul>
<div class="fw"><b>Firmware link:</b> registers (context window) versus flash (database). Writing to flash is deliberate, wears out (gets stale), and needs a format plus a version.</div>

<h3>State between steps: make it explicit</h3>
<p>Keep a typed state object (dataclass or Pydantic) with the plan, discovered IDs, counters and flags, instead of hoping the model re-reads it from chat history. Frameworks like LangGraph formalise exactly this, with a typed state that every node reads and updates and that gets checkpointed.</p>''',
q=[dict(q='A user told your agent in turn 2 to "always use UTC", and by turn 40 it forgets. Best fix?',o=['Bigger model','Keep durable instructions in state or long-term memory and inject them each call, or include them in the compaction summary','Raise temperature','Restart the chat'],a=1,w='Durable preferences shouldn\'t depend on old turns surviving trimming. Store them and inject them explicitly.'),
dict(q='Why is "store every full transcript and retrieve it later" a poor long-term memory design?',o=['It is illegal','It retrieves noisy, stale, possibly injected text and wastes tokens; extracted, dated facts work better','Transcripts can\'t be embedded','It is too fast'],a=1,w='Curated facts with sources and dates are smaller, clearer and auditable.')],
lab='Lab 05 also includes <code>trim_history()</code> and <code>compact()</code> exercises that must never split a tool call from its result.')

les(id='rag1',ch=4,t='RAG part 1: ingest, chunk, embed, store',mins=40,
why='build the offline half of a RAG system: load documents, chunk them sensibly, embed them and index them with metadata.',
an=r'''<p>An open-book exam has two skills: <b>finding the right pages fast</b>, then <b>writing an answer from them</b>. RAG (retrieval-augmented generation) is exactly that: search your documents first, paste the best passages into the prompt, and ask the model to answer only from them.</p>
<p>This lesson is the library work done before the exam: cutting the books into findable passages and building the index.</p>''',
d=r'''<h3>Why RAG exists</h3>
<ul><li>The model doesn't know your private docs, recent changes or exact specs.</li>
<li>Putting <i>all</i> docs in every prompt is too expensive and hurts quality (remember "lost in the middle").</li>
<li>RAG keeps knowledge <b>current</b> (re-index, don't retrain) and <b>checkable</b> (citations).</li></ul>

<h3>The ingestion pipeline</h3>
<ol>
<li><b>Load and clean</b>: PDFs, wiki and HTML pages, tickets, code. Strip navigation junk, keep headings and tables. Messy extraction is the most common silent RAG failure, so look at what you extracted.</li>
<li><b>Attach metadata</b>: source URL, title, section, product, version, date and access rights. You will filter on these later.</li>
<li><b>Chunk</b>: split into passages.</li>
<li><b>Embed</b> each chunk.</li>
<li><b>Index</b>: write vector, text and metadata to a vector database, plus a keyword index for hybrid search.</li>
</ol>

<h3>Chunking: the decision that matters most</h3>
<ul>
<li><b>Size</b>: commonly a few hundred tokens (for example 200–800). Small chunks match precisely but lose context. Big ones keep context but blur the match and cost tokens. Tune it with retrieval evals (part 3).</li>
<li><b>Boundaries</b>: split on structure first (headings, sections, functions in code), then paragraphs, then sentences. Never cut mid-sentence if you can help it.</li>
<li><b>Overlap</b>: repeat a little (for example 10–20%) between neighbours so facts on a boundary survive.</li>
<li><b>Context headers</b>: prepend the document title and section path to each chunk ("USB Guide › Enumeration › Errors"). Chunks often don't make sense alone, and this cheap trick helps both embedding and answering.</li>
</ul>
<pre><code>def chunk(text: str, size=800, overlap=120) -> list[str]:
    """Greedy paragraph packing with character overlap (a simple, solid baseline)."""
    paras, chunks, cur = [p.strip() for p in text.split("\n\n") if p.strip()], [], ""
    for p in paras:
        if len(cur) + len(p) + 2 <= size:
            cur = f"{cur}\n\n{p}" if cur else p
        else:
            if cur: chunks.append(cur)
            cur = (cur[-overlap:] + "\n\n" + p) if cur and overlap else p
    if cur: chunks.append(cur)
    return chunks</code></pre>

<h3>Vector databases: what to pick</h3>
<p>A vector database stores embeddings and answers "nearest k vectors to this one" fast, using approximate nearest neighbour indexes (HNSW is the usual one).</p>
<ul>
<li><b>pgvector</b> (a PostgreSQL extension) is a great default if you already run Postgres: SQL, filters, transactions and backups in one place.</li>
<li><b>Qdrant, Weaviate, Milvus, Pinecone</b> are dedicated engines, with strengths at large scale and with built-in hybrid search.</li>
<li><b>Chroma</b> or an in-memory index suits prototypes and tests.</li>
<li><b>OpenSearch / Elasticsearch</b> fit when you already run them for keyword search and want vectors alongside.</li>
</ul>
<pre><code>-- pgvector: create, insert, query (cosine distance operator is &lt;=&gt;)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (id bigserial PRIMARY KEY, doc text, section text, product text, body text, emb vector(1024));
CREATE INDEX ON chunks USING hnsw (emb vector_cosine_ops);
SELECT id, body FROM chunks WHERE product = 'videobar' ORDER BY emb &lt;=&gt; $1 LIMIT 20;</code></pre>
<div class="fw"><b>Firmware link:</b> ingestion is your build pipeline (sources → artefacts), and the index is the flashed image. Version it: record which embedding model and chunker produced it, so you can rebuild reproducibly.</div>''',
anim='chunker',
q=[dict(q='Retrieved chunks often start with "It also supports…" and the answers are vague. Cheapest strong fix?',o=['A bigger LLM','Prepend document title / section headers to each chunk, and split on structure','Lower temperature','Remove overlap'],a=1,w='Chunks that lost their context embed and read poorly. Context headers and structure-aware splitting fix much of this.'),
dict(q='Why store metadata like product and version with each chunk?',o=['For decoration','To filter searches (e.g. only firmware 3.8 docs, only docs this user may see)','Embeddings need it','It speeds up the LLM'],a=1,w='Metadata filters make retrieval precise and enforce access control.')],
lab='Lab 06 (<code>labs/06-rag-pipeline</code>) part A: implement the overlapping chunker. The vector index with metadata filters is provided (you built one in Lab 02).')

les(id='rag2',ch=4,t='RAG part 2: hybrid search, reranking and grounded answers',mins=40,
why='combine keyword and vector search with RRF, add a reranker, and generate answers that cite their sources.',
an=r'''<p>For a hard question you might ask two people: the <b>parts clerk</b>, who finds exact part numbers instantly but has no idea what "won't charge" means, and the <b>veteran tech</b>, who understands meaning but forgets part numbers. You merge their suggestions, then a <b>senior engineer</b> reads the top few carefully and picks the best.</p>
<p>That is hybrid search (clerk plus tech), rank fusion (the merge) and reranking (the senior engineer).</p>''',
d=r'''<h3>Keyword search: BM25</h3>
<p>BM25 is the classic ranking formula behind search engines. It scores a passage higher for containing the query words, especially <i>rare</i> words, with diminishing returns for repetition and a correction for long passages. It is unbeatable for error codes, part numbers, function names and acronyms.</p>

<h3>Merging two ranked lists: reciprocal rank fusion</h3>
<p>BM25 scores and cosine similarities are on different scales, so you cannot just add them. RRF uses only ranks: score(d) = Σ 1/(k + rank of d in each list), with k commonly 60 (from Cormack et al., 2009).</p>
<pre><code>def rrf(*ranked_lists: list[str], k: int = 60) -> list[str]:
    score = {}
    for lst in ranked_lists:
        for rank, doc_id in enumerate(lst, start=1):
            score[doc_id] = score.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(score, key=score.get, reverse=True)

rrf(["A", "C", "E"], ["B", "A", "D"])   # ['A', 'B', 'C', ...]: A is decent in both lists, so it wins</code></pre>
<div class="py"><b>Python note:</b> <code>*ranked_lists</code> accepts any number of arguments as a tuple, like C varargs but type-safe. <code>sorted(score, key=score.get)</code> sorts the dict's keys by their values.</div>

<h3>Reranking</h3>
<p>The first-stage search uses a <b>bi-encoder</b>: query and passages are embedded separately, which is fast enough for millions of passages. A <b>cross-encoder reranker</b> reads the query and each candidate <i>together</i> and outputs one relevance score. It is much more accurate and much slower, so run it on the top 20–50 candidates only and keep the best 3–8.</p>
<p>Options include hosted rerank APIs (for example Cohere and Voyage AI offer them) and open models you can self-host, or simply an LLM scoring relevance (slower and pricier).</p>

<h3>More retrieval levers</h3>
<ul><li><b>Metadata filters</b>: product, version, date, permissions. Apply them <i>inside</i> the search, not afterwards.</li>
<li><b>Query rewriting</b>: have an LLM turn "it dies after sleep??" into "device fails to resume from suspend" and maybe 2–3 variants, then search all of them.</li>
<li><b>Agentic retrieval</b>: give the agent a <code>search_docs</code> tool and let it search repeatedly, refining its query. Slower, but much better for multi-part questions.</li></ul>

<h3>Generating the grounded answer</h3>
<pre><code>SYSTEM = """Answer using ONLY the sources below. Cite sources like [S2] after each claim.
If the sources do not contain the answer, say "Not found in the documentation" and stop."""
context = "\n\n".join(f"[S{i+1}] ({c.doc} › {c.section})\n{c.body}" for i, c in enumerate(top_chunks))
answer = llm([{"role": "system", "content": SYSTEM},
              {"role": "user", "content": f"&lt;sources&gt;\n{context}\n&lt;/sources&gt;\n\nQuestion: {q}"}]).text
cited = set(re.findall(r"\[S(\d+)\]", answer))
assert all(1 &lt;= int(n) &lt;= len(top_chunks) for n in cited), "fabricated citation"</code></pre>
<div class="key"><b>Production checklist:</b> hybrid search + filters → rerank → 3–8 chunks with IDs → "answer only from sources" with an allowed "not found" → verify citations in code → log the trace (query, chunk IDs, answer) for evals.</div>''',
anim='hybrid',
q=[dict(q='Why not just add the BM25 score and the cosine similarity together?',o=['It\'s too slow','They are on different, incomparable scales; RRF combines ranks instead','Cosine can be negative','BM25 is deprecated'],a=1,w='Raw scores aren\'t comparable across methods. Rank-based fusion avoids calibrating them.'),
dict(q='Why not run the cross-encoder reranker over the entire corpus?',o=['It is inaccurate','It must read query and passage together for each pair, which is far too slow for millions of passages','It needs a GPU','It only works on code'],a=1,w='Cross-encoders cost one model pass per (query, passage) pair, so use them on the shortlist only.'),
dict(q='Docs mention firmware 3.6, 3.7 and 3.8. A user on 3.8 gets an answer from 3.6 docs. Best fix?',o=['Bigger chunks','A version metadata filter applied during retrieval','Higher temperature','More overlap'],a=1,w='Filtering by version inside the search guarantees the candidates are relevant to the user\'s version.')],
lab='Lab 06 part B: implement BM25, RRF fusion, a reranker stage and a grounded answer with citation checking (offline fake model).')

les(id='rag3',ch=4,t='RAG part 3: measuring retrieval and answer quality',mins=30,
why='build a small retrieval golden set and compute recall@k and MRR, and separately measure answer faithfulness, so tuning is driven by numbers.',
an=r'''<p>When a RAG answer is wrong, there are two suspects: the <b>librarian</b> (retrieval brought the wrong pages) or the <b>writer</b> (the model misused good pages). You cannot fix what you cannot locate, so measure each one separately.</p>''',
d=r'''<h3>Step 1: a retrieval golden set</h3>
<p>Collect 30–100 real questions (from tickets, Slack, engineers). For each one, record the IDs of the chunk(s) that contain the answer. That is it. It takes an afternoon, and it is the most valuable RAG asset you will build.</p>
<pre><code>GOLD = [
  {"q": "what does error -71 mean during enumeration", "relevant": {"usb-errors#2"}},
  {"q": "how do I recover a bar stuck in DFU mode",     "relevant": {"dfu-guide#4", "dfu-guide#5"}},
]</code></pre>

<h3>Step 2: retrieval metrics</h3>
<ul><li><b>Recall@k</b>: the fraction of the relevant chunks that appear in the top k. If recall@5 is low, the answer is often <i>not even in the prompt</i>, and no prompt tweak can fix that.</li>
<li><b>MRR</b> (mean reciprocal rank): 1/rank of the first relevant hit, averaged over queries. It rewards putting the right chunk at the top.</li></ul>
<pre><code>def recall_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    return len(set(retrieved[:k]) &amp; relevant) / len(relevant)

def reciprocal_rank(retrieved: list[str], relevant: set[str]) -> float:
    for i, doc in enumerate(retrieved, start=1):
        if doc in relevant: return 1.0 / i
    return 0.0</code></pre>
<p>Now every change (chunk size, hybrid on or off, a reranker, a new embedding model) becomes a table of numbers instead of a feeling.</p>

<h3>Step 3: answer quality, separately</h3>
<ul><li><b>Faithfulness (groundedness)</b>: is every claim supported by the retrieved chunks? It is usually scored by an LLM judge given the answer plus the chunks (Chapter 8 covers judge pitfalls).</li>
<li><b>Answer correctness</b>: does it match a reference answer? Use exact facts where possible, and a judge with a rubric otherwise.</li>
<li><b>Citation validity</b>: are cited IDs real, and do they contain the claim? This is partly checkable in code.</li>
<li><b>"Not found" behaviour</b>: include questions whose answer is <i>not</i> in the docs. The right output is a refusal.</li></ul>
<p>Open-source evaluation libraries such as RAGAS and DeepEval package these metrics. Knowing how to compute them yourself is what interviewers probe.</p>

<h3>Diagnosis table</h3>
<div class="tbl"><table><tr><th>Recall@k</th><th>Faithfulness</th><th>Likely problem → fix</th></tr>
<tr><td>Low</td><td>any</td><td>Retrieval: chunking, hybrid search, query rewriting, metadata filters, embedding model</td></tr>
<tr><td>High</td><td>Low</td><td>Generation: prompt ("only from sources"), fewer/better-ordered chunks, reranking, model choice</td></tr>
<tr><td>High</td><td>High, but users unhappy</td><td>Wrong questions in your golden set; go read real user traces</td></tr></table></div>''',
q=[dict(q='Recall@5 is 0.45 on your golden set. A teammate proposes rewriting the answer prompt. Your response?',o=['Great idea','The answer is missing from the prompt more than half the time; fix retrieval first','Lower temperature','Add more few-shot examples'],a=1,w='If the evidence isn\'t retrieved, generation can\'t use it. Fix retrieval first.'),
dict(q='For one query the relevant chunks are {a, b}, and the top-3 retrieved are [c, a, d]. Recall@3 and reciprocal rank?',o=['0.5 and 0.5','1.0 and 1.0','0.5 and 1.0','0.33 and 0.5'],a=0,w='One of two relevant chunks was found: recall 0.5. The first relevant hit is at rank 2: reciprocal rank 1/2.')],
lab='Lab 06 part C: compute recall@k and MRR for keyword-only, vector-only and hybrid retrieval on the provided golden set, and assert hybrid wins.')
