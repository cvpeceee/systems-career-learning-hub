"""Build 08-agentic-ai-engineer/index.html from lessons_*.py + glossary.py + docs. Usage: python3 build.py"""
import json, os, re, sys, html as H
import markdown
D0=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(D0); sys.path.insert(0,D0)
from glossary import G
import lessons_a, lessons_b, lessons_c, lessons_d
L=lessons_a.L+lessons_b.L+lessons_c.L+lessons_d.L
IDX={l['id']:i for i,l in enumerate(L)}
CH=[("Start here","What the job is, how this course works, and Python for C++/Java engineers.","~1 h"),
("How LLMs work","Tokens, next-token prediction, sampling, context windows, embeddings, hallucination.","~2 h"),
("Using LLM APIs well","Messages and roles, streaming, structured output, prompt and context engineering.","~1.7 h"),
("Tools and agents","Tool calling, the agent loop from scratch, patterns, state and memory.","~2.5 h"),
("RAG end to end","Chunking, embeddings, vector databases, hybrid search, reranking, retrieval evals.","~2 h"),
("Model Context Protocol","What MCP is, and building a server and client with the official SDK.","~1.3 h"),
("Frameworks","An honest comparison, and LangGraph hands-on with checkpoints and interrupts.","~1.3 h"),
("Multi-agent and long-running","Orchestrator-worker, handoffs, human approval, durable execution.","~1.1 h"),
("Evals and observability","Golden sets, regression gates, LLM-as-judge pitfalls, tracing.","~1.7 h"),
("Safety and security","Prompt injection, the lethal trifecta, permissions, sandboxing, guardrails, PII.","~1.2 h"),
("Production","Retries, rate limits, fallbacks, caching, routing, deployment, monitoring.","~1.7 h"),
("Fine-tuning and local models","When to fine-tune, LoRA, distillation, running open-weight models.","~0.6 h"),
("Capstones and interviews","Three portfolio projects, system design, coding drills, Q&A, your story.","~3 h")]
LABS=[("00-setup","Environment check","Create the virtual environment, install requirements, run every lab's tests against the reference solutions.","cd labs\npython3 -m venv .venv && source .venv/bin/activate\npip install -r requirements.txt\npython run_all.py            # all solutions\nLAB_TARGET=starter python -m pytest 05-agent-from-scratch -q   # your work",['role','python']),
("01-llm-basics","Sampling and tokens by hand","Softmax with temperature, top-p filtering, seeded sampling, a tiny bigram next-token model trained on firmware log lines, and a token-cost estimator.","cd labs/01-llm-basics && python -m pytest -q",['nexttoken','sampling']),
("02-embeddings","Embeddings and nearest neighbours","Cosine similarity, an offline hashing embedder, top-k search; optional real embedding API.","cd labs/02-embeddings && python -m pytest -q",['embed']),
("03-llm-api-structured","Provider-agnostic wrapper and structured output","call_model() with fake / OpenAI / Anthropic backends, Pydantic validation and a repair loop, stream accumulation.","cd labs/03-llm-api-structured && python -m pytest -q\nLLM_BACKEND=openai MODEL=<model> python demo.py   # real API (optional)",['apis','structured','prompting']),
("04-tool-calling","Tool registry and safe dispatch","JSON Schema from type hints, argument validation, errors returned as tool results, parallel calls.","cd labs/04-tool-calling && python -m pytest -q",['tools']),
("05-agent-from-scratch","The agent loop with no framework","Loop with step/token limits, unknown tools, exceptions, loop detection, trace, history trimming that never splits a tool call.","cd labs/05-agent-from-scratch && python -m pytest -q",['loop','patterns','memory']),
("06-rag-pipeline","RAG end to end with retrieval metrics","Chunker with overlap, BM25, vector index with metadata filters, RRF hybrid, reranker stage, grounded answer with citation checks, recall@k and MRR.","cd labs/06-rag-pipeline && python -m pytest -q",['rag1','rag2','rag3']),
("07-mcp-server-client","Real MCP server and client (official SDK v2)","Fleet tools, a resource and a prompt; tested in-process and over a real stdio subprocess.","cd labs/07-mcp-server-client && python -m pytest -q\npython client_demo.py",['mcp1','mcp2']),
("08-langgraph-hitl","LangGraph rollout agent with human approval","Typed state, conditional routing, InMemorySaver checkpoints, interrupt() and Command(resume=...).","cd labs/08-langgraph-hitl && python -m pytest -q",['frameworks','langgraph','durable']),
("09-multi-agent","Async orchestrator-worker","Parallel workers with asyncio, failure-tolerant fan-in, a shared token budget.","cd labs/09-multi-agent && python -m pytest -q",['multi']),
("10-evals","Eval harness and regression gate","Golden set, code graders, multi-trial pass rates, LLM-judge with position-swap check, CI gate exit code.","cd labs/10-evals && python -m pytest -q\npython gate.py   # exits 1 when the candidate regresses",['evals','judge']),
("11-security-guardrails","Policy engine, taint tracking, PII redaction","Tool permission policy, path sandbox, PII redaction, and an end-to-end injection test.","cd labs/11-security-guardrails && python -m pytest -q",['inject','guard']),
("12-production","Retries, rate limits, breaker, cache, tracing","Backoff with jitter and Retry-After (fake clock), token bucket, circuit breaker, fallback model, response cache, JSONL tracer, cost tracker.","cd labs/12-production && python -m pytest -q",['reliab','costlat','deploy','observe'])]
STATUS={}
tr=os.path.join(ROOT,'TEST_RESULTS.txt')
if os.path.exists(tr):
    for line in open(tr):
        m=re.match(r'^(\d\d-[\w-]+)\s+solution:\s+(\d+) passed',line)
        if m: STATUS[m.group(1)]=f"{m.group(2)} tests pass (solution)"
