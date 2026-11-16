# Chapters 10-12: production, fine-tuning & local models, capstones & interviews
L=[]
def les(**k): L.append(k)

les(id='reliab',ch=10,t='Reliability: retries, rate limits, timeouts and fallbacks',mins=35,
why='wrap every model and tool call with timeouts, classified retries with backoff and jitter, rate limiting, a circuit breaker and a fallback model.',
an=r'''<p>Ethernet devices that collide on the wire don't all resend at once; each waits a random, growing time. Power systems have breakers that trip under overload, and redundant supplies that take over.</p>
<p>LLM APIs fail in ordinary ways too: rate limits, timeouts and overloaded servers. Your agent needs the same reflexes: <b>back off, trip, fail over</b>.</p>''',
d=r'''<h3>Classify errors first</h3>
<div class="tbl"><table><tr><th>Error</th><th>Retry?</th></tr>
<tr><td>429 rate limited</td><td>Yes, with backoff. Honour the <code>Retry-After</code> header if present</td></tr>
<tr><td>5xx, overloaded, connection reset, timeout</td><td>Yes, with backoff (a few attempts)</td></tr>
<tr><td>400 bad request, 401/403 auth, context too long</td><td>No. Fix the request (or trim the context)</td></tr>
<tr><td>Invalid output (bad JSON)</td><td>Repair loop (Chapter 2), limited</td></tr>
<tr><td>Tool side effect may have happened</td><td>Only if the call is idempotent (idempotency key)</td></tr></table></div>

<h3>Backoff with jitter</h3>
<pre><code>import random, time
RETRYABLE = {408, 429, 500, 502, 503, 504}

def with_retries(fn, attempts=5, base=1.0, cap=30.0, sleep=time.sleep):
    for i in range(attempts):
        try:
            return fn()
        except ApiError as e:
            if e.status not in RETRYABLE or i == attempts - 1:
                raise
            wait = e.retry_after or random.uniform(0, min(cap, base * 2 ** i))   # "full jitter"
            sleep(wait)</code></pre>
<p>The official SDKs already retry some errors (both the OpenAI and Anthropic Python SDKs have a <code>max_retries</code> setting). Know what yours does so you don't stack retries on retries (5 × 5 = 25 attempts).</p>

<h3>Rate limiting on your side</h3>
<p>Providers limit requests and tokens per minute. With many concurrent agents, add a <b>token bucket</b> in front of the API: each call takes tokens from the bucket and waits if it's empty. Separate buckets per tenant stop one noisy customer starving the rest.</p>
<div class="fw"><b>Firmware link:</b> the same token bucket you would use to rate-limit interrupts or log messages.</div>

<h3>Timeouts everywhere</h3>
<p>Set a timeout per model call, per tool call and per whole run. Streaming calls need an "idle" timeout (no token for N seconds) as well as a total one.</p>

<h3>Circuit breaker and fallback</h3>
<ul><li>After N failures in a window, <b>open</b> the breaker: fail fast (or fall back) for a cool-down, then let one trial request through (<b>half-open</b>).</li>
<li><b>Fallback model</b>: same prompt to a second model or provider. Keep your <code>call_model()</code> abstraction provider-neutral so this is a config change, and include the fallback in your evals, because it will behave differently.</li>
<li><b>Graceful degradation</b>: if retrieval is down, say so rather than answering ungrounded. If the agent fails, hand the user a partial result plus a ticket.</li></ul>''',
anim='backoff',
q=[dict(q='Requests fail with "context length exceeded". Retry with backoff?',o=['Yes','No: it will fail identically; trim or compact the context','Yes, with a different seed','Only at night'],a=1,w='Deterministic request errors need a changed request, not a retry.'),
dict(q='Why add jitter to backoff?',o=['To make retries slower','So many clients that failed together don\'t retry in lockstep and overload the server again','It is required by HTTP','To save tokens'],a=1,w='Synchronised retries create a "thundering herd". Randomness spreads them out.')],
lab='Lab 12 (<code>labs/12-production</code>): retries with a fake clock, Retry-After handling, a token-bucket limiter, a circuit breaker with half-open state, provider fallback, a response cache and a cost tracker.')

