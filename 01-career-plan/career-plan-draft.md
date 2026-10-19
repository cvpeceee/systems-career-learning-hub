# Career Plan: Systems → Robotics-Redeployable Path
## For Chandra Vig | Reference document | Sep 2026

### North star
Dream project: Tesla Optimus — only via skills that redeploy to other robotics / embedded / systems employers.
Current base: Poly video devices — C++, C vendor drivers (NXP, Lontium, Qualcomm, Ambarella CV7).

### Strategy in one sentence
Go deeper on SoC / drivers / real-time / edge perception (your strength), add robotics-redeployable layers (control intuition, ROS 2, sensors), keep interview coding sharp, treat CUDA/NVIDIA as optional not Plan A.

---

## Part 1 — Ranked saved jobs (fit × demand × Optimus redeployability)

Scoring logic:
- Fit: how close to Poly/SoC/C++/drivers background
- Demand: how widely those skills hire outside one company
- Optimus bridge: how much the work builds humanoid/robotics-adjacent muscle without Tesla lock-in

### Tier 1 — Prioritize first (best next moves)
1. **OpenAI — Host Systems Software Engineer** — Highest fit among saved list. C/C++, Linux, drivers, PCIe/DMA/NIC, bring-up. Skills redeploy to robotics compute stacks, NVIDIA host, custom silicon teams. Strong demand for this profile.
2. **NVIDIA — Senior Solution Engineer, Networking** (and similar host/networking systems) — Customer + embedded networking; uses C/Linux/device stack. Redeploys to robotics interconnects, factories, cloud GPU clusters. More openings than pure CUDA driver.
3. **Broadcom — R&D Engineer Software (NOS / forwarding)** — Deep C/C++, silicon SDK, customer-facing. Redeploys to any high-speed networking/robotics fabric work. Stretch on L2/L3 but valuable.

### Tier 2 — Strong if you add one adjacency
4. **NVIDIA — Senior System Software Engineer, Datacenter Power Management** — Embedded/firmware/control loops; closer to real-time control than CUDA. Good robotics-adjacent (actuators/power/thermal thinking).
5. **Cloudflare — Senior Distributed Systems Engineer** — High demand broadly; needs Go/Rust + distributed systems stretch from embedded. Great backup career liquidity.
6. **Perplexity — Storage Platform / API Platform MTS** — High demand backend/infra; less Optimus-direct but excellent market insurance.
7. **evoke — Principal Software Engineer | Golang** — Backend distributed; weaker Optimus bridge, strong market liquidity if you learn Go.

### Tier 3 — Only if you deliberately retool
8. **NVIDIA CUDA Driver / Principal CUDA / CUDA DL Systems** — High prestige, narrower redeploy surface; only after host/systems depth. Do not prioritize for Optimus dream.
9. **Google — Staff GDC Storage** — Strong infra career; weak robotics bridge from Poly today.
10. **Palo Alto Networks FDE / JPMorgan Agentic AI / BoA AI Security / Toshiba AI-Native** — Production AI platforms; valuable market, weak natural bridge from device drivers unless you pivot hard.
11. **NVIDIA Principal Architect AI Networking / Cloud-Native CSP** — Senior specialist; later-career targets after networking + systems depth.

### Jobs to ADD (you may have missed — Optimus-compatible AND redeployable)
Search these titles at Tesla *and* peers (Figure, Apptronik, Boston Dynamics, Agility, 1X, Amazon Robotics, NVIDIA Isaac, Apple Special Projects, Rivian/robotics teams, warehouse robotics):
1. **Embedded Software Engineer — Humanoid / Robotics** (actuators, RTOS/Linux, motor control interfaces)
2. **Robotics Software Engineer — Perception on Edge** (Ambarella/Qualcomm CV SoC experience is a direct story)
3. **Systems Software Engineer — Robot Compute / Host Stack** (similar to OpenAI Host)
4. **Firmware Engineer — Sensors / Cameras / ISP** (Poly + Lontium/NXP camera pipelines map well)
5. **Controls Software Engineer — Real-time** (if you enjoy control loops; pairs with power/thermal experience)
6. **Platform Engineer — Autonomy Compute** (bring-up, BSP, Yocto/Buildroot, device trees)

Tesla Optimus-specific postings change often; chase the *skill shape*, not one frozen req.

---

## Part 2 — What “in demand + hard for AI to replace” means for you
Prioritize: cross-layer debugging, bring-up ownership, real-time constraints, sensor/actuator reality, design trade-offs, incident judgment, explaining hardware/software to others.
Deprioritize as primary: memorizing API trivia, CUDA-only specialization, prompt-engineering as a career.

---

## Part 3 — 6–12 month plan

### Months 1–3 — Deepen your current superpower + interview coding
**Theme:** Become unmistakably strong at SoC bring-up and driver-quality C/C++.
- At Poly: volunteer for hardest bring-up / stability / performance bugs; write one internal design doc per month.
- Personal lab: embedded Linux board (or QEMU): device tree, character driver, interrupt + DMA mental model, profiling.
- Coding: 4–5 problems/week — arrays, hashes, two pointers, trees, graphs basics; C++ STL fluency for interviews.
- Analogy focus: treat the SoC like a factory floor — CPU is foreman, DMA is forklifts, interrupts are alarm bells, drivers are shift supervisors.

### Months 4–6 — Robotics-redeployable layer (not Tesla-only)
**Theme:** Same hands, new factory: robots instead of conference devices.
- ROS 2 basics visually: nodes as workers passing messages on a radio net.
- Edge vision path using your Ambarella/Qualcomm story: camera → ISP → inference/postprocess latency budget.
- One portfolio project: “mini perception pipeline” on SBC (Pi/Jetson/similar) OR serious simulation — document architecture with diagrams.
- Systems interview depth: processes/threads, memory, locks, lock-free basics, debugging stories from Poly.

### Months 7–9 — Host / I/O / real-time adjacency (opens OpenAI Host + robot compute)
**Theme:** How compute talks to the physical world at speed.
- PCIe/DMA/NIC mental models (visual explainers first).
- Optional thin GPU literacy (what kernels are, host↔device copies) — awareness only, not CUDA career.
- Apply/interview Tier 1 roles; keep Poly achievements quantified.

### Months 10–12 — Package the story + target applications
**Theme:** Liquidity + dream.
- Resume/LinkedIn narrative: “Embedded systems → robot/edge compute” with 3 war stories.
- Target mix: 50% robotics/embedded (incl. Tesla Optimus if open), 30% host/systems (OpenAI-like), 20% high-demand infra backup (Cloudflare/Perplexity-like).
- Mock interviews: coding + systems design for device/robot platform.

### Weekly rhythm (sustainable)
- 3 sessions coding interview practice (45–60 min)
- 2 sessions systems/robotics learning (visual course + notes with analogies)
- 1 session build/project
- 1 short write-up (diagram or 1-page design note)

---

## Part 4 — Resources (filled after research)
