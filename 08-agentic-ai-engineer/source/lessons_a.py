# Chapters 0-2: orientation, how LLMs work, using LLM APIs well
L=[]
def les(**k): L.append(k)

les(id='role',ch=0,t='What an Agentic AI Engineer actually builds',mins=15,
why='explain the job in one sentence, name the skills postings ask for, and know how this course gets you there.',
an=r'''<p>Think of a field service company. A <b>technician</b> gets a ticket ("unit 17 keeps rebooting"), opens a toolbox, tries something, looks at the result, and decides what to do next until the ticket is closed.</p>
<p>An agent is that technician made of software: a language model that reads the ticket and decides which tool to use next, plus <i>your code</i>, which owns the toolbox, runs every tool, enforces the rules and keeps the records. <b>Your job as an Agentic AI Engineer is to build the toolbox, the rules, the records and the tests</b>, so the technician is useful and cannot do damage.</p>''',
d=r'''<h3>The job in one sentence</h3>
<p>You build software in which a large language model (LLM) chooses some of the steps, and you make that software <b>reliable, measurable, safe and affordable</b> enough to run for real users.</p>
<p>That second half is most of the work. A demo agent takes an afternoon. A production agent takes testing, tracing, permissions, retries and cost control: classic engineering, which you already know.</p>

<h3>What real postings ask for</h3>
<p>We read twelve current postings (Chapter 12 and the Skills map tab list them with links). Almost every one asks for the same core list:</p>
<ul>
<li><b>Strong Python</b> and normal software craft: testing, typing, async code, code review.</li>
<li><b>LLM APIs</b>: messages, structured output, tool calling, streaming.</li>
<li><b>Agent building</b>: the loop, state, memory, planning, stopping rules, human approval steps.</li>
<li><b>RAG</b>: chunking, embeddings, hybrid search, reranking, vector databases.</li>
<li><b>MCP</b>: designing tools and building MCP servers.</li>
<li><b>One framework in depth</b>, LangGraph most often, plus awareness of the others.</li>
<li><b>Evals and observability</b>: golden sets, LLM-as-judge, regression gates, tracing.</li>
<li><b>Security</b>: prompt injection, least privilege, PII handling, guardrails.</li>
<li><b>Production</b>: containers, cloud, retries, rate limits, cost and latency trade-offs.</li>
</ul>
<p>The course has one chapter per line of that list.</p>

<h3>What you already have</h3>
<div class="fw"><b>Your firmware edge.</b> You already think in state machines, timeouts, retries, watchdogs, bounded buffers, interfaces you cannot trust, and "what happens when this fails at 3 a.m. in the field". Those are exactly the habits that separate a production agent engineer from a prompt tinkerer. Each lesson points out the link.</div>

<h3>What you do NOT need</h3>
<ul>
<li>You will not train models, and you do not need calculus. We use models through an API, the way you use a vendor's silicon through its datasheet.</li>
<li>You do not need to memorise every framework. Postings ask for depth in one and the judgement to pick.</li>
</ul>

<h3>How this course works</h3>
<ol>
<li>Every lesson opens with an everyday picture. Then comes the precise meaning.</li>
<li>Highlighted words can be tapped for a definition, and the Words-to-know box lists them all.</li>
<li>Each chapter has a runnable Python lab. The labs use a <b>fake LLM</b> so tests pass offline with no API key. The README shows how to switch to a real model.</li>
<li>Core concepts have narrated videos.</li>
<li>The last chapter is the job hunt itself: three portfolio projects, worked system-design answers, a coding drill and Q&amp;A.</li>
</ol>
<div class="key"><b>Realistic pace:</b> about 8–10 hours a week for 12 weeks (see the Plan tab). Build the labs and at least two capstones before you apply. Interviewers ask "show me something you built".</div>''',
q=[dict(q='Which part of an agent actually executes a tool such as "reboot device"?',o=['The language model','Your application code','The MCP protocol itself','The vector database'],a=1,w='The model only <i>asks</i> for a tool call in structured text. Your code decides whether to allow it, runs it, and returns the result. That is why permissions live in your code.'),
dict(q='Which skill appears in almost every agentic engineering posting besides Python?',o=['Training models from scratch','Evals and testing of LLM behaviour','CUDA kernel writing','Mobile UI design'],a=1,w='Evaluation (golden sets, regression tests, LLM-as-judge) shows up across nearly all postings because it is how teams prove an agent works.')],
th=[('Write the job in one sentence in your own words, then compare with the one above.','Something like: "I build systems where an LLM chooses some steps, and I make them reliable, safe, testable and cheap enough for production."')])