les(id='costlat',ch=10,t='Cost and latency: caching, routing and fewer tokens',mins=30,
why='estimate and cut the cost and latency of an agent using prompt caching, response caching, model routing, batching, parallel tool calls and context trimming.',
an=r'''<p>Battery life on a device comes from many small decisions: sleep when idle, wake the big core only when needed, don't recompute what you computed a second ago. LLM cost and latency work the same way: <b>don't resend, don't recompute, don't use the big core for small jobs</b>.</p>''',
d=r'''<h3>Measure first</h3>
<p>Log tokens in and out, latency and cost per call, per step and per task (Chapter 8). The biggest costs are usually (1) history re-sent at every agent step, (2) oversized retrieved context, and (3) using a top model for trivial steps.</p>

<h3>The levers, roughly in order of payoff</h3>
<ol><li><b>Fewer steps</b>: better tools (one tool returns what used to take three calls), better instructions, or a workflow instead of an agent for fixed paths.</li>
<li><b>Smaller context</b>: fewer, reranked chunks; compact the history; truncate tool outputs; show only the tools needed now.</li>
<li><b>Prompt caching</b>: providers reuse the processed form of an <i>unchanged prompt prefix</i>, and bill cached input tokens at a discount and serve them faster. OpenAI applies it automatically to sufficiently long prompts. Anthropic uses explicit <code>cache_control</code> markers on the blocks to cache. Design for it: <b>put stable content first</b> (system prompt, tool definitions, reference docs) and variable content last, and don't put timestamps at the top.</li>
<li><b>Model routing</b>: small, fast models for classification, extraction and simple steps; the big model for planning and hard reasoning. Measure both on your eval set.</li>
<li><b>Response caching</b>: cache identical requests (hash of model, messages and settings) in your own store. A "semantic cache" matches similar requests by embedding, which is riskier, because "similar" questions can need different answers.</li>
<li><b>Batch APIs</b> for offline jobs (nightly log summaries, re-scoring an eval set). OpenAI and Anthropic both offer batch endpoints at a discount, with results typically within 24 hours.</li>
<li><b>Parallelism</b> for latency: run independent tool calls and sub-agents concurrently, and stream the final answer.</li>
<li><b>Output length</b>: ask for concise output and cap max tokens. Output tokens are the expensive ones.</li></ol>
<pre><code># Anthropic: mark the stable prefix as cacheable
client.messages.create(model=MODEL, max_tokens=800,
    system=[{"type": "text", "text": LONG_STABLE_INSTRUCTIONS_AND_DOCS,
             "cache_control": {"type": "ephemeral"}}],
    messages=history)
# response.usage reports cache_creation_input_tokens / cache_read_input_tokens so you can verify hits</code></pre>
<div class="key"><b>Interview framing:</b> "I'd first instrument cost per task and find the dominant term. For agents, that's almost always repeated context, so I'd make the prefix cache-friendly, trim history and tool output, route easy steps to a smaller model, and verify on the eval set that quality held."</div>''',
anim='cost',
q=[dict(q='Your system prompt starts with "Current time: 10:42:17" followed by 8k tokens of stable instructions. Cache hit rate is near zero. Why?',o=['Caching is broken','The prefix changes every call, so nothing after it matches; move variable content to the end','The prompt is too short','Wrong model'],a=1,w='Caches match on an identical prefix. Keep stable content first.'),
dict(q='Nightly you summarise 50,000 device logs; nobody waits on the results. Cheapest approach?',o=['Live API, maximum concurrency','A provider batch API (discounted, asynchronous)','A bigger model','Streaming'],a=1,w='Batch endpoints trade latency for price, which suits offline jobs.')])

les(id='deploy',ch=10,t='Deploying and running agents in production',mins=35,
why='package an agent as a service, choose sync vs background execution, manage prompts and config as versioned artefacts, and monitor it like any production system.',
an=r'''<p>Shipping firmware isn't just compiling: it's signing, versioning, staged rollout, telemetry from the field, and a rollback plan. An agent in production needs the same: <b>a versioned artefact, a controlled rollout, live telemetry and a way back</b>.</p>''',
d=r'''<h3>A reference architecture</h3>
<ol><li><b>API layer</b> (for example FastAPI in Python): authenticates the user, validates input and starts a run.</li>
<li><b>Short tasks</b> (a few seconds): run inline and stream the answer back (SSE).</li>
<li><b>Long tasks</b>: put a job on a <b>queue</b>, return a run ID immediately, and have workers execute the agent loop with checkpoints in a database. Push progress through a webhook, WebSocket or polling.</li>
<li><b>Tool layer</b>: internal services and MCP servers, each with its own authorisation.</li>
<li><b>Data</b>: Postgres (state, checkpoints, often pgvector too), object storage for files, Redis for caches and rate-limit buckets.</li>
<li><b>Observability</b>: traces (LLM spans plus service spans), metrics and logs, plus an eval job on sampled traffic.</li></ol>
<pre><code>from fastapi import FastAPI
from pydantic import BaseModel
app = FastAPI()

class Ask(BaseModel):
    unit: int
    question: str

@app.post("/runs")
async def start(req: Ask):
    run_id = await queue.enqueue("triage", req.model_dump())   # worker runs the agent with checkpoints
    return {"run_id": run_id, "status": "queued"}

@app.get("/runs/{run_id}")
async def status(run_id: str):
    return await store.get_run(run_id)          # state, pending approvals, result</code></pre>
<p>Package it in a container (Docker) and deploy as you would any service (Kubernetes, a managed container platform, or serverless for short tasks). Keep secrets in a secret manager, never in prompts or images.</p>

<h3>Treat prompts, tools and model choice as versioned config</h3>
<ul><li>Store prompts in the repo (or a prompt registry) with versions, and record the prompt version on every trace.</li>
<li>Pin model versions where the provider allows, because "latest" aliases change under you. Re-run evals before upgrading, and plan for deprecations (providers retire models on published schedules).</li>
<li>Roll out changes behind flags: shadow mode (run new and old, compare, show only old), then canary to a small percentage, then everyone. You already know this pattern from firmware rollouts.</li></ul>

<h3>What to monitor</h3>
<div class="tbl"><table><tr><th>Signal</th><th>Why</th></tr>
<tr><td>Task success rate (online eval / user feedback)</td><td>The real quality metric</td></tr>
<tr><td>Latency p50/p95 per step and per task</td><td>The user experience; SLOs</td></tr>
<tr><td>Cost per task, per tenant, per day</td><td>Budget alarms; abuse detection</td></tr>
<tr><td>Error and retry rates by provider and by tool</td><td>Outages; flaky tools</td></tr>
<tr><td>Steps per task, loop detections, limit hits</td><td>Agent behaviour drift</td></tr>
<tr><td>Guardrail triggers, approval rejections</td><td>Safety and UX tuning</td></tr></table></div>
<div class="fw"><b>Firmware link:</b> field telemetry plus staged OTA rollout plus rollback. You already know how to ship to devices you can't touch; agents are devices whose behaviour can drift without a code change, which is why the monitoring matters even more.</div>''',
anim='flow',animdata=dict(title='Shipping a prompt change safely',items=[['Branch','Edit the prompt file; the version bumps to triage-v8.'],['CI eval','Golden set plus regression gate run against the baseline. Fail = stop.'],['Shadow','v8 runs alongside v7 on live traffic; only v7 answers are shown; compare scores.'],['Canary','5% of users get v8; watch success rate, cost and latency dashboards.'],['Roll out or roll back','Full rollout, or flip the flag back to v7 in seconds.']]),
q=[dict(q='An agent task takes 2–10 minutes. Best API shape?',o=['One blocking HTTP call','Return a run ID immediately; run on a worker with checkpoints; report progress via polling or webhook','Increase the HTTP timeout to 1 hour','Run it in the browser'],a=1,w='Long-running work belongs on background workers with persisted state.'),
dict(q='Your provider\'s "latest" model alias changed and quality dropped overnight. Prevention?',o=['Never use LLMs','Pin model versions, and run evals before switching','Use higher temperature','Cache everything'],a=1,w='Treat the model as a dependency: pin it, test upgrades, then roll out.')])

