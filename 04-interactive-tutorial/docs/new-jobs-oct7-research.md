# Oct 7 2026 job alert: what the six postings actually ask for

Researched Oct 7 2026, 9:10 PM CT. The roles come from Chandra's LinkedIn job-alert screenshot. Everything below is quoted or closely paraphrased from public postings. Nothing is invented. Where the exact posting text is thin, that is stated.

---

## 1. NVIDIA: Senior System Software Engineer, ML and Vector Search (Santa Clara / remote US)

**Sources (exact posting):**
- Primary: https://jobs.nvidia.com/careers/job/893397618102
- Mirrors: https://builtin.com/job/senior-system-software-engineer-ml-and-vector-search/11066302, https://hiretik.com/jobs/2df53014-bae7-4442-a0d7-cbd6fb97ddd6, https://emploive.com/jobs/3111628/senior-system-software-engineer-ml-and-vector-search-nvidia

**Team:**
- Works on the unstructured-data libraries **cuVS** and **cuML**, plus **RAFT**.
- These are C++/CUDA algorithms exposed to Python and Java and used inside vector databases.

**What you do:**
- Research, develop and benchmark tuned algorithms for vector preprocessing, indexing and search.
- Build ML algorithms for clustering and visualization.
- Analyze, design and implement optimized GPU algorithms for large-scale vector search, databases and ML.
- Drive performance analysis, benchmarking and optimization.
- Implement in C++, CUDA and Python, and contribute to open source (cuML, cuVS, RAFT).

**Required:**
- 8+ years of C++ (or able to move to it from C, Rust or Java).
- ML concepts: approximate vs exact, iterative vs closed-form.
- Strong algorithms and math fundamentals.
- Debugging, performance analysis and test design.
- At least one parallel or concurrency framework: CUDA, OpenMP, OpenACC, pthreads, etc.

**Ways to stand out:**
- Distributed algorithms (HPC, cloud).
- Debugging complex multi-language, multi-hardware systems.
- Familiarity with vector databases and nearest-neighbor algorithms (Milvus, Pinecone, LanceDB; **graph and IVF indexes**).
- ML background in clustering and dimensionality reduction.
- GPU programming is a plus.

**Pay:** $184,000–$287,500 base (per Built In / Emploive).

---

## 2. Wayve: Senior Software Engineer, OS, Robot Software (Sunnyvale, hybrid)

**Sources (exact posting, two Ashby listings with slightly different text):**
- https://jobs.ashbyhq.com/wayve/aa7ad033-e6a1-43ca-a77f-6faa025479c2
- https://jobs.ashbyhq.com/wayve/94b7837b-c7b0-4dce-8cfb-24682ebe5f48 (published Sep 8 2026)
- Mirror with the fuller requirement list: https://app.welcometothejungle.com/jobs/JKBv5a-M

**Team:**
- The OS team curates Wayve's own **Linux and QNX distributions** for its development fleet.

**Day to day:**
- Embedded Linux and QNX platform software, kernels and device drivers.
- C and C++ code that is "observable and debuggable" on remotely operated vehicles. One version says "on a device 2000 km away and with limited connectivity".
- Diagnosing stack traces, core dumps, disk I/O, CPU load, memory, devices and threading.
- Fault tolerance, diagnostics, tooling.

**Working on:**
- **Yocto**, kernel configuration, **device trees**, boot sequence and **secure boot**.
- Kernel drivers for new sensors, peripherals and compute platforms.
- **High-throughput IPC middleware** for robotics (e.g. ROS-style frameworks).
- Remote diagnostics and debugging.
- Integration across **NVIDIA Jetson, NVIDIA DRIVE and QNX**.
- Hardening the fleet against cyber attack (older listing).

**Valuable extras:** NVIDIA robotics or automotive platforms, QNX or another RTOS, secure boot, ROS-style frameworks.