les(id='python',ch=0,t='Python for a C++/Java engineer, in one sitting',mins=40,
why='read and write the Python used in every lab: venv, dicts, f-strings, type hints, dataclasses, Pydantic, decorators, async/await and pytest.',
an=r'''<p>Moving from C++ to Python is like moving from hand-wiring a board to using a breadboard with labelled jumpers. You lose some control and speed. You gain enormous iteration speed, and for agent work most of the time is spent waiting on the network anyway.</p>
<p>The industry writes agents in Python (TypeScript is second), because every model provider ships its first and best library for Python.</p>''',
d=r'''<h3>1. Projects and packages</h3>
<pre><code>python3 -m venv .venv          # private package folder for this project
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest -q            # run the tests</code></pre>
<div class="fw"><b>Analogy:</b> the virtual environment is a per-project sysroot. pip is the package manager, a bit like apt but scoped to that sysroot.</div>

<h3>2. The core types you will see constantly</h3>
<pre><code>msg = {"role": "user", "content": "hi"}     # dict: like std::unordered_map / HashMap
history = [msg]                              # list: like std::vector / ArrayList
history.append({"role": "assistant", "content": "hello"})
name = "unit-17"; n = 3
print(f"{name} rebooted {n} times")         # f-string: formatted string, like std::format
for i, m in enumerate(history):              # index + item
    print(i, m["role"])
roles = [m["role"] for m in history]         # list comprehension: map in one line</code></pre>
<p>Agent code is mostly dicts and lists, because LLM APIs speak JSON, and JSON maps directly onto them: <code>json.loads(text)</code> gives you dicts and lists, and <code>json.dumps(obj)</code> goes back.</p>

<h3>3. Type hints and dataclasses</h3>
<pre><code>from dataclasses import dataclass

@dataclass
class Step:
    tool: str
    args: dict
    ok: bool = True

def run(step: Step) -> str:
    return f"ran {step.tool}"</code></pre>
<div class="py"><b>Python note:</b> <code>tool: str</code> is a hint, not a compile-time check. Python will happily pass an int. That is why libraries such as Pydantic exist: they check at run time. <code>@dataclass</code> writes the constructor and printing code for you, like a C++ aggregate with free <code>operator==</code>.</div>

<h3>4. Pydantic: a struct that validates itself</h3>
<pre><code>from typing import Literal
from pydantic import BaseModel

class Triage(BaseModel):
    severity: Literal["low", "medium", "high"]
    component: str

t = Triage.model_validate_json('{"severity": "high", "component": "usb"}')
print(t.severity)                      # "high"
Triage.model_json_schema()             # the matching JSON Schema, ready to send to an LLM
Triage.model_validate_json('{"severity": "urgent", "component": "usb"}')  # raises ValidationError</code></pre>
<p>You will use this pattern everywhere. It describes what you want from the model, and it checks what you got back.</p>

<h3>5. Decorators</h3>
<pre><code>TOOLS = {}
def tool(fn):                 # a function that receives a function
    TOOLS[fn.__name__] = fn   # register it
    return fn

@tool                         # same as: search_logs = tool(search_logs)
def search_logs(unit: int, pattern: str) -> list[str]:
    """Search one unit's logs for a pattern."""
    ...</code></pre>
<div class="fw"><b>Analogy:</b> like a macro that adds your ISR to the vector table. Agent libraries use <code>@tool</code> (or <code>@function_tool</code>, <code>@mcp.tool()</code>) and read the function's type hints and docstring (the text in triple quotes) to build the tool description for the model.</div>

<h3>6. async / await</h3>
<pre><code>import asyncio

async def ask(q: str) -> str:
    await asyncio.sleep(1)          # stands in for a network call to the model
    return q.upper()

async def main():
    a, b = await asyncio.gather(ask("x"), ask("y"))   # both run concurrently: ~1 s total, not 2
    print(a, b)

asyncio.run(main())</code></pre>
<div class="fw"><b>Analogy:</b> cooperative tasks on one core. <code>await</code> is "block on this queue and let another task run". It does not create threads. That is perfect for agents, which spend most of their time waiting on the network.</div>

<h3>7. Exceptions and context managers</h3>
<pre><code>try:
    data = json.loads(reply)
except json.JSONDecodeError as e:
    data = None                       # handle and move on
with open("trace.jsonl", "a") as f:   # 'with' closes the file automatically (RAII)
    f.write(json.dumps(event) + "\n")</code></pre>

<h3>8. Tests with pytest</h3>
<pre><code># test_tools.py: any function named test_* is a test
def test_search_finds_watchdog():
    assert "watchdog" in search_logs(17, "watchdog")[0]</code></pre>
<p>Run <code>python -m pytest -q</code>. A bare <code>assert</code> is enough, and pytest prints both sides when it fails.</p>

<h3>Gotchas that bite C++/Java people</h3>
<ul>
<li>Indentation is syntax. Use 4 spaces and never mix in tabs.</li>
<li>Never use a mutable default argument: write <code>def f(x=None)</code>, not <code>def f(x=[])</code>, because the list is shared between calls.</li>
<li>Integers never overflow; floats are C doubles.</li>
<li><code>is</code> compares identity (like comparing pointers). Use <code>==</code> for values.</li>
<li>Everything is a reference. <code>b = a</code> on a list does not copy; use <code>a.copy()</code>.</li>
</ul>
<p><b>TypeScript in one line:</b> it is JavaScript with type annotations, and agent SDKs for it (OpenAI Agents SDK, the MCP SDK, LangGraph.js) mirror the Python ones closely. Where it matters we show it.</p>''',
q=[dict(q='What does <code>@dataclass</code> above a class do?',o=['Makes fields private','Generates the constructor, equality and printing code from the field list','Enforces types at run time','Makes the class thread-safe'],a=1,w='It generates boilerplate. It does <i>not</i> check types at run time. Pydantic does that.'),
dict(q='You call two model APIs with <code>await asyncio.gather(a(), b())</code>. Each takes 2 s. Roughly how long does it take?',o=['4 s','2 s','1 s','It depends on the number of CPU cores'],a=1,w='Both waits overlap on one thread, so about 2 s. Cores do not matter because the time is spent waiting on the network, not computing.'),
dict(q='Why do agent libraries care about your function\'s type hints and docstring?',o=['For speed','They turn them into the tool\'s JSON Schema and description that the model reads','Python requires them','For logging'],a=1,w='<code>unit: int</code> becomes <code>{"type":"integer"}</code> in the schema, and the docstring becomes the description the model uses to choose the tool.')],
lab='Lab 00 has no code to write: run <code>labs/README.md</code> setup and <code>python -m pytest -q</code> to confirm your environment works.')