les(id='finetune',ch=11,t='Prompting vs RAG vs fine-tuning, and small or local models',mins=35,
why='decide when fine-tuning is worth it, explain LoRA and distillation, and run an open-weight model locally behind the same API shape.',
an=r'''<p>To make a new technician better, you can give them <b>clearer work orders</b> (prompting), an <b>open manual at the bench</b> (RAG), or <b>months of on-the-job training</b> (fine-tuning). Training changes habits: their style, speed and instincts. It is a poor way to teach the exact torque value for every bolt; that belongs in the manual.</p>''',
d=r'''<h3>The decision, in order</h3>
<ol><li><b>Prompt first.</b> Clear instructions, a schema and few-shot examples, measured on an eval. This is cheap, fast and reversible.</li>
<li><b>Missing knowledge? Use RAG or tools.</b> Facts change, and they need citations and access control. Fine-tuning does not reliably inject facts, and it goes stale.</li>
<li><b>Fine-tune when</b> you need consistent behaviour that prompting can't reach (a strict output style, a narrow classification at high volume, a domain-specific format), you have hundreds to thousands of high-quality examples, and an eval proves the gain over a well-prompted baseline.</li>
<li><b>Fine-tune or distil for cost</b>: train a small model to imitate a large model on your narrow task, then route that task to the small model.</li></ol>

<h3>How fine-tuning works, in one paragraph</h3>
<p>Supervised fine-tuning continues training on (input, ideal output) pairs, nudging the weights so the model produces outputs like yours. Full fine-tuning updates every weight and is expensive. <b>LoRA</b> (Hu et al., 2021) freezes the original weights and trains small add-on matrices, which cuts memory use dramatically and produces a small adapter file. QLoRA does the same on a quantised base model. Hosted providers offer fine-tuning APIs for some of their models, and libraries such as Hugging Face's PEFT and TRL do it for open-weight models.</p>
<div class="warn"><b>Costs people forget:</b> collecting and cleaning data, keeping it free of PII, re-running fine-tunes when the base model is retired, and evaluating every version. Fine-tuning is a maintenance commitment.</div>

<h3>Small and local models</h3>
<ul><li><b>Open-weight models</b> (families such as Llama, Mistral, Qwen and Gemma) can run on your own hardware, which is good for privacy, offline use, cost at high volume and edge devices.</li>
<li><b>Quantisation</b> (for example 4-bit weights, often in the GGUF file format) shrinks memory needs so a model fits on a laptop GPU or even a CPU, at some quality cost.</li>
<li><b>Runtimes</b>: <b>llama.cpp</b> (efficient C/C++ inference, a natural fit for your background), <b>Ollama</b> (easy downloads plus a local server), and <b>vLLM</b> (a high-throughput GPU server for production).</li>
<li>Both Ollama and vLLM expose an <b>OpenAI-compatible HTTP API</b>, so your existing client code works by changing the base URL:</li></ul>
<pre><code># ollama pull &lt;model&gt; ; ollama serve   (listens on localhost:11434)
from openai import OpenAI
local = OpenAI(base_url="http://localhost:11434/v1", api_key="unused")
r = local.chat.completions.create(model=LOCAL_MODEL, messages=[{"role": "user", "content": "Summarise: ..."}])
print(r.choices[0].message.content)</code></pre>
<p>Small models are weaker at long multi-step tool use. Use them for well-scoped steps (classify, extract, summarise) and verify them on your eval set.</p>
<div class="fw"><b>Your edge:</b> on-device inference (quantised models on NPUs and GPUs, memory budgets, latency) is where embedded and AI meet. Robotics teams, including humanoid teams like Optimus, need people who understand both the agent layer and the constrained hardware underneath.</div>''',
anim='decide',
q=[dict(q='The assistant doesn\'t know your product\'s 2026 release notes. Best fix?',o=['Fine-tune on the release notes','RAG over the release notes (or a search tool)','Raise temperature','Use a reasoning model'],a=1,w='Knowledge gaps call for retrieval: it stays current, cites sources and respects access rules.'),
dict(q='What does LoRA change during fine-tuning?',o=['All weights','Only small add-on matrices; the original weights stay frozen','The tokenizer','The context window'],a=1,w='That is why LoRA is cheap and why the result is a small adapter file.')])

