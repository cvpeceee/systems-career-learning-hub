# Oct 11 job alert: research notes (6 roles)

Researched Sunday Oct 11, 2026 (CT). Every requirement below is quoted or closely paraphrased from the listed source. Nothing is invented.
Where a page is a re-post (aggregator) of the employer's listing, that is said. **INFERRED** marks my own reading of the team's context. It is never presented as a posting requirement.

---

## 1. Meta: Software Engineer (HW/SW Co-Design), Menlo Park, CA. $219K–$301K/yr

- **Sources:**
  - https://www.choppingblock.ai/jobs/software-engineer-hw-sw-co-design-at-meta-1192372 (re-post of Meta Careers, dated 9 Oct 2026, shows the $219K–$301K range)
  - https://fable12.com/jobs/meta:meta:1139619051753971 (indexed from the Meta Careers board, posted 9 Oct 2026)
  - Full responsibility text: https://jobright.ai/jobs/info/6904cca463502c0aded75506. This is an earlier, now-closed posting with the same title and team. Its wording matches the fragments visible in the Oct 9 re-post.
- **Team:** AI & Systems Co-Design. The team drives the definition of next-generation compute and storage architectures. Onsite, full-time.
- **Responsibilities:**
  - Use an extensive understanding of CPUs (x86/ARM) to find key platform resource bottlenecks.
  - Work with software product teams to re-architect services, improve performance through algorithm redesign and reduce resource use.
  - Develop representative benchmarks (C++, Python and/or Hack) that capture fleet requirements and drive early evaluation of upcoming platforms.
  - Drive fleet-wide, detailed workload analysis. Stay ahead of evolving business needs and their impact on the compute fleet.
  - Find novel HW/SW co-design opportunities. Run pathfinding to quantify the value proposition for Meta and drive roadmap definition.
  - Influence vendor hardware roadmaps and the wider ecosystem.
  - Partner with Product and Infrastructure Engineering to deliver the hardware roadmap into production and drive adoption.
  - Publish at conferences and in journals, and make open-source contributions (described as "ample opportunities").
- **Minimum qualifications:**
  - Bachelor's in CS/CE or equivalent.
  - 5+ years with programming and scripting languages such as C, C++, Java, PHP, Python.
  - Experience with large-scale infrastructure, distributed systems, and full-stack analysis of server applications.
  - 5+ years with hardware architecture, compute technologies and/or storage systems.
- **Preferred (earlier posting):**
  - Master's or PhD.
  - Demonstrated architectural understanding of CPU, memory subsystems, accelerators, networking, flash and/or HDD storage systems.
- **Not named in the posting:** quantization or numerics, compilers, kernels, GPUs as a focus. The posting is about compute and storage platforms (CPU-centric). INFERRED: accelerators appear only in the preferred list.

## 2. LinkedIn: Staff Software Engineer, Systems and Infrastructure, Mountain View, CA (hybrid). $175K–$287K

- **Sources:**
  - https://www.linkedin.com/jobs/view/staff-software-engineer-systems-and-infrastructure-at-linkedin-4442119754
  - Full text: https://snaprecruit.com/job/staff-software-engineer-mountain-view-california-qjr020260722091349.html (re-post)
  - Also listed on SmartRecruiters: https://jobs.smartrecruiters.com/LinkedIn3/744000138381899-staff-software-engineer-systems-and-infrastructure (IC4/9, hybrid)
- **Scope:** data infrastructure, storage systems, streaming platforms, traffic and network infrastructure. "Next-generation data infrastructure, including storage, streams, and analytics platforms."
  - Strong systems orientation across concurrency, scalability, performance, caching, queuing and distributed data storage.
- **Responsibilities:**
  - Own technical strategy for broad, open-ended problems.
  - Design, implement and optimize large-scale distributed systems with security and compliance in mind.
  - Improve observability and understandability.
  - Mentor engineers.
  - Work with open-source projects (e.g. Apache Iceberg, Airflow, Flink).
  - Diagnose and debug in production, and automate routine tasks.
- **Basic qualifications:**
  - BA/BS or equivalent.
  - 4+ years in software design, development and algorithms.
  - 4+ years programming in Java, C++, Python, Go, Rust, C# and/or Scala.
  - Hands-on experience with distributed systems, large-scale systems, databases and/or backend APIs.
- **Preferred qualifications:**
  - BS+8, MS+7 or PhD+4 years.
  - Architecting and running large-scale distributed systems.
  - Experience with GCP, S3, Azure, Iceberg, Spark, Flink, Trino, Airflow, Kubernetes, GraphQL, gRPC, Kafka, Pinot, ClickHouse or Cassandra.
  - Open-source project management and governance.

## 3. NVIDIA: Senior System Software Engineer, Dynamo-Triton Inference Server, Santa Clara, CA (hybrid)

- **Sources:**
  - https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-System-Software-Engineer---Dynamo-Triton-Inference-Server_JR2013405
  - https://jobs.nvidia.com/careers/job/893393544854
  - Re-post with pay: https://www.theladders.com/job/senior-system-software-engineer-dynamo-triton-inference-server-nvidia-santa-clara-ca_88950978 ($224K–$356.5K base; this version says 12+ years, while Workday says 5+)
- **What you'll do:**
  - Develop world-class GPU-accelerated AI inference serving software.
  - Contribute to feature development and drive customer adoption.
  - Drive the convergence of the Triton Inference Server and NVIDIA Dynamo stacks into one high-performance inference platform with feature parity for LLM and non-LLM workloads.
  - The re-post adds: engage with the open-source DL community, and build robust software for production and cloud while optimizing performance.