les(id='nexttoken',ch=1,t='What an LLM really is: next-token prediction',mins=30,
why='explain tokens, next-token prediction, and why "the model knows things" is the wrong mental model.',
an=r'''<p>Your phone keyboard suggests the next word. Tap the middle suggestion over and over and it writes a whole (silly) sentence.</p>
<p>An LLM is that same idea, trained on a huge share of the public internet, books and code, with billions of tuned numbers instead of a small table. It has one job: <b>given the text so far, guess the next piece of text</b>. It does that job well enough that answering questions, writing code and calling tools all fall out of it.</p>''',
d=r'''<h3>Step 1: text becomes tokens</h3>
<p>The model never sees letters. A fixed program called the tokenizer cuts text into tokens: common words are one token, and rare words or error codes are split into pieces. Each token becomes an integer ID.</p>
<div class="fw"><b>Firmware link:</b> it is a framing layer, like a USB packet or UART frame. The model can only "speak" in its own units. That is why it can struggle to count the letters in a word, because it never saw the letters.</div>
<p>A common rule of thumb for English text is about 4 characters, or three quarters of a word, per token. Code and other languages use more tokens. <b>Everything is priced and limited in tokens.</b></p>

<h3>Step 2: one forward pass gives probabilities</h3>
<p>The model reads all the tokens so far and outputs a score (logit) for <i>every</i> token in its vocabulary. A softmax step turns those scores into a probability distribution: "fail" 41%, "reset" 21%, and so on.</p>
<p>Inside, it is a transformer, a neural network whose attention layers let each token weigh every earlier token. You do not need the maths to build agents, but you should be able to say this sentence in an interview.</p>

<h3>Step 3: pick one, append, repeat</h3>
<p>One token is chosen (how is the next lesson), appended to the text, and the <b>whole thing runs again</b>. A 300-token reply means 300 passes. This explains three facts you will meet every day:</p>
<ul>
<li><b>Output is slower and pricier than input.</b> Input tokens are processed in one parallel pass. Output tokens are made one at a time, and providers price output tokens several times higher.</li>
<li><b>Streaming is natural.</b> Each token exists as soon as it is chosen, so APIs can send them as they come.</li>
<li><b>The model has no plan beyond the next token</b> unless it writes the plan out as text. That is why "think step by step" helps.</li>
</ul>

<h3>How a next-word guesser becomes an assistant</h3>
<ol>
<li><b>Pre-training</b>: predict the next token on trillions of tokens of text. The result is a "base model" that continues any text.</li>
<li><b>Post-training</b>: further training on example conversations and on human (or AI) preference ratings, so it continues text <i>as a helpful assistant would</i>, follows instructions and emits tool calls in a set format.</li>
</ol>
<p>A chat is therefore still a document being continued: <code>[system rules] [user turn] [assistant turn] ...</code> with special marker tokens between the turns. The API hides the markers, but it is all one token sequence.</p>

<h3>The mental model that keeps you out of trouble</h3>
<div class="key"><b>An LLM produces plausible text, not looked-up facts.</b> Plausible is usually correct for well-known things and often wrong for rare, recent or private things. Your engineering job is to feed it the right facts (RAG, tools) and to check what it outputs (schemas, evals).</div>''',
anim='nexttoken',
q=[dict(q='A reply is 400 tokens long. How many times does the model run its forward pass to produce it?',o=['Once','About 400 times, once per output token','4 times','It depends on the temperature'],a=1,w='Generation is a loop: one pass per new token, each time over the whole text so far. Caching inside the provider makes the later passes cheaper, but it is still one token per step.'),
dict(q='Why might an LLM miscount the letter "r" in "strawberry"?',o=['It is a bug in the tokenizer','It sees tokens (chunks), not individual letters','Temperature is too high','Its context window is too small'],a=1,w='The word reaches the model as one or a few token IDs. Letter-level facts are not directly visible to it.'),
dict(q='Which is usually priced higher per token?',o=['Input tokens','Output tokens','They are always equal','Neither, pricing is per request'],a=1,w='Output tokens are produced one at a time, so providers charge several times more for them. Check your provider\'s pricing page for exact numbers.')],
th=[('Using only this lesson, explain to a colleague why an LLM can write a working C function but invent a wrong register address for your SoC.','C functions are everywhere in the training text, so a plausible continuation is usually right. Your SoC\'s register map is rare or private, so a plausible-looking address is a guess. Give it the datasheet (RAG) or a lookup tool.')])