les(id='capstones',ch=12,t='Capstone projects: three portfolio pieces',mins=20,
why='pick and build portfolio projects that prove each skill postings ask for, with milestones and a rubric to self-grade.',
an=r'''<p>A hiring manager reading your résumé asks one question: "has this person shipped something like what we need?" Three well-built, well-documented projects, each with evals and a README that explains the trade-offs, answer that question better than any certificate.</p>''',
d=r'''<h3>Capstone 1: Firmware Log Triage Agent (your signature project)</h3>
<p><b>What</b>: an agent that takes a device ID and a symptom, searches logs and firmware history through an <b>MCP server you wrote</b>, retrieves relevant known-issue docs (RAG), and returns a structured root-cause hypothesis with quoted evidence and a next diagnostic step. Risky actions (reboot, reflash) need human approval.</p>
<p><b>Skills proven</b>: tool design, MCP, agent loop, RAG, structured output, HITL, evals, tracing, security.</p>
<ol><li><b>M1</b> (week 1): an MCP server over sample logs (generate realistic dmesg/USB logs, or use public ones), with tests.</li>
<li><b>M2</b>: a hand-written agent loop using the server; structured <code>Triage</code> output.</li>
<li><b>M3</b>: RAG over a known-issues knowledge base with hybrid search; measure recall@5.</li>
<li><b>M4</b>: port to LangGraph with an approval interrupt for <code>reboot_device</code>.</li>
<li><b>M5</b>: a 40-case golden set, CI regression gate, traces (Langfuse or OpenTelemetry), and injection test cases.</li>
<li><b>M6</b>: a README with an architecture diagram, eval results table, cost per task and known limitations; a 3-minute demo video.</li></ol>

<h3>Capstone 2: Spec-to-Test Assistant (RAG-heavy)</h3>
<p><b>What</b>: ingest a public spec (for example a USB class specification or another standard you're allowed to use), answer questions with citations to sections, and generate test-case outlines for a requirement. It must say "not in spec" when appropriate.</p>
<p><b>Skills proven</b>: ingestion of messy PDFs, chunking strategy, hybrid search plus reranking, citation verification, retrieval and faithfulness evals, cost optimisation (prompt caching).</p>
<ol><li><b>M1</b>: ingestion with section-aware chunking and metadata. <b>M2</b>: hybrid retrieval plus a reranker; a 50-question retrieval golden set; compare recall@k across 3 configurations. <b>M3</b>: grounded answers with verified citations, plus a faithfulness judge calibrated on 30 human labels. <b>M4</b>: a FastAPI service in Docker with streaming answers. <b>M5</b>: a write-up of the experiments as a table.</li></ol>

<h3>Capstone 3: Multi-agent Release Readiness Reviewer</h3>
<p><b>What</b>: given a release branch, an orchestrator dispatches workers (changelog vs commits, open bugs by severity, test results, risky-file diff review) in parallel, then writes a go/no-go report with evidence. All workers are read-only.</p>
<p><b>Skills proven</b>: orchestrator-worker, parallelism, durable long-running runs, cost control, a framework comparison (build it in the OpenAI Agents SDK <i>or</i> the Claude Agent SDK and document why).</p>
<ol><li><b>M1</b>: workers as standalone agents with tests. <b>M2</b>: an orchestrator with a token budget and failure-tolerant fan-in. <b>M3</b>: durable runs (checkpoints and resume) plus a human sign-off step. <b>M4</b>: evals on 15 historical releases (was the go/no-go right?), and cost and latency per run.</li></ol>

<h3>Rubric: grade yourself honestly</h3>
<div class="tbl"><table><tr><th>Area</th><th>Meets bar</th><th>Stands out</th></tr>
<tr><td>Works</td><td>A demo runs from the README in under 10 minutes</td><td>Docker compose; seeded sample data; CI badge</td></tr>
<tr><td>Evals</td><td>Golden set + pass rate in the README</td><td>Regression gate in CI; judge calibrated against humans; before/after tables</td></tr>
<tr><td>Engineering</td><td>Typed code, tests, retries, timeouts</td><td>Idempotent tools, circuit breaker, cost tracking per task</td></tr>
<tr><td>Safety</td><td>Approval on destructive tools; secrets not in code</td><td>Taint tracking; injection cases in evals; PII redaction in traces</td></tr>
<tr><td>Observability</td><td>Logs of model/tool calls</td><td>Full traces with token/cost/latency; a failure walk-through in the README</td></tr>
<tr><td>Communication</td><td>Clear README</td><td>Architecture diagram, trade-offs, limitations, "what I'd do next"</td></tr></table></div>
<div class="key"><b>Publish</b> on GitHub (public repos for these), link them from your résumé and LinkedIn, and write one short blog post per project about a real problem you hit and how evals showed the fix worked.</div>''',
q=[dict(q='Which addition most strengthens a capstone in an interviewer\'s eyes?',o=['More frameworks used','An eval set with results and a regression gate, plus a write-up of a failure you found and fixed','A fancier UI','A longer prompt'],a=1,w='Evidence that you measure and improve is what separates engineers from demo builders.')])

