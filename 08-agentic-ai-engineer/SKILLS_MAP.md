# Skills map: what Agentic AI Engineer postings ask for → where this course teaches it

Built on **Nov 16, 2026** from 12 current postings for "Agentic AI Engineer", "AI Agent Engineer" and close equivalents.
How they were read: posting **P1** was read in full on the employer's own job page. The others were read through search-engine extracts of each posting page (the parts quoted in search results), because several job sites block automated page fetches. P2 now redirects to the company's job list, so it may have closed after it was indexed. Before you apply, open each link to confirm the role is still open.

## The postings

| # | Company: role | Link | Notes |
|---|---|---|---|
| P1 | 6sense: Sr. AI Engineer, Agentic Platform (SF / Austin) | https://boards.greenhouse.io/6sense/jobs/8257108 | Read in full. LangGraph, MCP at production scale, evals, security |
| P2 | IANS: Agentic Engineer (Boston) | https://job-boards.greenhouse.io/ians/jobs/5192735007 | LangGraph/LlamaIndex/AutoGen, MCP-style tools, eval & observability (LangSmith, Langfuse) |
| P3 | NVIDIA: Senior AI Engineer (Yokneam) | https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-AI-Engineer_JR2027194 | Agents, MCP servers, agent evaluation, Temporal workflows |
| P4 | Worth AI: Senior Agentic (AI) Engineer (Tampa) | https://apply.workable.com/j/319DDEAD2B | LangGraph / Claude Agent SDK, durable execution, eval stack, red teaming, MCP |
| P5 | HPE (Juniper Marvis): Agentic AI Cloud Development Engineer | https://hpe.wd5.myworkdayjobs.com/en-US/ACJobSite/job/Agentic-AI-Cloud-Development-Engineer_1216235-5 | LangGraph, MCP servers and skills (SKILL.md), network-ops agents |
| P6 | Kelly Services client: Agentic AI Engineer, Insurance (Boston) | https://movojobs.com/kelly-services/jobs/agentic-ai-engineer-insurance-and-agentic-workflows-boston-ma-11988928 | LangGraph, Bedrock, evals, RAG, MCP, context engineering |
| P7 | Xora Innovation portfolio co.: Agentic AI Engineer | https://aimlcareer.com/jobs/agentic-ai-engineer-xora-portfolio-company-xora-innovation-55ec188a | Async Python, multi-provider routing/fallback, RAG, LLM-as-judge, tracing, Temporal |
| P8 | Tata Consultancy Services: Agentic AI Engineer | https://frankecareer.nau.edu/jobs/tata-consultancy-services-agentic-ai-engineer/ | Multi-agent patterns (supervisor, planner-executor, critic-generator), MCP, RAG |
| P9 | FUIB (bank): Agentic AI Engineer (remote) | https://jobs.dou.ua/companies/fuib/vacancies/367416/ | Framework depth, MCP servers, DeepEval/RAGAS/Langfuse, PII, Docker, transformers basics |
| P10 | Plug: Senior Applied ML Engineer (LA) | https://simplify.jobs/p/bf030680-ed05-4c0c-8244-5bf192b313d6/Senior-Applied-Machine-Learning-Engineer | Tool use, retrieval, structured output, real-case evals, traces, MCP servers, TypeScript |
| P11 | GEICO: Sr. Staff AI Engineer, AI Agent Platform (NYC) | https://aijobfever.com/ai-jobs/usa/new-york/sr-staff-ai-engineer-ai-agent-platform-agent-and-evaluation-harn-geico-19004175-17ec-4728-9a34-e5f20af99fd2 | Agent patterns, context management, MCP, eval harness, grader bias, statistical variance |
| P12 | Oracle: Principal AI Agent / ML Software Engineer (Nashville) | https://www.linkedin.com/jobs/view/principal-ai-agent-ml-software-engineer-at-oracle-4449981928 | Staff+ leadership, MCP, memory, evals, guardrails, SLOs, AI-assisted dev tools |

## Skill → postings → lessons and labs