les(id='sampling',ch=1,t='Temperature, sampling, context window, cost and latency',mins=30,
why='choose temperature and token limits on purpose, size a context window, and estimate cost and latency before you build.',
an=r'''<p>Picture a weighted die with one face per candidate token. <b>Temperature</b> changes the weights: near zero, one face is so heavy it almost always wins; turn it up and the other faces start winning more often.</p>
<p>The <b>context window</b> is the microcontroller's RAM. Everything the model should consider in this call must fit: rules, history, documents and the reply itself. If it doesn't fit, it doesn't exist.</p>''',
d=r'''<h3>Choosing the next token</h3>
<ul>
<li><b>Greedy decoding</b>: always take the top token. Repeatable for the same input, but can loop or sound flat.</li>
<li><b>Sampling</b>: roll the die using the probabilities.</li>
<li><b>Temperature</b> divides the logits before the softmax. Below 1 sharpens the distribution, above 1 flattens it.</li>
<li><b>Top-p</b> keeps only the most likely tokens that together cover p (for example 0.9) and drops the long tail of weird options.</li>
</ul>
<p>Try it in the widget below: drag the temperature to 0.1 and sample several times (almost always the same token), then to 1.8 (variety, and nonsense creeps in).</p>
<div class="key"><b>Practical defaults:</b> use low temperature (0–0.3) for extraction, classification, tool-heavy agents and code. Use moderate temperature for brainstorming and writing. Two caveats: some reasoning models fix or ignore temperature, and even temperature 0 is <i>not guaranteed</i> to be identical run to run, because server-side batching and floating-point order vary. Design and test as if outputs vary, because they do.</div>

<h3>The context window</h3>
<p>Every model has a maximum context, today often 128k to 1M tokens for large hosted models. Three engineering consequences:</p>
<ol>
<li><b>Cost scales with input size on every call.</b> An agent that re-sends a 30k-token history at each of 10 steps pays for 300k input tokens.</li>
<li><b>Bigger is not automatically better.</b> Research such as "Lost in the Middle" (Liu et al., 2023) found models use facts at the start and end of a long context better than facts buried in the middle. Curating context beats dumping everything in.</li>
<li><b>Output is also capped</b> by max output tokens. If the reply hits the cap, the stop reason tells you it was cut off. Check it, especially for JSON, which becomes invalid when cut.</li>
</ol>

<h3>Latency: what users feel</h3>
<ul>
<li><b>TTFT</b> (time to first token) grows with input length and model size.</li>
<li><b>Output speed</b> (tokens per second) multiplied by reply length gives the rest. A 500-token answer at 50 tokens/s adds 10 s.</li>
<li>An agent's latency is the <b>sum of every model call and tool call</b> in its loop. Five steps of 3 s each is a 15 s task, which is why we stream progress and run independent steps in parallel.</li>
</ul>
<div class="fw"><b>Firmware link:</b> this is a timing budget. Measure p50 and p95 (the time half and 95% of requests beat) per step, just like ISR latency, and give every step a timeout.</div>

<h3>Cost: a back-of-envelope you should be able to do in an interview</h3>
<p>cost per task = Σ over model calls of (input tokens × input price + output tokens × output price).</p>
<p>Use the calculator in Chapter 10 with your provider's real prices. The point is the <b>shape</b>: agents multiply input tokens by the number of steps, so trimming context and cutting steps is usually the biggest lever.</p>''',
anim='ctxbudget',
lab='Lab 01 (<code>labs/01-llm-basics</code>): implement softmax with temperature, top-p filtering and sampling, train a tiny bigram next-token model on firmware logs, and estimate token cost.',
q=[dict(q='You need the model to extract fields from invoices into JSON. Which temperature makes most sense?',o=['0–0.3','1.0','1.5–2.0','Temperature does not matter for JSON'],a=0,w='Extraction wants the most likely, consistent answer. Combine low temperature with structured output (next chapter).'),
dict(q='Your agent\'s replies sometimes end mid-JSON. What do you check first?',o=['The temperature','The stop reason, which likely says the max output token limit was hit','The tokenizer','The embedding model'],a=1,w='A cut-off reply reports a "max tokens" or "incomplete" stop reason. Raise the limit, ask for shorter output, or use strict structured output.'),
dict(q='Each step of an 8-step agent sends ~20k input tokens and gets ~300 output tokens. Roughly how many input tokens are billed per task?',o=['20k','160k','2.4k','300'],a=1,w='8 × 20k = 160k input tokens. History re-sent at every step dominates agent cost, so prompt caching and trimming matter (Chapter 10).')])

