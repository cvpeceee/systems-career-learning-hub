# Oct 12 job alert: research notes (high-profile staff/principal roles)

Researched Mon Oct 12, 2026 (CT). **Labels:**
- **POSTED** = in the posting text itself (quoted or closely paraphrased).
- **PUBLIC** = a public source other than the posting (named, with URL).
- **INFERRED** = my reading; treat it as a hypothesis to check with the recruiter.

Nothing here is invented. If I could not find something, I say so.

---

## 1. Anthropic: Staff+ Software Engineer, Infrastructure (Distributed Systems). Seattle and San Francisco (hybrid)

**The two listings are one job.** The alert shows the same title twice, once for Seattle and once for SF. Anthropic's public Greenhouse board lists exactly one requisition with this title for the US: **job 4970314008**, located "San Francisco, CA | New York City, NY | Seattle, WA". LinkedIn splits multi-location jobs into one card per city. I checked the full Greenhouse job list (API, Oct 12): there is no separate Seattle-only requisition. A **Staff** (not Staff+) version exists for London (5387083008); it is not in scope.

- **Sources:**
  - POSTED: https://job-boards.greenhouse.io/anthropic/jobs/4970314008 (fetched directly; board updated 2026-08-21)
  - Mirrors: https://builtin.com/job/staff-software-engineer-infrastructure-distributed-systems/10589165 and https://www.builtinseattle.com/job/staff-software-engineer-infrastructure-distributed-systems/10589165 (same text)
- **Pay (POSTED):** $320,000–$485,000 base. Hybrid: "at least 25% of the time" in an office.
- **Team placement (POSTED):** "Team placement happens after the interview process." You interview for the Infrastructure org, not one team.
- **What the org owns (POSTED):** "the distributed systems that train, serve, and secure our AI models, including data pipelines, some of the largest Kubernetes clusters in the world, along with the databases, observability, and developer tooling that every other team at Anthropic depends on."
- **Responsibilities (POSTED):**
  - Independently scope and lead complex, multi-month infrastructure projects, from an ambiguous start to a production system.
  - Make architectural decisions that other engineers and teams build on.
  - Drive alignment on technical direction across multiple teams.
  - Partner with research and product teams on infrastructure and compute needs.
  - Own reliability, scalability and security as usage grows.
  - Set technical strategy and standards.
  - Build operational processes: incident response, postmortems, on-call.
  - Mentor engineers and raise the bar.
- **Required (POSTED):**
  - Designing, building and operating large-scale distributed systems or infrastructure in production.
  - A track record of independently scoping and delivering complex, ambiguous, multi-month projects.
  - Making architectural decisions others build on.
  - Strong fundamentals in at least one language (Python, Rust, Go or Java are given as examples).
  - Modern cloud: **Kubernetes and infrastructure-as-code on AWS and/or GCP**.
  - Strong written and verbal communication; driving alignment across teams.
- **Preferred (POSTED):**
  - 10+ years (excluding internships).
  - **ML infrastructure: GPUs, TPUs or Trainium, and networking like NCCL.**
  - **Low-level systems: Linux kernel tuning or eBPF.**
  - Security or privacy engineering.
  - Experience as a tech lead or mentor.
- **Level signals:**
  - POSTED: "Staff+" means Staff and above. The words that carry weight are "independently scope", "ambiguous", "multi-month", "decisions other engineers build on", "across multiple teams" and "set technical strategy and standards". That is the staff-level scope test.
  - INFERRED: Expect to be leveled on scope and independence shown in the project deep dive, not on coding speed.