les(id='sysdesign',ch=12,t='Interview: agentic system design, with worked answers',mins=60,
why='run a 45-minute agentic system-design interview using a repeatable framework, with three fully worked example answers.',
an=r'''<p>A design interview is a design review where you are both the presenter and the person asking the hard questions. Interviewers aren't looking for "the right framework". They want to see you <b>clarify the problem, choose the simplest design that works, and show how you'd know it works and keep it safe</b>.</p>''',
d=r'''<h3>The framework: 7 steps (say them out loud)</h3>
<ol><li><b>Clarify</b>: users, tasks, volume, latency target, which actions are allowed, data sensitivity, success metric.</li>
<li><b>Simplest baseline</b>: could one call with retrieval do it? Is it a workflow or an agent?</li>
<li><b>Components</b>: model(s), tools (with schemas), retrieval, state and memory, orchestration, HITL.</li>
<li><b>Data flow</b>: walk one request end to end.</li>
<li><b>Evals</b>: golden set, metrics, regression gate, online monitoring.</li>
<li><b>Safety</b>: trifecta check, permissions, approvals, PII, sandboxing.</li>
<li><b>Production</b>: latency and cost budget, caching, retries, fallbacks, scaling, rollout.</li></ol>

<h3>Worked answer 1: "Design an IT/firmware support agent that can resolve tickets"</h3>
<details class="sol"><summary>Show the full answer</summary>
<p><b>Clarify</b>: internal employees; about 2k tickets/day; target first response under 10 s; may reset passwords and reboot conference-room devices; ticket data contains PII. Success = the percentage resolved without a human, with CSAT held.</p>
<p><b>Baseline</b>: route by category. FAQs → RAG answer (workflow). Device problems → an agent with diagnostic tools. Account actions → a workflow with approval.</p>
<p><b>Components</b>: a router (small model, structured output: category + confidence); RAG over the KB with hybrid search + reranker + permission filters; an agent with tools <code>get_device_status</code>, <code>search_logs</code>, <code>reboot_device</code> (approval), <code>create_escalation</code>; state in Postgres; LangGraph for the HITL interrupt.</p>
<p><b>Flow</b>: ticket → redact PII for logging → router → (FAQ) retrieve + answer with citations → (device) agent loop, max 8 steps → if it proposes a reboot, interrupt and ask the device owner → resume → reply + close, or escalate with a summary of findings.</p>
<p><b>Evals</b>: 200 historical tickets as a golden set (category accuracy, resolution correctness by judge plus human calibration, correct tool use, no PII in replies); online: escalation rate, reopen rate, CSAT; a regression gate in CI.</p>
<p><b>Safety</b>: tickets are untrusted (injection), so the agent that reads tickets can only call read tools plus approval-gated actions; there is no free-form outbound email (replies go only to the ticket); per-user authorisation on device actions.</p>
<p><b>Production</b>: the router runs on a small model; cache the KB prefix; stream replies; retries plus a fallback provider; cost per ticket on a dashboard; canary new prompts.</p></details>

<h3>Worked answer 2: "Design a coding agent that fixes failing CI tests"</h3>
<details class="sol"><summary>Show the full answer</summary>
<p><b>Clarify</b>: monorepo; triggered on a red CI run; output is a pull request for human review, never a direct push; budget of about 15 minutes and a cost cap per run.</p>
<p><b>Components</b>: an ephemeral sandbox container with the repo checked out, network off except the package mirror, and no secrets; tools <code>read_file</code>, <code>grep</code>, <code>run_tests(target)</code>, <code>apply_patch</code>, <code>open_pr</code> (only at the end). A harness such as the Claude Agent SDK or OpenAI's agent tooling, or a custom loop.</p>
<p><b>Flow</b>: fetch failing test logs → agent reproduces the failure → inspects code → proposes a patch → runs the targeted tests → iterates (max N) → runs the broader suite → opens a PR with an explanation and evidence (before/after test output).</p>
<p><b>Evals</b>: a set of historical failing commits with known fixes (does the patch make the tests pass without breaking others; does it match the human fix?); a regression gate when the harness or prompts change; review-acceptance rate online.</p>
<p><b>Safety</b>: the repo content can contain injected instructions (comments, docs), hence the sandbox, no secrets and no network; the PR needs review; it may not modify CI config or tests unless explicitly allowed (policy check on the diff).</p>
<p><b>Production</b>: a queue per repo; cap concurrency; cache dependency installs in the image; record full traces for every PR.</p></details>

<h3>Worked answer 3: "Design a research assistant over 1M internal documents"</h3>
<details class="sol"><summary>Show the full answer</summary>
<p><b>Clarify</b>: documents with access controls (ACLs); answers must cite; questions vary from simple lookups to multi-part comparisons; p95 under 20 s.</p>
<p><b>Design</b>: an ingestion pipeline (parse, section-aware chunking, context headers, embeddings, metadata including ACL groups) into a hybrid index (for example OpenSearch, or Postgres + pgvector + full-text search). Simple questions → a single retrieve-and-answer workflow. Complex ones → a planner that splits into sub-queries, runs parallel retrieval (agentic search tool), reranks, then synthesises with citations.</p>
<p><b>Key points interviewers look for</b>: permission filtering <i>inside</i> retrieval (never filter after generation); citation verification; "not found" behaviour; incremental re-indexing; embedding-model versioning; a retrieval golden set (recall@k) separate from answer evals (faithfulness).</p>
<p><b>Cost and latency</b>: caching frequent queries' retrieval results; routing simple queries to the cheap path; streaming the answer as soon as retrieval finishes.</p></details>

<h3>Questions to expect, and the one-line core of a good answer</h3>
<ul><li><i>"How do you stop the agent looping forever?"</i>: step, token and time limits, loop detection, and a partial-result response.</li>
<li><i>"How do you know your agent got better?"</i>: a golden set from real traces, multi-trial pass rates, a regression gate, calibrated judges, online metrics.</li>
<li><i>"How would you handle 10× traffic?"</i>: queue + workers, rate-limit buckets per tenant, caching, model routing, provider fallback, horizontal scaling of stateless workers with state in a database.</li>
<li><i>"What if the model provider is down?"</i>: circuit breaker, fallback model behind the same interface (evaluated), graceful degradation.</li>
<li><i>"How do you prevent data leaks?"</i>: trifecta analysis, least privilege, allowlists, approvals, PII redaction in logs and traces, tenant isolation in retrieval.</li></ul>''',
anim='flow',animdata=dict(title='The 7-step design framework',items=[['Clarify','Users, volume, latency, allowed actions, data sensitivity, success metric.'],['Baseline','Simplest thing: one call + retrieval? Workflow or agent?'],['Components','Models, tools + schemas, retrieval, state/memory, orchestration, HITL.'],['Data flow','Walk one request end to end, including failure paths.'],['Evals','Golden set, metrics, regression gate, online monitoring.'],['Safety','Lethal trifecta check, permissions, approvals, PII, sandbox.'],['Production','Latency/cost budget, caching, retries, fallbacks, scaling, rollout.']]),
q=[dict(q='The first thing to do in an agentic design interview?',o=['Name a framework','Clarify users, tasks, constraints, allowed actions and success metric','Draw the vector database','Discuss fine-tuning'],a=1,w='Requirements drive every later choice. Interviewers grade this step heavily.')])