les(id='embed',ch=1,t='Embeddings and vector similarity: meaning as coordinates',mins=30,
why='explain what an embedding is, compute cosine similarity by hand, and know when embedding search beats grep (and when it loses).',
an=r'''<p>Imagine a map where every sentence has GPS coordinates, and sentences that <i>mean</i> similar things are placed close together. "USB device not detected" sits next to "host does not enumerate the gadget", even though they share almost no words. A recipe sits in another city.</p>
<p>An <b>embedding</b> is those coordinates: a list of numbers produced by an embedding model. Searching by meaning becomes "find the nearest points on the map".</p>''',
d=r'''<h3>What it is, precisely</h3>
<p>An embedding model takes text and returns a vector of a fixed size, often several hundred to a few thousand dimensions, for example <code>float v[1024]</code>. It was trained so that texts with similar meaning get vectors that point in similar directions.</p>
<p>It is a different model from the chat LLM. It is smaller, cheaper and does one thing.</p>

<h3>Measuring "close": cosine similarity</h3>
<p>cos(a, b) = (a · b) / (|a| × |b|). The dot product is divided by both lengths, so only the <i>direction</i> counts. The result is 1 for the same direction, 0 for unrelated, and −1 for opposite.</p>
<pre><code>import math
def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(y*y for y in b)))

cosine([1, 0], [1, 0])   # 1.0
cosine([1, 0], [0, 1])   # 0.0
cosine([3, 4], [6, 8])   # 1.0  (same direction, different length)</code></pre>
<div class="py"><b>Python note:</b> <code>zip(a, b)</code> walks two lists in lockstep, like two iterators advanced together. For real workloads you would use numpy: <code>a @ b / (norm(a) * norm(b))</code>. Many embedding APIs return vectors already scaled to length 1, and then cosine is just the dot product.</div>

<h3>Getting real embeddings</h3>
<pre><code>from openai import OpenAI
client = OpenAI()
r = client.embeddings.create(model=EMBED_MODEL, input=["USB device not detected", "host won't enumerate"])
vecs = [d.embedding for d in r.data]</code></pre>
<p>Other providers and open-weight embedding models work the same way: text in, vector out. <b>Rule:</b> vectors from different embedding models are not comparable. If you switch models, you re-embed everything.</p>

<h3>Where embeddings shine, and where they fail</h3>
<div class="tbl"><table><tr><th>Good at</th><th>Bad at</th></tr>
<tr><td>Paraphrases: "won't charge" ≈ "fails to take power"</td><td>Exact identifiers: error <code>-71</code>, part number <code>LT6911UXC</code>, a function name</td></tr>
<tr><td>Cross-wording search over docs, tickets, logs</td><td>Negation and fine logic: "supports USB 3" vs "does not support USB 3" can land close</td></tr>
<tr><td>Grouping and deduplicating similar items</td><td>Very short queries with little meaning to embed</td></tr></table></div>
<p>That right-hand column is why production search is usually <b>hybrid</b> (embeddings plus keyword search), which is Chapter 4.</p>
<div class="fw"><b>Firmware link:</b> think of an embedding as a feature vector from a DSP front end, with similarity search as matched filtering. It is great at "sounds like", but you still need an exact-match path for IDs.</div>''',
anim='embed',
q=[dict(q='Two vectors are [2, 0] and [5, 0]. Their cosine similarity is…',o=['0.4','1.0','0','2.5'],a=1,w='Same direction, so 1.0. Length does not matter for cosine.'),
dict(q='Your team swapped to a newer embedding model for new documents only. Search quality collapsed. Why?',o=['The new model is worse','Old and new vectors live in different "maps" and cannot be compared, so re-embed everything','Cosine only works on short text','The vector database is full'],a=1,w='Each embedding model defines its own coordinate system. Mixing them makes distances meaningless.'),
dict(q='A user searches for "error -71". Pure embedding search returns generic USB articles. What is the usual fix?',o=['Higher temperature','Add keyword search (BM25) and merge results: hybrid search','Use bigger chunks','Use a reasoning model'],a=1,w='Exact tokens like error codes are what keyword search is best at. Hybrid search merges both lists.')],
lab='Lab 02 (<code>labs/02-embeddings</code>): implement cosine similarity and nearest-neighbour search over a small offline embedder, then (optionally) swap in a real embedding API.')