**Interview process (as published):**
- Recruiter screen.
- Programming and domain interviews (2 h).
- Deep dives on programming, software design and hiring-manager fit (3 h).
- Values interview.

**Pay:** $200K–$260K + equity (the two listings differ).

---

## 3. Google: Staff Software Engineer, Drivers and Systems Engineering (Sunnyvale, on-site)

**Sources (exact posting via mirrors; marked expired on HiringCafe):**
- https://hiringcafe.com/job/staff-software-engineer-drivers-and-systems-engineering-google-erh5nik7ibhy453u
- https://www.ihiretechnology.com/jobs/view/533819440
- https://www.nexxt.com/jobs/staff-software-engineer-drivers-and-systems-engineering-sunnyvale-ca-3361170713-job.html

**Team:** Google **AI and Infrastructure** (TPUs, Vertex AI, Global Networking, Data Center operations).

**Minimum qualifications:**
- 8 years of software development.
- 5 years of **testing and launching** software products.
- 5 years with **embedded operating systems**.
- 3 years of software design and architecture.
- Experience with **kernel drivers and GPU drivers**.

**Preferred:**
- Master's or PhD.
- 8 years of data structures and algorithms.
- 3 years as technical lead.
- Matrixed cross-functional work.
- People management.

**Responsibilities (generic):** technical leadership, coaching a distributed team, cross-team alignment, and designing, building, testing and launching large-scale software.

**Limitation:** the posting does not name the exact driver stack.
- As a close current posting from the same org, I also used Google's **"Staff Software Engineer, Embedded Systems/Firmware, Servers"**: https://www.localjobs.com/job/sunnyvale-ca-staff-software-engineer-embedded-systems-firmware-servers. It covers platform firmware, BIOS and drivers for all Google servers including ML headnodes; pre-silicon firmware/software co-development; and ownership of FW, BIOS, kernel and drivers with rigorous testing and deployment.
- Lessons tagged to this role use only "kernel drivers, GPU drivers, embedded OS, test and launch". Server firmware context is labelled as coming from the related posting.

**Pay:** $207,000–$300,000 + 20% bonus + equity.

---

## 4. General Motors: Staff Software Engineer, Simulation Platform (Galileo) (Sunnyvale, hybrid 3 days/week)

**Sources (exact posting):**
- Primary: https://search-careers.gm.com/en/jobs/jr-202621707/staff-software-engineer-simulation-platform-galileo/ (JR-202621707, posted Oct 6 2026)
- Mirror: https://notify.careers/postings/1e9af701-d954-47e1-b9c8-591632ff8320
- Related GM posting, same org, used for context only: https://search-careers.gm.com/en/jobs/jr-202611008/staff-software-engineer-simulation/

**Team:**
- Simulation, Evaluation and Data org.
- The VTA team builds infrastructure for test organization, test triggering, **simulation execution, result analysis** and the data pipelines between them.

**What you do:**
- Technical vision, architecture and roadmap for Galileo.
- Systems that **orchestrate and analyze millions of simulation miles**.
- Test creation, **test-suite management, execution orchestration, result storage**, data processing, visualization and quantitative analysis.
- Distributed-systems patterns and service interfaces.
- Bottlenecks in performance, reliability, cost and scale.
- CI, observability and incident learning.

**Required:**
- 7+ years of production platforms.
- Cross-team technical leadership.
- Distributed systems, SOA or microservices, data-intensive apps.
- **Python plus one of Go, C++, Java or TypeScript**.
- Cloud, CI/CD, automated testing, observability.
- Developer tooling.

**Competitive edge:**
- AV, robotics or simulation validation.
- Large-scale simulation or field experiments.
- Test frameworks, **scenario libraries, metrics systems, release gating, continuous evaluation**.
- PostgreSQL, BigQuery, DuckDB, Redshift; dbt, Dataform, SQLMesh.
- **ROS, Python/C++ interoperability**, Streamlit or Looker.
- Latency, throughput and cost constraints.
- Safety-critical validation.