les(id='coding',ch=12,t='Interview: coding drills and conceptual Q&A',mins=60,
why='solve the coding exercises agentic interviews actually use, and answer 25 conceptual questions crisply.',
an=r'''<p>Agentic coding rounds are rarely algorithm puzzles. They are "build the small, real piece": parse tool calls, write the loop, chunk and retrieve, add retries, write an eval. Think of them as a bring-up task: make it work, then make it robust, and talk through the failure modes as you go.</p>''',
d=r'''<h3>Coding drills (try each before opening the solution)</h3>
<p><b>1. Tool registry from type hints.</b> Write <code>@tool</code> so that <code>schema(fn)</code> returns <code>{"name", "description", "parameters"}</code> with JSON types for int, str, float, bool and list[str].</p>
<details class="hint"><summary>Hint</summary><p>Use <code>inspect.signature(fn)</code> and <code>typing.get_type_hints(fn)</code>. Parameters without defaults are required.</p></details>
<details class="sol"><summary>Solution</summary><pre><code>import inspect, typing
PY2JSON = {int: "integer", str: "string", float: "number", bool: "boolean"}
def to_json_type(t):
    if typing.get_origin(t) is list:
        return {"type": "array", "items": to_json_type(typing.get_args(t)[0])}
    return {"type": PY2JSON[t]}
def schema(fn):
    hints = typing.get_type_hints(fn); props, req = {}, []
    for name, p in inspect.signature(fn).parameters.items():
        props[name] = to_json_type(hints[name])
        if p.default is inspect.Parameter.empty: req.append(name)
    return {"name": fn.__name__, "description": inspect.getdoc(fn) or "",
            "parameters": {"type": "object", "properties": props, "required": req}}</code></pre></details>

<p><b>2. The agent loop</b> with max steps, unknown-tool handling and exceptions. (This is Lab 05: write it from memory in 15 minutes.)</p>

<p><b>3. Reciprocal rank fusion</b> of N ranked lists (Chapter 4 code). Follow-up: "How would you weight one list more?" Answer: multiply that list's contributions by a weight.</p>

<p><b>4. Retry with backoff</b>, honouring Retry-After and not retrying 4xx. Follow-up: make it testable without sleeping (inject a <code>sleep</code> function or a clock).</p>

<p><b>5. Streaming JSON accumulator.</b> Given chunks of a streamed tool-call argument string, return the parsed dict when complete and raise on invalid input.</p>
<details class="sol"><summary>Solution</summary><pre><code>class ArgAccumulator:
    def __init__(self): self.buf = []
    def feed(self, chunk: str): self.buf.append(chunk)
    def result(self) -> dict:
        return json.loads("".join(self.buf))     # raises json.JSONDecodeError if incomplete or invalid</code></pre><p>Talking point: don't try to parse partial JSON on every chunk unless you need live UI updates, and then use a tolerant partial-JSON parser.</p></details>

<p><b>6. Conversation trimmer</b> that keeps the system message, keeps the last N tokens, and never separates a tool call from its result.</p>
<details class="sol"><summary>Solution</summary><pre><code>def trim(msgs, budget, count):
    system, rest = msgs[0], msgs[1:]
    out, used = [], count(system)
    i = len(rest) - 1
    while i >= 0:
        group = [rest[i]]
        while group[0]["role"] == "tool" and i > 0:      # pull in the assistant message that requested it
            i -= 1; group.insert(0, rest[i])
        cost = sum(count(m) for m in group)
        if used + cost > budget: break
        out[:0] = group; used += cost; i -= 1
    return [system] + out</code></pre></details>

<p><b>7. Eval harness</b>: given cases and a system function, compute per-case pass rates over k trials and fail if any "critical" case drops below the baseline (Lab 10).</p>

<h3>Conceptual Q&amp;A: say each answer in 2–4 sentences</h3>
<details class="hint"><summary>1–8: foundations and APIs</summary><ol>
<li><b>What is a token and why care?</b> The unit models read and write. Limits, cost and latency are all in tokens.</li>
<li><b>Temperature 0: deterministic?</b> Not guaranteed. Server-side batching and floating-point order can vary, so test for variance.</li>
<li><b>Why do models hallucinate?</b> They generate plausible text, not verified facts. Mitigate with grounding, tools, schemas and evals.</li>
<li><b>Embedding vs LLM?</b> An embedding model maps text to a vector for similarity. An LLM generates text.</li>
<li><b>Why is the API stateless and what follows?</b> You resend history each call, so you control, trim and pay for context.</li>
<li><b>JSON mode vs structured outputs?</b> Valid JSON only, versus schema-constrained output. Validate both.</li>
<li><b>Context window full: options?</b> Trim, compact (summarise), drop old tool results, retrieve less, or use subagents for isolation.</li>
<li><b>Streaming: what improves?</b> Time to first token (perceived latency), not total time.</li></ol></details>
<details class="hint"><summary>9–16: agents, RAG, MCP</summary><ol start="9">
<li><b>Workflow vs agent?</b> Code controls the path, versus the LLM choosing the path. Prefer workflows when the steps are known.</li>
<li><b>ReAct?</b> Alternate reasoning, tool action and observation. Native tool calling implements it.</li>
<li><b>Plan-and-execute benefits?</b> An explicit, approvable plan; cheaper executors; easier tracking.</li>
<li><b>Why hybrid search?</b> Keywords catch exact IDs; vectors catch paraphrases. RRF merges them by rank.</li>
<li><b>Why rerank?</b> A cross-encoder reads query and passage together: more accurate, so run it on the shortlist.</li>
<li><b>Retrieval vs generation failure?</b> Measure recall@k separately from faithfulness.</li>
<li><b>What is MCP?</b> An open JSON-RPC protocol for exposing tools, resources and prompts to any AI host, over stdio or Streamable HTTP.</li>
<li><b>MCP vs A2A?</b> Agent-to-tools versus agent-to-agent.</li></ol></details>
<details class="hint"><summary>17–25: evals, safety, production</summary><ol start="17">
<li><b>How do you evaluate an agent?</b> Task success, tool-use correctness, trajectory cost and steps, safety, over a golden set with multiple trials.</li>
<li><b>LLM-as-judge pitfalls?</b> Position, verbosity and self-preference bias, and drift. Swap orders and calibrate against humans.</li>
<li><b>What is a regression gate?</b> CI fails if eval scores or critical cases drop versus the baseline.</li>
<li><b>Prompt injection defence?</b> Assume the model can be fooled: break the trifecta, least privilege, allowlists, approvals, taint tracking.</li>
<li><b>Why idempotency in agents?</b> Retries and replays will re-run steps, and side effects must not double.</li>
<li><b>Cut agent cost?</b> Fewer steps, smaller context, cache-friendly prefixes, model routing, batch for offline work.</li>
<li><b>Fine-tune or RAG for new product docs?</b> RAG: current, citable, access-controlled.</li>
<li><b>Long-running agent design?</b> Queue + workers, checkpoints, idempotent tools, timeouts, notifications, versioned state.</li>
<li><b>What do you trace?</b> Every model and tool call: inputs and outputs (redacted), tokens, latency, cost, versions, errors, as spans in a tree.</li></ol></details>''',
q=[dict(q='In a coding round you\'re asked to add retries to an LLM call. What makes your answer stand out?',o=['Retrying every error 10 times','Classifying retryable errors, exponential backoff with jitter, honouring Retry-After, a total time budget, and an injectable clock for tests','Using a bigger model','Removing timeouts'],a=1,w='Interviewers look for error classification, safe backoff and testability.')])