les(id='halluc',ch=1,t='Why models hallucinate, and what they are good and bad at',mins=25,
why='predict where an LLM will fail, and pick the right mitigation (grounding, tools, schemas, evals) instead of hoping.',
an=r'''<p>Picture a brilliant colleague with no internet access and a habit: when they don't know something, they don't say "I don't know". They give the most plausible-sounding answer, confidently.</p>
<p>That is not lying. It is exactly what a next-token predictor does when it has no real signal: it emits the most typical-looking continuation. That confident wrong answer is called a <b>hallucination</b>.</p>''',
d=r'''<h3>Why it happens</h3>
<ul>
<li><b>The objective is plausibility.</b> Training rewards text that looks like the training data, not text that was checked.</li>
<li><b>Rare and private facts are weakly stored.</b> Famous facts appear thousands of times; your SoC's errata appear zero times.</li>
<li><b>Knowledge cutoff.</b> The model knows nothing newer than its training data unless you supply it.</li>
<li><b>Pressure to answer.</b> Assistant-style training often makes answering more likely than refusing.</li>
</ul>

<h3>The reliability map</h3>
<div class="tbl"><table><tr><th>Usually strong</th><th>Usually weak without help</th></tr>
<tr><td>Summarising and rewriting text you provide</td><td>Exact facts it was not given: versions, prices, register addresses</td></tr>
<tr><td>Extracting fields into a schema</td><td>Arithmetic on long numbers, counting</td></tr>
<tr><td>Writing common code and explaining errors</td><td>Recent events after the cutoff</td></tr>
<tr><td>Classifying, routing, choosing a tool</td><td>Long chains of steps with no checking</td></tr>
<tr><td>Following a clear format with examples</td><td>Knowing when it does not know</td></tr></table></div>

<h3>Mitigations that work (in order of power)</h3>
<ol>
<li><b>Grounding</b>: put the real source text in the prompt (RAG) and require citations of chunk IDs. Then <i>verify the citations exist</i> in code.</li>
<li><b>Tools for facts and maths</b>: let the model call <code>get_device_status()</code> or a calculator instead of remembering.</li>
<li><b>Allow "I don't know"</b> explicitly in instructions, and make it an allowed value in the schema (for example <code>"answer": null, "reason": "not in sources"</code>).</li>
<li><b>Structured output and validation</b>, so malformed or out-of-range answers are caught by code.</li>
<li><b>Evals</b> that measure the hallucination rate on your own cases (Chapter 8), so you know whether a change helped.</li>
</ol>
<div class="warn"><b>What does NOT reliably work:</b> writing "do not hallucinate" in the prompt, or asking the model "are you sure?" and trusting the answer. Checks must come from outside the model: sources, tools, validators and tests.</div>
<div class="fw"><b>Firmware link:</b> treat model output like data from an untrusted bus. Bounds-check it, validate it and never act on it blindly, just as you never trust a descriptor length from the wire.</div>''',
q=[dict(q='Which is the strongest defence against an agent inventing a device\'s firmware version?',o=['"Never make things up" in the system prompt','A get_device_status tool and an instruction to report only tool results','Lower temperature','A bigger model'],a=1,w='Give it a source of truth. Prompts and temperature reduce the problem but don\'t remove it.'),
dict(q='An answer cites chunk "doc-7#3", but your retrieval only returned doc-2 and doc-5. What should your code do?',o=['Trust it; the model knows','Flag or reject the answer: the citation is fabricated','Raise the temperature and retry','Nothing'],a=1,w='Citations are checkable. Verifying them in code is a cheap, strong guard.')],
th=[('List three tasks in your current firmware job where an LLM would be reliable, and three where it would need tools or grounding.','Reliable: summarising a long dmesg, drafting a commit message from a diff, explaining a compiler error. Needs help: the exact DWC3 register for a quirk (datasheet RAG), the build status of a branch (CI tool), whether a fix is in release 3.8.1 (release-notes search).')])

les(id='apis',ch=2,t='Calling an LLM API: messages, roles, streaming',mins=35,
why='make a real call to the OpenAI and Anthropic APIs, hold a multi-turn conversation, stream output and read the stop reason.',
an=r'''<p>Calling an LLM is like a stateless RPC to a very smart server that has amnesia. Each request must carry the whole conversation so far, every time. There is no "session" on its side unless you use a feature that stores it for you.</p>
<p>The request is a <b>transcript</b>: lines tagged with who said them (system, user, assistant, tool). The reply is the next line.</p>''',
d=r'''<h3>Message roles</h3>
<ul>
<li><b>system</b> (called <code>instructions</code> in OpenAI's Responses API, <code>system</code> in Anthropic's Messages API) holds your rules: role, tone, format, what tools are for. Users don't see it.</li>
<li><b>user</b> is what the person typed.</li>
<li><b>assistant</b> holds the model's previous replies, which you resend.</li>
<li><b>tool</b> results are what your code sends back after running a tool (Chapter 3).</li>
</ul>

<h3>Your first call, two providers</h3>
<pre><code># pip install openai   ;  export OPENAI_API_KEY=...
from openai import OpenAI
client = OpenAI()
resp = client.responses.create(
    model=MODEL,                      # pick a current model name from the provider's model list
    instructions="You are a terse firmware assistant.",
    input="What does USB error -71 usually mean on Linux?",
)
print(resp.output_text)</code></pre>
<pre><code># pip install anthropic ;  export ANTHROPIC_API_KEY=...
import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(
    model=MODEL, max_tokens=500,
    system="You are a terse firmware assistant.",
    messages=[{"role": "user", "content": "What does USB error -71 usually mean on Linux?"}],
)
print(msg.content[0].text, msg.stop_reason)</code></pre>
<div class="py"><b>Python note:</b> <code>OpenAI()</code> reads the key from the environment, so never paste keys into code. <code>MODEL</code> is a string such as the provider's current model ID. We deliberately don't hard-code one because names change every few months.</div>

<h3>Multi-turn: you keep the history</h3>
<pre><code>history = [{"role": "user", "content": "My bar fails to enumerate."}]
reply = call_model(history)                       # your wrapper around either SDK
history.append({"role": "assistant", "content": reply})
history.append({"role": "user", "content": "It only happens after suspend."})
reply = call_model(history)                       # the model sees all 3 messages</code></pre>
<p>OpenAI's Responses API can also store the conversation server-side (<code>previous_response_id</code>), which saves resending. Knowing that the model itself is stateless is still what lets you debug, trim and test conversations.</p>

<h3>Streaming</h3>
<pre><code># Anthropic
with client.messages.stream(model=MODEL, max_tokens=500, messages=history) as s:
    for text in s.text_stream:
        print(text, end="", flush=True)

# OpenAI Responses
for event in client.responses.create(model=MODEL, input="...", stream=True):
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)</code></pre>
<p>Under the hood this is SSE (server-sent events): one HTTP response that keeps delivering small chunks. Streaming cuts <i>perceived</i> latency, since the first words appear at TTFT, but not total time.</p>

<h3>Read the reply's metadata, every time</h3>
<ul>
<li><b>Stop reason</b>: finished, hit max tokens, or wants a tool.</li>
<li><b>Usage</b>: input and output token counts. Log them for cost tracking.</li>
<li><b>Errors</b>: 429 means rate limited (retry with backoff); 5xx means a provider problem (retry); 400 means your request is wrong (do not retry).</li>
</ul>
<div class="key"><b>Engineering habit:</b> wrap the SDK in one small function of your own (<code>call_model(messages, tools, schema)</code>). Tests can swap in a fake, you can switch providers, and retries and logging live in one place. Every lab in this course does this.</div>''',
q=[dict(q='Your chatbot "forgets" what the user said two turns ago. Most likely cause?',o=['The model\'s memory is full','Your code isn\'t resending the earlier messages','Temperature too low','The tokenizer dropped them'],a=1,w='The API is stateless. If you don\'t send the history (or use a server-side conversation feature), the model never sees it.'),
dict(q='The API returns HTTP 400. Should you retry automatically?',o=['Yes, with backoff','No: the request itself is invalid, so fix it','Yes, immediately, 10 times','Only at night'],a=1,w='4xx (except 429, and sometimes 408) means your request is wrong; retrying sends the same bad request. Retry 429 and 5xx with backoff.'),
dict(q='What does streaming improve?',o=['Total generation time','Time until the user sees the first words','Accuracy','Cost'],a=1,w='The total time is the same, but users see progress at TTFT instead of waiting for the end.')],
lab='Lab 03 (<code>labs/03-llm-api-structured</code>) builds your provider-agnostic <code>call_model()</code> wrapper with a fake backend, plus real OpenAI/Anthropic adapters you can switch on with an environment variable.')