- **Coding interview format (POSTED, on the application form):** "we do NOT do LeetCode-style interviews here. Our coding interviews are designed to reflect the kind of work you'd actually do on the job, so please pick the language you know best."
- **Related Anthropic postings that show the stack** (RELATED; same Greenhouse board, fetched via API Oct 12):
  - **Staff+ Software Engineer, Node Infra (5203868008):** "owns the full lifecycle of accelerator capacity… ingest and provision compute from all major cloud providers and from datacenters custom-built for Anthropic… health, diagnostics and repair automation that keep every GPU, TPU and Trainium node in the fleet usable". Also "detect, isolate, and remediate unhealthy hardware automatically, driving up fleet MTBI and minimizing stranded capacity". Preferred skills name Kubernetes internals (scheduler, autoscaler, kubelet, Karpenter), EFA/RDMA/InfiniBand, and kernel/drivers/firmware/health daemons.
  - **Staff+ Infrastructure Engineer, Cluster Infrastructure (5206978008):** "agent-driven automation for cluster provisioning and lifecycle management across all major cloud providers and our own datacenters… automatically drain and recover in response to failure". Preferred skills name Terraform/Atlantis, Temporal/Argo, Cilium/eBPF, cross-cloud networking, and hyperscale (100+ clusters, 10K+ nodes).
  - INFERRED: Because placement happens after the interview, any of these teams is a possible landing spot. Prepare for accelerator fleet health, cluster lifecycle and scheduling as well as generic distributed systems.
- **Public information about the stack:**
  - PUBLIC: Anthropic, "A postmortem of three recent issues" (Sep 17, 2025), https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues. Claude is served on **AWS Trainium, NVIDIA GPUs and Google TPUs**. Three infrastructure bugs (a context-window routing error, output corruption on TPU servers, and an XLA:TPU approximate top-k miscompilation) degraded quality. It discusses why evaluations missed them and the changes to detection. This is useful material for the "incidents and postmortems" part of the role.