les(id='career',ch=12,t='Your firmware background as a strength, and applying',mins=30,
why='tell a credible story that connects embedded and USB firmware experience to agentic engineering, target the right roles, and plan the job search.',
an=r'''<p>Career changers often hide their past. Don't. A team building agents that touch real systems (devices, fleets, robots, test labs) is short of people who understand hardware, timing, failure modes and safety. You are not starting from zero; you are bringing the <b>reliability half</b> of the job.</p>''',
d=r'''<h3>Translate your experience (use this vocabulary)</h3>
<div class="tbl"><table><tr><th>You did</th><th>Say it as</th></tr>
<tr><td>Interrupt handlers, state machines, watchdogs</td><td>"I design control loops with explicit state, timeouts and stop conditions, which is exactly what agent loops need."</td></tr>
<tr><td>USB descriptor parsing, untrusted input bounds-checking</td><td>"I treat every external input as hostile. Same mindset for tool arguments and prompt injection."</td></tr>
<tr><td>Retries, NAK/resend, A/B updates, journaling</td><td>"Idempotency, backoff and durable execution are second nature."</td></tr>
<tr><td>HIL testing, regression suites, yield</td><td>"I build evaluation harnesses and gate releases on measured pass rates."</td></tr>
<tr><td>Debugging with traces, logic analysers, ftrace</td><td>"Observability-first: I instrument before I need it."</td></tr>
<tr><td>Vendor C drivers (NXP, Qualcomm, Ambarella, Lontium), Linux/Android</td><td>"I integrate complex third-party systems and own the stack end to end."</td></tr></table></div>

<h3>Where your combination is rarest (target these)</h3>
<ul><li><b>Agents for hardware and test automation</b>: log triage, test-plan generation, lab orchestration, failure analysis across device fleets.</li>
<li><b>AI for networking/devices operations</b>: one posting we read (HPE/Juniper's Marvis) builds agents that diagnose network problems through MCP servers, very close to your world.</li>
<li><b>On-device and edge AI</b>: local models, quantisation, NPUs, latency budgets.</li>
<li><b>Robotics</b> (your Optimus goal): agent and planning layers sit on top of real-time control. Engineers who respect both are valuable.</li>
<li><b>Agent platform teams</b>: tool layers, MCP infrastructure, reliability. These are backend-heavy and suit a systems engineer.</li></ul>

<h3>Your 60-second story (adapt it)</h3>
<p>"I've spent my career on Linux/Android and USB firmware for video conferencing devices: C/C++ drivers, state machines, field reliability. Over the last few months I've built agentic systems end to end. My main project is a firmware log-triage agent with my own MCP server, hybrid RAG over known issues, a LangGraph approval step for risky actions, and a 40-case eval suite gating changes in CI. What I bring is the production discipline: limits, idempotency, tracing and security by design. I'm looking for a team where agents touch real systems."</p>

<h3>Applying: a practical plan</h3>
<ol><li>Finish Capstone 1 and one other <b>before</b> applying widely. Put the repos at the top of your résumé.</li>
<li>Résumé bullets as <i>outcomes with numbers you measured</i>, for example (placeholder numbers): "Raised retrieval recall@5 from 0.58 to 0.86 by adding hybrid search and reranking (40-question golden set)." Only use numbers you actually measured.</li>
<li>Apply in tiers: devices/robotics/networking companies with agent teams first (best fit), then agent-platform roles, then general "AI engineer" roles.</li>
<li>Internal first: propose a small agent for your current team (log triage on test runs). Real production experience is what postings ask for ("at least one production agentic system").</li>
<li>Prepare with the system-design and coding lessons; do one mock interview a week.</li></ol>
<div class="key"><b>Honest positioning:</b> many postings ask for 1–2 years of production LLM experience. Close the gap with (a) an internal production agent at your current job, (b) public capstones with evals, and (c) senior systems experience, which many teams value more than framework familiarity. Apply anyway when you meet most of the list.</div>''',
q=[dict(q='Which résumé bullet is strongest?',o=['"Passionate about AI agents"','"Used LangChain"','"Built an MCP-based log-triage agent; raised recall@5 from 0.58 to 0.86 with hybrid search (40-case golden set); CI regression gate"','"Watched many AI courses"'],a=2,w='Specific, measured outcomes plus the techniques used.')])