les(id='structured',ch=2,t='Structured output: making the model fill in a form',mins=30,
why='get machine-readable JSON reliably using schemas, strict modes, validation and a repair loop.',
an=r'''<p>Ask a new hire to "write up the bug" and you get an essay. Hand them a form with labelled boxes (severity, component, summary) and you get something the next system can process.</p>
<p><b>Structured output</b> is the form: you give the model a JSON Schema and it must reply with JSON that fits. It is how LLM output becomes input to normal code.</p>''',
d=r'''<h3>Three levels of "please reply in JSON"</h3>
<ol>
<li><b>Ask nicely</b> in the prompt and parse. This works most of the time, which is not good enough: you will get prose around the JSON, trailing commas, or missing fields.</li>
<li><b>JSON mode</b> guarantees syntactically valid JSON, but not your fields.</li>
<li><b>Schema-constrained (strict) output</b>: the provider constrains generation so only tokens that keep the JSON valid against your schema can be picked. This is the best option when your provider and schema support it.</li>
</ol>

<h3>Define once with Pydantic, use everywhere</h3>
<pre><code>from typing import Literal
from pydantic import BaseModel, Field

class Triage(BaseModel):
    severity: Literal["low", "medium", "high"]
    component: Literal["usb", "camera", "audio", "network", "other"]
    summary: str = Field(description="One sentence, under 25 words")
    needs_human: bool</code></pre>
<pre><code># OpenAI: parse straight into the class
resp = client.responses.parse(model=MODEL, input=log_text, text_format=Triage)
t: Triage = resp.output_parsed

# Anthropic: pass the JSON Schema in output_config
msg = client.messages.create(model=MODEL, max_tokens=400, messages=[{"role": "user", "content": log_text}],
    output_config={"format": {"type": "json_schema", "schema": Triage.model_json_schema()}})
t = Triage.model_validate_json(msg.content[0].text)</code></pre>
<p>Strict modes support only part of JSON Schema. Each provider documents its limits (for example, which keywords are allowed and that all fields must be required). Keep schemas simple: flat objects, enums and short descriptions.</p>

<h3>Always validate anyway, and repair once</h3>
<pre><code>def get_structured(messages, model_cls, retries=2):
    for attempt in range(retries + 1):
        text = call_model(messages)
        try:
            return model_cls.model_validate_json(text)
        except ValidationError as e:
            messages = messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": f"That JSON was invalid: {e}. Reply with corrected JSON only."}]
    raise RuntimeError("model never produced valid output")</code></pre>
<div class="fw"><b>Firmware link:</b> this is a CRC check plus NAK and resend, with a retry limit, so a bad sender cannot hang you.</div>

<h3>Schema design tips that change results</h3>
<ul>
<li><b>Enums beat free text</b> for anything code will branch on.</li>
<li><b>Field descriptions are prompt text.</b> The model reads them, so write them carefully.</li>
<li><b>Order matters.</b> Put a short <code>reasoning</code> field <i>before</i> the decision field if you want the model to think before choosing, because generation runs left to right.</li>
<li><b>Allow "unknown"</b> (a null or an <code>"other"</code> enum) so the model is not forced to invent.</li>
</ul>''',
anim='structured',
q=[dict(q='JSON mode is on, but your code crashes because "component" is missing. Why?',o=['JSON mode is broken','JSON mode guarantees valid JSON syntax, not your schema\'s fields','Temperature too high','The model is too small'],a=1,w='Use schema-constrained output where available, and always validate with Pydantic.'),
dict(q='You want the model to weigh evidence before picking severity. Where do you put a "reasoning" field?',o=['After severity','Before severity','In a separate call','Nowhere; reasoning is hidden'],a=1,w='Generation goes left to right, so a reasoning field before the decision lets the decision depend on it. (Reasoning models also think internally.)')],
lab='Lab 03 tests: validate fake-model outputs against a Pydantic schema and implement the repair loop (invalid JSON → error message → corrected reply).')