- **Interview process (third-party, not from Anthropic):**
  - PUBLIC (Exponent guide, https://www.tryexponent.com/guides/anthropic-infrastructure-software-engineer-interview; HelloInterview, https://www.hellointerview.com/guides/anthropic/swe):
    - Recruiter call, then a technical screen, then a virtual onsite of roughly 4–5 rounds: coding, system design, a project deep dive, a hiring manager/behavioral round, and a culture/values round.
    - Coding is practical and changes as you go (concurrency, file and data processing, production edge cases).
    - Reported design themes: inference batching and routing, queues, failure handling, and distributing large model files.
  - Treat these as reported, not official. Confirm the loop with the recruiter.

## 2. Roblox: Principal Software Engineer, GPU Compute. San Mateo (hybrid)

- **Sources:**
  - POSTED: Greenhouse job 7978492. Fetched from the public board API on Oct 12 (https://boards-api.greenhouse.io/v1/boards/roblox/jobs/7978492; listing at https://careers.roblox.com/jobs/7978492, updated 2026-10-09).
  - Mirror: https://www.tealhq.com/job/principal-software-engineer-gpu-compute_7ea1a00eedd1d91367b38b9b6296f51c440b4
- **Pay (POSTED):** $345,040–$399,420 base plus equity. Onsite Tue/Wed/Thu.
- **Role summary (POSTED):** "technical anchor for Roblox's GPU and AI accelerator capabilities… a battle-tested GPU expert role focused on the machine management layer and above: how GPU hosts are made production-ready, kept healthy, and turned into reliable compute". The fleet spans Roblox data centers and cloud.
- **Responsibilities (POSTED):**
  - GPU technical leader, partnering with the Kubernetes, Machine Bootstrap, Networking and Cloud teams.
  - Own the GPU host lifecycle: **driver, firmware and CUDA stack management, GPU health and telemetry, and remediation of GPU-specific failures (XID errors, ECC, thermal, NVLink and fabric faults)**.
  - Architect how GPU capacity is exposed: **scheduling, isolation, Kubernetes integration**.
  - Drive **detection, diagnosis and automated repair** of unhealthy accelerators before they affect production.
  - Evaluate and onboard new accelerators, topologies (NVLink, InfiniBand, RoCE) and multi-node training and inference patterns.
  - Set the standards, tooling and APIs other teams use to consume GPU compute.
- **Required (POSTED):**
  - 10+ years building and operating large-scale distributed systems.
  - Deep hands-on GPU expertise at the machine-management layer (provisioning, driver and firmware lifecycle, health).
  - A track record as "an expert for compute, not just fleet management".
  - **Strong Go** or another well-structured language.
  - Production GPU/AI workloads: CUDA, GPU scheduling, NVLink/InfiniBand/RoCE.
  - Being the anchor expert who up-levels others.
- **Strong plus (POSTED):** Kubernetes for GPU workloads; bare-metal concepts (firmware, **BMC/IPMI/Redfish**, OS imaging).
- **Level signals:**
  - POSTED: "technical anchor", "set the technical direction", "up-level the entire organization".
  - INFERRED: Principal at Roblox is judged on org-wide direction plus being the person who debugs the hardest GPU failures. Expect deep follow-ups on real failure stories.
- **Public information about the stack:**
  - PUBLIC: Roblox, "Running AI Inference at Scale in the Hybrid Cloud" (Sep 17, 2024), https://about.roblox.com/newsroom/2024/09/running-ai-inference-at-scale-in-the-hybrid-cloud:
    - "more than a thousand GPUs across two data centers and our hybrid cloud" (as of 2024).
    - Kubeflow pipelines; **KServe with Triton** for online serving; **Ray** for batch inference; **vLLM** as the main LLM engine (about 2× latency and throughput).
    - A unified **ML gateway** with token-based throttling and latency-aware load balancing across regions.
    - All CPU inference moved to their own data centers.
  - PUBLIC (secondary): re:Invent 2024 talk summaries say Roblox schedules GPUs on Kubernetes with **YuniKorn** queues, bin packing and tiered preemption (https://zenn.dev/kiiwami/articles/d06f34376c6ca840). This is a summary of a talk, not a primary source.
  - PUBLIC: A Roblox engineer's LinkedIn hiring post describes the role as owning "CUDA, drivers, multi-node training topologies, NVLink/InfiniBand" (https://www.linkedin.com/posts/xunjia-lu-790b8511_roblox-hiring-softwareengineering-activity-7470935931659821056-6nQI).
- **Interview process:**
  - PUBLIC (official, 2022): https://about.roblox.com/newsroom/2022/02/like-interview-roblox-engineer. Senior candidates may get system design or take-home assessments, then team interviews and a values discussion.
  - PUBLIC (reported, third-party): Senior/principal (IC5+) virtual onsites of about four 45-minute rounds: one coding, two system design, one behavioral (https://scaleengineer.com/interviews/roblox/ic5-software-engineer; Blind posts). These are reports, not official.

## 3. Roblox: Principal Software Engineer, Engineering Acceleration. San Mateo (hybrid)

**Verified:** this is developer-productivity work. It covers source control, code search, code review and CI, not game engine work.

- **Sources:**
  - POSTED: Greenhouse job 7991993. Fetched from the public API on Oct 12 (https://boards-api.greenhouse.io/v1/boards/roblox/jobs/7991993; listing at https://careers.roblox.com/jobs/7991993, updated 2026-10-12).
  - Mirror: https://www.tealhq.com/job/principal-software-engineer-engineering-acceleration_7ea1a40821e07e70879e9a61c59fb3dcd9bb7
  - Caution: Dice (https://www.dice.com/job-detail/ff6e105b-c581-4a1c-8cbd-2156aee269ac) shows an older, different Engineering Acceleration principal posting ("Service Management", 7+ years, full-stack). Useparallel shows a manager-style summary. Neither is the current text, and I don't use either for requirements.
- **Pay (POSTED):** $295,250–$345,040 base plus equity.
- **Role (POSTED):** "set the technical direction for transforming development at Roblox from its solid roots to a fully scaled, globally mature, AI-powered development, code review and CI environment" for **2000+** engineers.
- **Responsibilities (POSTED):**
  - Own and define the 10-year technical vision for **source code search, storage, review and CI infrastructure**.
  - Architect local development tools, internal web apps and microservices, **reusable CI workflows** and **productivity metrics toolchains**, and integrate first- and third-party tools.
  - Lead company-wide efforts on the productivity and UX of Source and CI tools.
  - Define how **AI** enters engineers' daily work.
- **Required (POSTED):**
  - 9+ years, with a significant portion owning developer productivity, build infrastructure or internal developer platforms at scale.
  - Owned tools used by 2000+ engineers end to end.
  - **Deep knowledge of source control and/or CI tools** (GitHub, GitHub Actions and Artifactory are a plus).
  - AWS, Docker, Kubernetes and the **HashiStack (Nomad, Vault, Terraform)**.
  - Fluency in C#, Python, Go or Java.
- **"You Are" (POSTED):** passionate about developer experience; experienced leading cross-functional efforts; a mentor and evangelist of architecture and best practices.
- **Level signals (POSTED):** "define — not just build — the systems that fundamentally change how an entire engineering organization operates"; "10 years of growth"; "company-wide".
- **Not in the posting:**
  - INFERRED: The posting does **not** name Bazel or a particular build system. Remote caching and execution, test selection and flaky-test handling are taught here because they are standard for "CI infrastructure at scale". This is my inference, not a stated requirement.
  - PUBLIC: Public results did not show Roblox using Bazel. Say "a build cache like Bazel's" rather than claiming they use it.
- **Public information:**
  - PUBLIC: Roblox, "How Our Advanced Engineering Tools Are Shaping Immersive Worlds" (Feb 21, 2025), https://about.roblox.com/newsroom/2025/02/roblox-advanced-engineering-tools-are-shaping-immersive-worlds:
    - Three main internal products: an application lifecycle platform for thousands of microservices, a **code center** for code review (a 20% improvement in **P75 time to land** changes), and an observability platform.
    - **Automated canary analysis** in continuous deployment.
    - An **Engineering Productivity Index (EPI)** made of velocity (cycle time, deploy cadence), quality (coverage, trunk health) and self-reported productivity; it improved 12.9% year over year in Q4 2024. Roblox describes EPI as "simpler… than DORA or SPACE".
  - PUBLIC: Roblox, "How We Doubled AI Code Acceptance by Teaching Models to Think Like Roblox Engineers" (Jan 2026), https://about.roblox.com/newsroom/2026/01/doubled-ai-code-acceptance-teaching-models-think-like-roblox-engineers. Title only; read it before interviews.
  - RELATED: Roblox also lists "Principal Software Engineer, CI and CD Foundation" (https://careers.roblox.com/jobs/8047821). Search summaries mention merge queues, distributed testing and a large monorepo with C++ and Lua. I could not fetch that posting's text, so it is not used for requirements.
- **Interview process:** Same public sources as role 2. INFERRED: Expect one design round on CI or dev-platform scale.

## 4. Qualcomm: Senior Staff Engineer, San Diego

**Finding the exact posting:** Qualcomm has several San Diego "Senior Staff" jobs with longer titles (CPU Software Architecture, Linux Kernel Development (System Cache/MPAM), System Performance Engineer, 5G "Nimbus"). The alert card says exactly **"Senior Staff Engineer"** with no suffix. The listing with that exact title in San Diego is the **automotive telematics embedded Linux platform** role, mirrored on Dice (Qualcomm Technologies, Software Engineering, on-site, "updated 4 hours ago" when fetched).

INFERRED match, high but not certain. Confirm with the requisition number on Qualcomm's careers site before applying. The other San Diego Senior Staff titles are listed under RELATED so nothing is lost if the match is wrong.

- **Source (POSTED):** https://www.dice.com/job-detail/2608f036-72de-4881-bb3b-38e559c72e52 (Dice ID RTX171842; full text fetched Oct 12)
- **Pay (POSTED):** $169,800–$254,600, plus bonus and RSUs. On-site.
- **Role (POSTED):** "the senior technical authority for the embedded Linux platform software powering automotive telematics systems — owning architecture and execution across **boot, security, memory, and virtualization**, from silicon bring-up through production launch with global automakers."
- **Responsibilities (POSTED):**
  - Own the platform stack across multiple telematics chipset generations, from bring-up to sustaining.
  - Architect **boot and recovery: fail-safe and dual-image recovery, OTA update flows, NAND/eMMC storage**.
  - Platform security: **mandatory access control, verified boot, disk integrity verification, full-disk encryption**, and automotive cybersecurity **TARA** (threat analysis and risk assessment).
  - **Set and defend boot-time and memory-footprint targets** against firm customer commitments.
  - **Fusion configurations**: third-party application processors with cellular modems over **PCIe, USB and Ethernet**.
  - Kernel and **Yocto** upgrade roadmaps and release trains.
  - Automotive process compliance; translating customer requirements into features.
  - Mentor across boot, security, memory and virtualization.
- **Minimum (POSTED):** BS + 6 yrs, MS + 5 yrs or PhD + 4 yrs; 3+ yrs in C, C++, Java, Python or similar.
- **Preferred (POSTED):**
  - Deep embedded Linux (kernel, bootloaders, Yocto, bring-up).
  - **Boot-time and memory-footprint optimization.**
  - Embedded security and automotive cybersecurity standards.
  - OEM delivery inside formal processes.
  - **Technical leadership without direct authority.**
  - Pre-silicon and SoC debugging.
  - Git/Perforce.
  - **Linux kernel device drivers.**
  - RTOS.
  - C, C++, Assembly.
  - **AI-based SDLC practices.**
  - 13+ years.
- **Level signals:**
  - POSTED: "senior technical authority", "set and defend", "lead cross-team optimization", "without direct authority", "13+ years" preferred.
- **Fit for Chandra (INFERRED):** This is the closest fit of the five to his background: Linux drivers, bring-up, C/C++ and multi-vendor SoCs.
- **RELATED San Diego Senior Staff postings** (not the alert's exact title):
  - CPU Software Architecture Senior Staff Engineer (ARMv9, firmware, HW/SW co-design): https://simplify.jobs/p/df6c82fa-c0e5-46b6-b6b4-10dfec6a39d0
  - Senior Staff, Linux Kernel Development (System Cache/MPAM): https://hiring.camp/job/444mw3
  - System Performance Engineer, Senior Staff: https://www.tealhq.com/job/system-performance-engineer-senior-staff_7ea1ac7d620c4332c28023c45a4597d213ea5
  - All three are already well covered by ch20–22 (Arm performance, firmware, memory ordering, coherency).
- **Interview process:**
  - PUBLIC (third-party, reported): 3–5 technical rounds plus recruiter and hiring-manager screens. Topics reported: C/C++ and pointers, bit manipulation, OS internals, Linux drivers and scheduling, concurrency, embedded design, and project deep dives for senior candidates. Sources: https://www.techprep.app/blog/qualcomm-interview-process, https://medium.com/@sumitpardhiya/qualcomm-senior-engineer-interview-experience-436b0f0fbc46. These are reports, not official.

## 5. Microsoft: Member of Technical Staff, Microsoft Robotics. Redmond (hybrid)

- **Sources:**
  - POSTED: https://jobs.anitab.org/companies/microsoft-2/jobs/83890962-member-of-technical-staff-microsoft-robotics (full text; posted Jun 24, 2026)
  - LinkedIn: https://www.linkedin.com/jobs/view/member-of-technical-staff-microsoft-robotics-at-microsoft-4432588172
- **Level (POSTED):** "**at the Principal level** to set the technical direction for the systems every other engineer, partner, and customer builds on… a cross-cutting systems-focused leadership role."
  - Pay: search summaries quote IC6, $165,600–$296,400 (US typical range). I could not see that line in the fetched text, so treat the number as unconfirmed.
- **Org (POSTED):** Microsoft Robotics inside **MDQ (Microsoft Discovery & Quantum)**. They are building "Microsoft's platform for physical intelligence — an integrated robotics software and AI platform… robotics AI models, teaming solutions, physically grounded agentic AI workflows, trustworthy test and evaluation, and real-world customer-focused validation", built on Microsoft's core platforms.
- **Responsibilities (POSTED):**
  - Own the multi-year platform architecture.
  - Define the core interfaces and contracts between robotics software, AI models and cloud/edge components.
  - Balance latency, throughput, compute efficiency, reliability and cost across cloud and on-robot edge.
  - **Lead the evaluation and validation strategy that gates what ships**: benchmarks and the quality bar for autonomy, safety and task performance across sim, lab and field, "including **safe-autonomy boundaries and human-in-the-loop fallback**".
  - Personally drive the hardest cross-stack integration failures, "where AI models meet production robots", with root-cause analysis.
  - Connect classical robotics with modern AI (foundation models, perception, manipulation, locomotion, simulation) in one production platform.
  - Own design standards and reviews.
  - Influence MDQ, Microsoft Research, Azure, silicon partners, customers, and open source and standards bodies without formal authority.
  - Mentor senior and principal engineers.
  - Track embodied AI, robot learning, middleware and simulation.
- **Required (POSTED):** BS + 8 yrs coding (C, C++, C#, Java, JS, Python) or equivalent. Must pass the Microsoft Cloud Background Check.
- **Preferred (POSTED):**
  - MS + 12 or BS + 15 yrs.
  - Owning a major platform, framework or runtime used by other teams.
  - **Robot learning at scale (VLA policies, robot foundation models, imitation and RL learning).**
  - Fleet-scale deployment (orchestration, **OTA**, observability, edge runtimes on constrained, intermittently connected hardware).
  - Deep understanding of perception–learning–planning–control–simulation–fleet interactions, "including the failure modes, latency budgets, and trade-offs that emerge at integration boundaries".
  - Cross-disciplinary leadership.
  - Mentoring senior and principal engineers.
  - **ML infrastructure and model serving (inference optimization, low-latency serving, versioning, evaluation, rollback).**
  - **ROS / ROS 2 / Nav2 / MoveIt / RViz / Foxglove, "and the architectural judgment to know where such frameworks fit in a production platform and where they do not".**
  - **Sim-to-real (Isaac Sim, MuJoCo, Drake, Gazebo), domain randomization, synthetic data, scenario-based validation.**
  - Azure, edge-to-cloud, GPU training and inference.
  - **Safety-critical or human-in-the-loop autonomy, with evaluation and governance gates.**
  - C++ and Python.
  - Publications, open source, patents or standards work.
- **Related Microsoft Robotics postings** (RELATED; same org, other levels and areas):
  - Navigation (IC4; localization, mapping, planning, controls integration): https://www.justjobs.com/career/18085196/Member-Technical-Staff-Microsoft-Robotics-Navigation-Washington-Redmond
  - Software Systems (Principal; SDKs, cloud services, edge runtimes, agent orchestration; closed): https://jobs.weareadamarie.com/companies/microsoft/jobs/81016774-member-of-technical-staff-microsoft-robotics-software-systems
  - Field Robotics: https://campusbuilding.com/company/microsoft/jobs/member-of-technical-staff-microsoft-robotics-field-robotics/56270/
- **Public information:**
  - PUBLIC: Microsoft Research announced **Rho-alpha (ρα)** on Jan 21, 2026. It is a vision-language-action robotics model derived from Phi, for bimanual manipulation, with tactile sensing and learning from human feedback; there is an early access program. Sources: https://www.microsoft.com/en-us/research/story/advancing-ai-for-the-physical-world/ and https://www.therobotreport.com/microsoft-research-reveals-rho-alpha-vision-language-action-model-for-robots/
  - PUBLIC: The Microsoft Research blog post "Offloaded inference for real-world physical AI robotics" (https://www.microsoft.com/en-us/research/blog/offloaded-inference-for-real-world-physical-ai-robotics/) covers deploying robot AI across robots, edge GPUs and Azure. I only saw its title and summary; read it before interviews.
- **Interview process:**
  - PUBLIC (third-party, reported): Principal loops are 4–6 rounds (coding, 1–3 design, project deep dive, leadership). There may be a final senior interviewer, historically called "As Appropriate" (no longer an official term). At principal level, design depth and cross-org influence dominate. Sources: https://spacecomplexity.ai/blog/microsoft-principal-software-engineer-interview, https://www.interviewcrunch.com/guides/microsoft-interview-process
  - Microsoft's public values (respect, integrity, accountability, growth mindset) appear in the posting itself (POSTED).

---

## What I could not verify
- The Qualcomm requisition number on Qualcomm's own site. The match is by exact title, city and recency on Dice.
- Microsoft's pay line for this exact requisition.
- Any team-specific interview loop from the companies themselves, except Anthropic's "no LeetCode" note (POSTED) and Roblox's 2022 official interview article.
- Whether Roblox uses Bazel. I did not claim it.
