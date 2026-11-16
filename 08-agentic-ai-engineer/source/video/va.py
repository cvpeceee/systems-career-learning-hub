from common import S, V
V = [
V('a01-what-agent-engineers-build', 'Agentic AI · 1', 'What an agent engineer actually builds', [
S('title', items=['A chatbot versus an agent', 'One agent run, step by step', 'What employers ask for'], say=[
  "Welcome. In this first video: the difference between a chat assistant and software that acts on its own, what one run looks like, and what employers ask for."]),
S('analogy', 'Chatbot versus agent', items=[
  'A chatbot answers once, from what the model already knows',
  'An agent takes a goal, calls tools, reads the results and keeps going',
  'You build everything around the model: the loop, the tools, the limits and the checks'], say=[
  "Let's separate two words people mix up.",
  "A chatbot answers once, from what the model already learned. It is like asking a colleague a question across the desk.",
  "An agent is given a goal. It decides which tools to call, reads what comes back, and keeps going until the goal is met, like a technician working through a troubleshooting checklist.",
  "And you, the engineer, build everything around the model: the loop, the tools, the limits and the checks."]),
S('flow', 'One agent run', items=['Goal arrives from a user', 'Model picks the next step', 'Your code runs the tool', 'Result goes back to the model', 'Repeat until done, or a limit trips'],
  subs=['"Why did D1 reboot?"', 'call search_logs', 'checked, then executed', 'log lines as text', 'step and cost limits'], say=[
  "Here is one run of the agent from the story, step by step.",
  "A goal arrives from a user.",
  "The model reads it and picks the next step, for example: call the log search tool for D1.",
  "Your code checks that request and runs the tool. The model never touches your systems directly.",
  "The result goes back to the model as text.",
  "And the cycle repeats until the model gives a final answer, or one of your limits stops it. That cycle is called the agent loop, and you will write it yourself in lab five."]),
S('bullets', 'What the job postings ask for', items=[
  'Python, and calling model APIs well',
  'Tool calling and frameworks such as LangGraph',
  'RAG: answering from company documents',
  'Evals and observability: proving it works',
  'Security and production reliability'], say=[
  "We read twelve current agentic engineer job postings. The same skills came up again and again.",
  "Python, and calling model APIs well.",
  "Tool calling, and agent frameworks such as LangGraph.",
  "RAG, which means answering from your company's own documents instead of the model's memory.",
  "Evals and observability, which means measuring quality and seeing inside every run.",
  "And security plus production reliability. Each of these is a chapter, and each has a lab."]),
S('icons', 'Your firmware background transfers', items=[('chip', 'State machines', 'become agent graphs'), ('clock', 'Watchdog timers', 'become step limits'), ('bug', 'Logic analyser captures', 'become traces'), ('lock', 'Memory protection', 'becomes tool permissions')], say=[
  "Good news: you already know the hard parts, under different names.",
  "State machines become agent graphs.",
  "Watchdog timers become step and cost limits.",
  "Logic analyser captures become traces of every model and tool call.",
  "And memory protection becomes tool permissions. Throughout the course, every new idea is tied back to one of these."]),
S('recap', 'Recap', items=['An agent pursues a goal by calling tools in a loop', 'The model suggests; your code decides and executes', 'Postings want APIs, tools, RAG, evals, safety', 'Your firmware instincts map directly'], say=[
  "Recap.",
  "An agent pursues a goal by calling tools in a loop.",
  "The model only suggests. Your code decides and executes.",
  "Employers want model APIs, tools, RAG, evals and safety.",
  "And your firmware instincts map directly onto all of it. Next: how a language model produces text at all."]),
]),
V('a02-how-llms-generate', 'Agentic AI · 2', 'How a language model writes, one token at a time', [
S('title', items=['Tokens', 'Next-token prediction', 'Temperature and top-p'], say=[
  "How does a chatbot actually write its answers? Three ideas, one at a time."]),
S('analogy', 'Autocomplete, scaled up', items=[
  'Your phone suggests the next word from the last few',
  'An LLM does the same, using thousands of words of context',
  'Text is split into tokens: words or word pieces with ID numbers'], say=[
  "Start with something familiar.",
  "Your phone keyboard suggests the next word, based on the last few words you typed.",
  "A large language model, or LLM, does the same thing, but it looks at thousands of words of context and has learned from a huge amount of text.",
  "It does not see letters. Text is first split into tokens, which are whole words or pieces of words, each with an ID number. Pricing and limits are counted in tokens too."]),
S('flow', 'One step of generation', items=['Read all the tokens so far', 'Score every possible next token', 'Turn scores into probabilities', 'Pick one token', 'Append it and repeat'],
  subs=['"The dock is not"', 'detected: 4.1, working: 3.2 ...', 'detected 62%, working 25% ...', 'random draw', 'until a stop token'], say=[
  "Here is one step, in slow motion.",
  "The model reads every token so far, for example: the dock is not.",
  "It gives every possible next token a score. Detected scores high, banana scores very low.",
  "A function called softmax turns those scores into probabilities that add up to one hundred percent.",
  "Then one token is picked, at random, weighted by those probabilities.",
  "It is appended, and the whole thing runs again for the next token. A long answer is just this loop, hundreds of times."]),
S('bullets', 'The two randomness knobs', items=[
  'Temperature low: the top choice wins almost always',
  'Temperature high: more variety, more risk',
  'Top-p: only sample from the likeliest tokens covering p of the probability',
  'For agents and tools: keep it low and validate outputs'], say=[
  "That random pick is why the same question can get two answers. Two settings control it.",
  "Temperature. Low temperature sharpens the probabilities, so the top choice wins almost every time.",
  "High temperature flattens them, so you get more variety, and more mistakes.",
  "Top p keeps only the most likely tokens whose probabilities add up to p, say ninety percent, and samples from those.",
  "For agents that call tools, keep the randomness low and still validate every output, because a low setting reduces variation but does not prove correctness."]),
S('analogy', 'Why models make things up', items=[
  'The model always produces the most plausible next token',
  'Plausible is not the same as true',
  'Fix: give it the facts (RAG, tools) and check its claims'], say=[
  "One more consequence of next token prediction.",
  "The model always produces the most plausible continuation, whether or not it knows the answer.",
  "Plausible is not the same as true. A confident made-up answer is called a hallucination. It is like a technician who never says I don't know.",
  "The fix is not a better question. You give the model real facts through tools and document search, and you check what it claims. That is most of this course."]),
S('recap', 'Recap', items=['Text becomes tokens with ID numbers', 'The model scores every next token, then one is sampled', 'Temperature and top-p control randomness', 'Plausible is not true: ground and verify'], say=[
  "Recap.",
  "Text becomes tokens with ID numbers.",
  "At each step the model scores every possible next token, and one is sampled.",
  "Temperature and top p control how random that choice is.",
  "And plausible is not true, so we ground answers in real data and verify them. Lab one has you build all of this by hand."]),
]),
V('a03-embeddings', 'Agentic AI · 3', 'Embeddings: searching by meaning', [
S('title', items=['A map of meaning', 'Measuring closeness', 'Where it fails'], say=[
  "This video is about how software can search by meaning instead of exact words."]),
S('analogy', 'GPS coordinates for meaning', items=[
  'An embedding model turns text into a list of numbers',
  'Similar meanings land close together',
  'Search = find the nearest points to your question'], say=[
  "Imagine every sentence has a location on a giant map, where sentences that mean similar things sit near each other.",
  "An embedding model turns a piece of text into a list of numbers, often hundreds or a few thousand of them. That list is the text's coordinates on the map.",
  "Dock not detected after sleep, and my computer can't see the gadget once it wakes, land close together, even though they share almost no words.",
  "So search becomes geometry: turn the question into coordinates, and find the nearest stored texts."]),
S('flow', 'Semantic search in four steps', items=['Embed every document chunk once', 'Store the vectors in an index', 'Embed the question', 'Return the nearest vectors'],
  subs=['offline, ahead of time', 'a vector database', 'same embedding model', 'by cosine similarity'], say=[
  "Here is the whole pipeline.",
  "Ahead of time, you embed every chunk of every document once.",
  "You store those vectors in an index, often inside a vector database.",
  "When a question arrives, you embed it with the same model.",
  "And you return the stored vectors closest to it. Closeness is usually measured with cosine similarity, which checks whether two arrows point in the same direction, ignoring their length."]),
S('bullets', 'Where embeddings struggle', items=[
  'Rare exact strings: error codes, part numbers, versions',
  'Keyword search (BM25) nails those',
  'Production systems run both and merge the results',
  'Then measure: did the right document make the top results?'], say=[
  "Embeddings are not magic. Here is where they struggle.",
  "Rare exact strings, like the error code E-4012 or a part number, get blurred, because the model learned meaning, not serial numbers.",
  "Classic keyword search, such as BM25, matches those exactly.",
  "So production systems run both searches and merge the two result lists. That combination is called hybrid search.",
  "And you measure it: for a set of real questions, did the right document make the top results? In lab six, hybrid search beats either method alone on exactly this kind of data."]),
S('recap', 'Recap', items=['An embedding is coordinates on a map of meaning', 'Search = nearest vectors, by cosine similarity', 'Exact codes need keyword search too', 'Measure retrieval, do not guess'], say=[
  "Recap.",
  "An embedding is a text's coordinates on a map of meaning.",
  "Semantic search finds the nearest vectors, usually by cosine similarity.",
  "Exact codes and part numbers need keyword search as well.",
  "And you measure retrieval quality instead of guessing. Lab two builds this from scratch."]),
]),
V('a04-calling-a-model', 'Agentic AI · 4', 'Calling a model API, and getting reliable output', [
S('title', items=['Messages and roles', 'Why the API forgets', 'Structured output'], say=[
  "Time to send a first real request, see why the reply can forget everything, and get output your code can trust."]),
S('seq', 'One request, one response', lanes=['Your code', 'Model API'], msgs=[(0, 1, 'system + user messages'), (1, 0, 'reply text + token usage'), (0, 0, 'append reply to history'), (0, 1, 'ENTIRE history + new message'), (1, 0, 'next reply')], say=[
  "Here is what travels over the wire.",
  "Your code sends a list of messages. A system message sets the rules, like you triage support tickets. A user message carries the question.",
  "The API returns the reply, plus how many tokens you used and why it stopped.",
  "Your code appends that reply to its own copy of the conversation.",
  "For the next turn, you send the entire history again, plus the new message. The API is stateless, like a server that keeps no session: it remembers nothing between calls.",
  "That is why the bot in the story forgot the name. Someone sent only the latest message."]),
S('code', 'A real call with the OpenAI Python SDK (Responses API)', code='''from openai import OpenAI
client = OpenAI()                       # reads OPENAI_API_KEY from the environment

resp = client.responses.create(
    model=MODEL,                        # model names change: keep them in config
    instructions="You triage support tickets.",
    input=[{"role": "user", "content": "Dock vanishes after the laptop sleeps"}],
)
print(resp.output_text)
print(resp.usage.input_tokens, resp.usage.output_tokens)''', hl=[[0, 1], [3, 4], [5], [6], [8], [9]], say=[
  "Here is a real call with the official OpenAI Python library. The client reads your API key from an environment variable, never from code.",
  "You call responses dot create.",
  "The model name comes from configuration, because names change several times a year.",
  "Instructions play the system role, and input holds the conversation.",
  "Output text gives you the reply.",
  "And usage tells you the input and output tokens, which is what you pay for. Anthropic's Messages API has the same shape with different field names, and lab three wraps both behind one function."]),
S('bullets', 'Getting output your code can trust', items=[
  'Ask for JSON that matches a schema',
  'Use the provider\'s structured output feature when available',
  'Always validate (e.g. with Pydantic)',
  'On failure, send the error back and retry, a few times at most'], say=[
  "Agents need output that code can read, not just prose.",
  "Ask for JSON that matches a schema, which is like a struct definition: field names, types, allowed values.",
  "Use the provider's structured output feature when the model supports it. It makes malformed JSON rare.",
  "Still validate every reply, for example with Pydantic, because the values can be wrong even when the format is right.",
  "If validation fails, send the exact error back and ask again, a bounded number of times. It is a negative acknowledgement with a reason, so the sender can retransmit correctly."]),
S('recap', 'Recap', items=['Messages with roles: system, user, assistant', 'The API is stateless: send the history every time', 'Keep model names in config, keys in the environment', 'Schema + validation + bounded repair'], say=[
  "Recap.",
  "You send messages with roles: system, user and assistant.",
  "The API is stateless, so your code sends the history every time.",
  "Model names live in config and keys live in the environment.",
  "And reliable output means a schema, validation, and a bounded repair loop."]),
]),
V('a05-tool-calling', 'Agentic AI · 5', 'Tool calling: how a model asks your code to act', [
S('title', items=['Describing a tool', 'The round trip', 'Rules that prevent bugs'], say=[
  "This video shows how a chat assistant gets the power to look things up and take actions."]),
S('analogy', 'A remote procedure call the model can request', items=[
  'You describe each tool: name, purpose, argument schema',
  'The model replies with a request: tool name + arguments',
  'Your code decides whether to run it, and sends back the result'], say=[
  "Think of each tool as a remote procedure call that the model is allowed to request.",
  "You describe each tool: a name, one or two sentences on what it does and when to use it, and a schema for its arguments.",
  "When the model wants data, it does not answer in prose. It replies with a structured request: this tool, these arguments.",
  "Your code decides whether to run it, runs it, and sends back the result. The model never executes anything itself."]),
S('seq', 'The tool-call round trip', lanes=['Your code', 'Model API', 'Fleet service'], msgs=[(0, 1, 'question + tool descriptions'), (1, 0, 'call get_firmware(device="D1")'), (0, 2, 'validate, then run'), (2, 0, '{"installed": "2.1.3"}'), (0, 1, 'history + tool result (same call id)'), (1, 0, 'D1 runs 2.1.3; 2.1.4 fixes it')], say=[
  "Here is a full round trip.",
  "Your code sends the question, together with descriptions of the available tools.",
  "The model answers with a tool call: get firmware, device D1. Each call carries an ID number.",
  "Your code validates the arguments, then calls your real fleet service.",
  "The service answers: installed version 2.1.3.",
  "Your code sends the history plus that result, tagged with the same call ID, so the model can match result to request.",
  "Now the model has facts, and writes the final answer."]),
S('bullets', 'Rules that prevent most tool bugs', items=[
  'Validate arguments before running anything',
  'Turn failures into error results, never crashes',
  'Every call gets exactly one result with its ID',
  'Independent calls can run in parallel',
  'Write descriptions like API docs: the model reads them'], say=[
  "A few rules prevent most tool bugs.",
  "Validate the arguments before running anything. The model can invent values.",
  "Turn failures into error results the model can read, like unknown device ZZ, instead of crashing your loop.",
  "Every call gets exactly one result with its ID. Providers reject a conversation where they don't pair up.",
  "When the model asks for several independent calls at once, run them in parallel.",
  "And write tool descriptions like good API docs, because the model chooses tools by reading them."]),
S('recap', 'Recap', items=['A tool = name + description + argument schema', 'The model requests; your code validates and runs', 'Results go back with the matching call ID', 'Errors are data, not crashes'], say=[
  "Recap.",
  "A tool is a name, a description and an argument schema.",
  "The model requests, and your code validates and runs.",
  "Results go back with the matching call ID.",
  "And errors are data for the model, not crashes. Lab four builds a tool registry that does all of this."]),
]),
V('a06-agent-loop', 'Agentic AI · 6', 'The agent loop, and the guard rails that make it safe', [
S('title', items=['The loop in ten lines', 'Guard rails', 'Keeping context small'], say=[
  "Now we wrap that idea in a loop, and add the safety limits around it."]),
S('code', 'The core loop (labs/05-agent-from-scratch)', code='''messages = [system, {"role": "user", "content": goal}]
for step in range(MAX_STEPS):                 # guard rail 1: step limit
    reply = llm(messages, tool_specs)
    spent += reply.usage
    messages.append(reply.as_message())
    if not reply.tool_calls:
        return reply.text                     # done: a final answer
    if spent > TOKEN_BUDGET:                  # guard rail 2: cost
        return stop("budget")
    for call in reply.tool_calls:
        if repeated_too_often(call):          # guard rail 3: loops
            return stop("loop")
        content, is_error = run_tool(call)    # errors become results
        messages.append(tool_result(call.id, content, is_error))
return stop("max_steps")''', hl=[[0], [1], [2, 3, 4], [5, 6], [7, 8], [10, 11], [12, 13]], say=[
  "Here is the core loop from lab five. It starts with a system message and the user's goal.",
  "It runs for at most a fixed number of steps. That is guard rail one, like a watchdog timer.",
  "Each step calls the model with the history and the tool descriptions, adds up the tokens spent, and appends the reply.",
  "If the reply has no tool calls, it is the final answer, and we return it.",
  "Guard rail two: a token budget, so one run cannot spend without limit.",
  "Guard rail three: if the exact same call repeats too often, the agent is stuck, so stop.",
  "Otherwise run each tool, turning any failure into an error result, and append the result with its call ID."]),
S('icons', 'Firmware ideas you already use here', items=[('clock', 'Watchdog', 'step limit'), ('money', 'Power budget', 'token budget'), ('bug', 'Stuck-loop detector', 'repeated-call check'), ('chart', 'Trace buffer', 'log of every step')], say=[
  "You already know every one of these ideas.",
  "A watchdog becomes the step limit.",
  "A power budget becomes the token budget.",
  "A stuck loop detector becomes the repeated call check.",
  "And a trace buffer becomes a record of every model call and tool call, with timings. Without that trace, debugging an agent is guesswork."]),
S('bullets', 'Keeping the context window under control', items=[
  'Every step adds messages; the context window is finite',
  'Trim: drop the oldest turns, keep the goal',
  'Compact: replace old turns with a short summary',
  'Never separate a tool call from its result'], say=[
  "One more problem appears in long runs.",
  "Every step adds messages, and the context window, the maximum the model can read at once, is finite. Cost grows with it too.",
  "One fix is trimming: drop the oldest turns, but keep the system message and the goal.",
  "A better fix for long tasks is compaction: ask a model to summarise old turns into one short note, like log rotation that keeps a digest.",
  "Either way, never separate a tool call from its result, or the provider rejects the request."]),
S('recap', 'Recap', items=['An agent is a loop: model, tools, results, repeat', 'Step limit, budget and loop detection are mandatory', 'Trace every step', 'Trim or compact without splitting tool pairs'], say=[
  "Recap.",
  "An agent is a loop: call the model, run the tools it asks for, feed back the results, repeat.",
  "Step limits, budgets and loop detection are not optional.",
  "Trace every step.",
  "And trim or compact history without ever splitting a tool call from its result."]),
]),
]