les(id='prompting',ch=2,t='Prompt and context engineering that actually works',mins=35,
why='write system prompts and tool descriptions that measurably improve results, and know which "prompt tricks" are folklore.',
an=r'''<p>A prompt is a work order for a contractor who is brilliant, literal and has never been to your site. Vague orders get confident guesses. Good orders state the goal, the constraints, what "done" looks like, and include an example of a finished job.</p>
<p><b>Context engineering</b> is the larger job: deciding what goes into the context window on each call, including instructions, tools, retrieved facts and trimmed history.</p>''',
d=r'''<h3>A system prompt template that works</h3>
<pre><code>You are a USB-stack triage assistant for HP Poly video bars.

Goal: given kernel logs, identify the most likely failing component and next diagnostic step.

Rules:
- Use only the log lines and tool results provided. If evidence is missing, say what you need.
- Never suggest flashing firmware; a human does that.
- Quote the exact log lines that support your conclusion.

Output: JSON matching the provided schema. Keep "summary" under 25 words.

Example:
Input: "dwc3 a600000.usb: timed out waiting for SETUP phase"
Output: {"component": "usb", "severity": "high", "summary": "Device controller stuck before control transfer", ...}</code></pre>
<p>Notice the parts: <b>role, goal, rules (including what to do when unsure), output format, one example</b>.</p>

<h3>Techniques with real evidence behind them</h3>
<ul>
<li><b>Be specific and explicit.</b> State length, audience, format and what to avoid. This is the biggest win.</li>
<li><b>Few-shot examples</b>: 1–5 short, varied examples of input and output. Make them vary, or the model copies their quirks.</li>
<li><b>Give it room to think</b> on multi-step problems: "first list the relevant log lines, then conclude". This is chain of thought. Reasoning models do it internally, so don't micro-manage them.</li>
<li><b>Separate instructions from data</b> with clear delimiters (XML-style tags like <code>&lt;logs&gt;...&lt;/logs&gt;</code> are common). This helps quality and is a small, partial safety aid (Chapter 9).</li>
<li><b>Put long documents first and the question last</b> in very long prompts. Providers recommend this for long-context use.</li>
<li><b>Prompt chaining</b>: split a hard task into steps with code checks in between, instead of one mega-prompt.</li>
</ul>
<h3>Folklore to ignore</h3>
<ul><li>Bribes, threats, "you are the world's best expert", or ALL CAPS shouting. Results are inconsistent, and modern models over-react to shouting.</li>
<li>Trusting a prompt change because one example looked better. <b>Measure it on an eval set</b> (Chapter 8).</li></ul>

<h3>Tool descriptions are prompts too</h3>
<p>When the model picks the wrong tool, the fix is usually the tool's name, description or parameter descriptions, not the system prompt. Compare:</p>
<pre><code>BAD : name="query", description="Runs a query"
GOOD: name="search_device_logs",
      description="Search kernel/app logs of ONE device by regex. Use for questions about errors,
                   reboots or crashes on a specific unit. Returns at most 50 matching lines, newest first.",
      parameters: unit_id (integer, the unit's serial-suffix ID), pattern (regex), since (ISO time, optional)</code></pre>

<h3>Context engineering: the agent-era skill</h3>
<p>In an agent, the context is rebuilt on every step. Decide deliberately:</p>
<ul><li>Which tools are visible <i>now</i>? Fewer, well-described tools mean better choices.</li>
<li>How much history to keep, and when to summarise older turns (compaction)?</li>
<li>Which retrieved chunks, how many, and in what order?</li>
<li>What state to inject: the plan, the step count, what has been tried already.</li></ul>
<div class="fw"><b>Firmware link:</b> this is like deciding what goes in a tiny SRAM on every context switch. Load what this step needs and evict the rest.</div>''',
q=[dict(q='Your agent keeps calling <code>reboot_device</code> when users ask about logs. Best first fix?',o=['Add "DON\'T REBOOT!!!" to the system prompt','Rewrite both tools\' names and descriptions to state exactly when to use each, and gate reboot behind approval','Raise temperature','Switch frameworks'],a=1,w='Tool selection is driven by the tool descriptions. Destructive tools should also need approval regardless of wording.'),
dict(q='You changed the prompt and three examples look better. What next?',o=['Ship it','Run the eval set and compare pass rates with the old prompt','Ask the model if it is better','Increase max tokens'],a=1,w='Three examples are anecdotes. A golden set shows whether it helped overall and whether anything broke.')],
th=[('Rewrite this vague prompt: "Summarise this log."','"You are a firmware engineer\'s assistant. Summarise the kernel log below for an on-call engineer in at most 5 bullet points: the first error, the subsystem, any repeated pattern with counts, and the last state before reboot. Quote exact lines. If no error is present, say so. &lt;log&gt;...&lt;/log&gt;"')])