| Skill (as postings phrase it) | Asked by | Lessons | Lab |
|---|---|---|---|
| Strong production Python (typing, async, testing) | P2 P4 P6 P7 P9 P10 | L(2) | all labs |
| LLM fundamentals (tokens, context, sampling, transformers, embeddings) | P9 (explicit), implied by all | L(3) L(4) L(5) L(6) | 01, 02 |
| LLM APIs, structured outputs | P6 P7 P8 P10 | L(7) L(8) | 03 |
| Prompt / context engineering | P6 P11 | L(9) L(13) | 03, 05 |
| Tool / function calling, tool schema design | P1 P4 P5 P7 P8 P9 P10 P12 | L(10) | 04 |
| Agent loop, state, memory, planning, stopping, retries | P1 P3 P7 P9 P11 P12 | L(11) L(12) L(13) | 05 |
| Agent patterns: routing, orchestrator-worker, plan-and-execute, reflection, critic-generator | P1 P8 P11 | L(12) L(21) | 05, 09 |
| RAG: chunking, embeddings, hybrid search, reranking, vector DBs, metadata filters | P1 P4 P6 P7 P8 P9 P10 P12 | L(14) L(15) | 06 |
| Retrieval evaluation, groundedness | P1 P9 | L(16) | 06 |
| MCP servers, tool schemas, registry/versioning | P1 P2 P3 P4 P5 P6 P8 P9 P10 P11 P12 | L(17) L(18) | 07 |
| Frameworks: LangGraph (most named), OpenAI Agents SDK, Claude Agent SDK, CrewAI, AutoGen/MS Agent Framework, LlamaIndex, Google ADK | P1 P2 P3 P4 P5 P6 P7 P8 P9 | L(19) L(20) | 08 |
| Multi-agent orchestration, delegation with scoped permissions | P1 P8 P9 P11 P12 | L(21) | 09 |
| Human-in-the-loop, interrupts, checkpointing, durable execution (Temporal) | P1 P3 P4 P7 P9 P12 | L(20) L(22) | 08 |
| Evals: golden sets, regression gates, LLM-as-judge, tool-call accuracy, task success | P1 P2 P3 P4 P6 P7 P9 P10 P11 P12 | L(23) L(24) | 10 |
| Grader bias, statistical variance | P11 | L(23) L(24) | 10 |
| Observability: tracing, prompt versioning (LangSmith, Langfuse, OpenTelemetry) | P1 P2 P7 P9 P10 P12 | L(25) L(30) | 12 |
| Security: prompt injection, tool poisoning, least privilege, tenant isolation | P1 P4 P9 P12 | L(26) L(27) | 11 |
| Guardrails, PII handling, responsible AI | P4 P6 P9 P12 | L(27) | 11 |
| Reliability: idempotency, retries, rate limits, fallbacks, spend controls | P1 P7 P9 P12 | L(28) | 12 |
| Cost / latency optimisation, caching, model routing | P1 P7 P9 P10 P12 | L(29) | 12 |
| Deployment: Docker, cloud (AWS/Bedrock), CI/CD, SLOs, monitoring | P1 P4 P6 P9 P12 | L(30) | 12 |
| Fine-tuning vs RAG judgement, open-weight models | P4 (open-weight), P12 (inference) | L(31) | n/a |
| Shipped a production agent; portfolio | P4 P6 P9 | L(32) L(35) | capstones |
| System design, senior/staff leadership, mentoring | P1 P11 P12 | L(33) L(35) | n/a |
| TypeScript (secondary) | P9 P10 | L(2) L(18) | n/a |

## Gaps this course cannot close for you
- **"Production agent shipped to real users"** (P4, P6, P9) requires doing it. L(35) suggests building one internally at your current job.
- **Cloud specifics** (AWS Bedrock/SageMaker, Kubernetes/EKS, Terraform). The course teaches the architecture; follow your target company's cloud docs for the hands-on work.
- **Domain knowledge** (insurance, banking, B2B data). Read the company's product pages before interviews.