- **Requirements:**
  - MS or PhD (or equivalent).
  - 5+ years on deep learning software.
  - Excellent Rust and C++, familiarity with Python.
  - Strong design, debugging, performance analysis and test design.
  - High-scale distributed systems and ML systems.
- **Ways to stand out:**
  - AI frameworks and engines (TensorRT, PyTorch, ONNX, OpenVINO, vLLM, TRT-LLM).
  - GPU memory management, cache management or high-performance networking.
  - Distributed systems programming.
  - Contributing to a large open-source project.
- **INFERRED (public product docs, not the posting):**
  - Triton: model repository, per-model config, dynamic batcher, instance groups, backends, ensembles, HTTP/gRPC (KServe v2) endpoints.
  - Dynamo: disaggregated prefill/decode, KV-cache-aware routing, KV block management and offload, and transfer between GPUs.
  - The lessons label these as product background.

## 4. NVIDIA: Senior Distributed Software Engineer, Golang, DGX Cloud, Santa Clara, CA (remote-eligible per listing)

- **Sources:**
  - https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-Distributed-Software-Engineer--Golang---DGX-Cloud_JR2024570-1
  - https://jobs.nvidia.com/careers/job/893397378489
  - Aggregator note: applications were open through Oct 10, 2026 (https://kairos.dhiti.dev/jobs/573004/senior-distributed-software-engineer-golang-dgx-cloud-at-nvidia). **The posting may close soon or may already be closed.**
- **Mission:** distributed storage services for AI/ML. "A reliable, scalable, and efficient storage-as-a-service tailored to AI applications that can be deployed anywhere."
- **Responsibilities:**
  - Lead the architecture and design of the distributed storage service.
  - Develop robust, scalable Go programs deployed on open-source ecosystems including Kubernetes.
  - Build user-space applications, containers, Go bindings and CLI tools.
  - Build availability and reliability features for large deployments.
  - Automate the service end to end (deployment, management, monitoring).
  - Work with Research, Product and external customers.
- **Requirements:**
  - BS (or equivalent) and 8+ years.
  - Strong background developing distributed systems with Golang, Kubernetes and cloud service provider integrations.
  - A listing fragment mentions a service on large-scale clusters, multi-petabyte to exabyte in size, with millions of ... (the rest is truncated in every copy I found).
- **Stand-out:** accelerated-computing environments such as GPU Direct Storage, DPU and RDMA.

## 5. Google: Staff Software Engineer, AI and Infrastructure, Sunnyvale, CA (on-site)

- **Sources:**
  - https://jobs.anitab.org/companies/google-24698/jobs/76781028-staff-software-engineer-ai-and-infrastructure (re-post of Google Careers)
  - https://www.theladders.com/job/staff-software-engineer-ai-and-infrastructure-google-sunnyvale-ca_88604908
  - Pay $207K–$300K per https://www.wearedevelopers.com/jobs/ext/2310828-staff-software-engineer-ai-and-infrastructure
- **Team (from the posting):**
  - Borglet, Google's "node agent", which manages the life cycle of all user processes on all machines.
  - The Borglet Infrastructure group has about 30 SWEs in Sunnyvale and Warsaw. It builds Software Architecture, Runtime, Machine Management and Storage, delivering "container infrastructure that is scalable, extensible, efficient and secure".
  - Initiatives: ML/AI infrastructure (GPUs/TPUs in Borg), Security, Capacity Fungibility, Warp Space (TI VMs).
- **Responsibilities:**
  - Design, implement and analyze computer systems and their interactions with the kernel and hardware.
  - Work with the Borg, ML, HW platform and SRE teams, plus internal and Cloud users.
  - Solve ambiguous problems, plan strategy, coordinate with Warsaw, and develop junior engineers.
- **Minimum qualifications:**
  - BS or equivalent.
  - 8 years of C++.
  - 5 years of testing and launching products.
  - 5 years of large-scale infrastructure, distributed systems or networks, OR compute, storage or hardware architecture.
  - 3 years of software design and architecture.
- **Preferred qualifications:**
  - MS/PhD.
  - 3 years of technical leadership.
  - 3 years in a matrixed organization.
  - Linux internals, cluster management, system architecture, virtualization and security.

## 6. Google: Staff Software Engineer, Source Client, San Jose, CA (on-site)

- **Source:** https://www.google.com/about/careers/applications/jobs/results/88091104829678278-staff-software-engineer-source-client (Google Careers, fetched directly)
- **Pay:** US $207K–$300K, plus a 20% bonus target and equity.
- **Team:** Core team, Source Client. **Verified:** this is the version-control client team. The posting names the open-source **jj (Jujutsu)** project and Git.
- **Responsibilities:**
  - Design and implement core components for next-generation version control systems, including jj, with a focus on performance and scalability.
  - Partner with code review, code search and AI-enabled developer tool teams on integrated workflows.
  - Drive alignment across teams, and influence and coach a distributed team.
  - Grow open-source communities around jj and Git.
- **Minimum qualifications:**
  - BS or equivalent.
  - 8 years in C++, Java, Python, Kotlin or Go.
  - 5 years of testing and launching products.
  - 3 years of software design and architecture.
  - Experience integrating generative AI tools or LLM interfaces into workflows.
- **Preferred qualifications:**
  - MS/PhD.
  - Operating system internals (Linux/macOS) and **file system design**.
  - Integrating agents and AI into team products or processes.
  - C++ or Rust at large production scale.
  - VCS (Git, Mercurial, jj) beyond basic use.
  - Significant contributions to high-profile open-source projects.
- **INFERRED context (public, not in the posting):**
  - Google's monorepo uses Piper with CitC, a cloud-backed FUSE workspace, per the 2016 CACM paper "Why Google Stores Billions of Lines of Code in a Single Repository".
  - The posting itself only says "file system design".