VIDS=[]
vj=os.path.join(ROOT,'videos','durations.json')
if os.path.exists(vj):
    for v in json.load(open(vj)):
        if v.get('lesson') in IDX: VIDS.append(dict(id=v['id'],t=v['title'],dur=v['dur'],l=IDX[v['lesson']]))
def strip_code(s): return re.sub(r'<pre>.*?</pre>|<code>.*?</code>|<h1>.*?</h1>|<summary>.*?</summary>','',s,flags=re.S)
def textonly(s): return H.unescape(re.sub(r'<[^>]+>',' ',strip_code(s)))
for i,l in enumerate(L):
    l['ch']=l['ch']; txt=textonly(l['d'])
    seen=[]
    for g in G:
        m=g['_rx'].search(txt)
        if m: seen.append((m.start(),g['k']))
    l['terms']=[k for _,k in sorted(seen)]
    # terms used only in the analogy also listed (chips run on body only)
    for g in G:
        if g['k'] not in l['terms'] and g['_rx'].search(textonly(l['an'])): l['terms'].append(g['k'])
    l.setdefault('q',[]); l.setdefault('th',[]); l.setdefault('anim',None); l.setdefault('lab',None)
    v=next((v for v in VIDS if v['l']==i),None); l['video']=dict(id=v['id'],t=v['t'],dur=v['dur']) if v else None
glossary=[dict(k=g['k'],t=g['t'],m=g['mean'],a=g['ana'],rx=g['rx'],ci=g['ci'],ls=[i for i,l in enumerate(L) if g['k'] in l['terms']]) for g in G]
def md(path):
    s=open(os.path.join(ROOT,path)).read()
    s=re.sub(r'L\((\d+)\)',lambda m:f'<a data-l="{int(m.group(1))-1}">L{m.group(1)}</a>',s)
    h=markdown.markdown(s,extensions=['tables'])
    h=re.sub(r'(https?://[^\s<|]+)',lambda m:m.group(1) if 'href' in m.string[max(0,m.start()-7):m.start()] else f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)[:60]}{"…" if len(m.group(1))>60 else ""}</a>',h)
    return h.replace('<table>','<div class="tbl"><table>').replace('</table>','</table></div>')
home=f'''<h1>Agentic AI Engineer: from zero to job-ready</h1>
<div class="plain"><h4>Who this is for</h4>An experienced C/C++/Java engineer (Linux, Android and embedded firmware) with no AI background, who wants to build production AI agents and pass Agentic AI Engineer interviews.</div>
<div class="why"><b>By the end you can:</b> explain how LLMs work without hand-waving; build agents from scratch and with LangGraph; build RAG with hybrid search and measure it; write MCP servers; design evals and regression gates; secure agents against prompt injection; run them reliably and cheaply in production; and walk an interviewer through an agentic system design.</div>
<div class="card"><b>How to use it</b><ul><li>Go in order. Each lesson opens with an everyday picture, then the precise meaning.</li><li>Highlighted words are tappable definitions. Every lesson has a "Words to know" box.</li><li>Do the lab for each chapter (Labs tab). Tests pass offline with a fake model; the READMEs show how to switch to a real API.</li><li>Watch the narrated video where a lesson has one.</li><li>Progress is saved in this browser.</li></ul></div>
<div class="small">{len(L)} lessons · {len(LABS)} labs · {len(VIDS)} videos · {len([g for g in glossary if g['ls']])} glossary terms · Built from 12 real job postings (Skills map tab).</div>'''
labsIntro='''<h1>Hands-on labs</h1><div class="plain"><h4>How the labs work</h4>Each lab has a <code>README.md</code>, a <code>starter/</code> folder with TODOs for you, a <code>solution/</code> reference, and <code>tests/</code>. By default the tests run against <b>starter</b>, so they fail until you implement it. Set <code>LAB_TARGET=solution</code> to see the reference pass. A fake LLM makes everything run offline with no API key. Labs 07 and 08 use the real <code>mcp</code> and <code>langgraph</code> libraries.</div>'''
data=dict(chapters=[dict(t=t,b=b,h=h) for t,b,h in CH],lessons=L,glossary=glossary,
  labs=[dict(id=a,t=b,what=c,run=d,ls=[IDX[x] for x in e],status=STATUS.get(a,'see TEST_RESULTS.txt')) for a,b,c,d,e in LABS],
  videos=VIDS,home=home,labsIntro=labsIntro,plan=md('LEARNING_PLAN.md'),skills=md('SKILLS_MAP.md'))
t=open(os.path.join(D0,'template.html')).read()
t=t.replace('/*DATA*/',json.dumps(data,ensure_ascii=False).replace('</','<\\/')).replace('/*WIDGETS*/',open(os.path.join(D0,'widgets.js')).read())
open(os.path.join(ROOT,'index.html'),'w').write(t)
missing=[l['anim'] for l in L if l['anim'] and ('W.'+l['anim']+'=') not in open(os.path.join(D0,'widgets.js')).read()]
print(len(L),'lessons',len(LABS),'labs',len(VIDS),'videos',len(t),'bytes; terms used',len([g for g in glossary if g['ls']]),'/',len(G),'; missing widgets',missing)