**Related GM simulation posting adds:** scenario libraries, test and evaluation pipelines, and characterizing the trustworthiness of simulation tests.

**Pay:** $185,100–$284,100.

---

## 5. Google: Senior Staff Software Engineer, Accelerator Platforms (Sunnyvale, on-site)

**Sources (exact posting):**
- Primary: https://www.google.com/about/careers/applications/jobs/results/102806635595866822-senior-staff-software-engineer/
- Mirrors: https://www.ihiretechnology.com/jobs/view/529629109, https://veterans.usnlx.com/sunnyvale-ca/senior-staff-software-engineer-accelerator-platforms/75134F8BE5D948889E7BC18250B4E9B2/job/

**Scope:**
- The software stack **above the firmware** on accelerator platforms (GPUs, TPUs) for AI and HPC.
- Covers distributed systems, Linux OS and networking, **power management**, and integration with hardware through **PCIe, USB and I2C**.

**Minimum qualifications:**
- 8 years of software development.
- 7 years with embedded OSes.
- 5 years of design, architecture and launch.
- **Linux networking** (sockets, TCP/IP, kernel networking stack).
- **Linux OS internals, kernel development or systems programming**.

**Preferred:**
- 5 years as technical lead; matrixed organizations.
- **HPC systems and networking**.
- Industry bodies: **PCI-SIG, CXL Consortium, DMTF, OCP**.

**Responsibilities:**
- Tech lead for the accelerator software architecture and roadmap.
- Large programs with hardware, software and SRE teams for Google data centers.

**Pay:** $262,000–$365,000 + 25% bonus + equity.

---

## 6. NVIDIA: Senior Software Engineer, Embedded Platform Middleware, Automotive and Robotics (Santa Clara)

**Sources (exact posting; the title is cut off in the screenshot):**
- Primary: https://jobs.nvidia.com/careers/job/893396838352 (JR2022103)
- Workday: https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-Software-Engineer--Embedded-Platform-Middleware---Automotive-and-Robotics_JR2022103

**Team:**
- The **NvSci** middleware team.
- Builds safe, high-performance **data sharing and synchronization across GPUs, CPUs and accelerators** on DRIVE (AV) and Jetson.

**What you do:**
- Middleware APIs for **buffer sharing, cross-engine synchronization, streaming and IPC**.
- Features that meet **ISO 26262, ASPICE and ISO 21434**.
- Optimization in resource-constrained embedded systems, co-designed with hardware and firmware.
- Work with the CUDA, graphics, camera and AV framework teams.
- **Automation, static analysis, fuzzing** and generative-AI tooling.
- Mentoring.

**Required:**
- 8+ years.
- C and modern C++.
- Embedded multi-threaded software across CPUs, accelerators and heterogeneous chips.
- **OS internals**: memory management, synchronization primitives, IPC, drivers.
- Linux kernel hands-on.
- **Safety-critical delivery** under ISO 26262, DO-178C, IEC 61508 or similar.

**Stand out:**
- ISO 21434 or ASPICE.
- **QNX, Integrity or another RTOS**.
- CUDA, Vulkan or driver stacks.
- Middleware, HAL or system libraries at scale.
- **MISRA C/C++, Coverity, fuzzing, formal verification**.

**Pay:** $184K–$287.5K (L4); $224K–$356.5K (L5).

---

## Not found / caveats

- All six postings were found.
- For Google Drivers & Systems, the public text is generic. Team-specific context comes from a labelled related posting.
- NvSci internals (exact API names and behavior) are **not** described in the posting. The lessons teach the general concepts (buffer attribute negotiation, fences and semaphores, producer/consumer streams). They are labelled "general pattern, not NVIDIA's API".
- AUTOSAR Adaptive, SOME/IP and hypervisors appear in **none** of the six postings, so they get only a short mention. They are labelled "related, not in these postings".
