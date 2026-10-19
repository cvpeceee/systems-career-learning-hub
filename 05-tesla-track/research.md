# Tesla Track: research notes (gathered 2026-10-07)

How this was gathered:
- tesla.com/careers returned **HTTP 403** to the fetch tool, so postings were read from public job-board mirrors of Tesla listings: Lensa, Simplify, justjobs, iHire, physicalai.jobs, ev.careers, ClimateTechList, Dice, veteran-hiring and others.
- Each entry gives the board URL and, where visible, the posting date.
- Mirrors can lag the live Tesla site. Treat every posting as **"publicly listed at the time of capture,"** not as a guarantee that it is open today.

Labels used below:
- **[POSTING]** quoted or paraphrased from a job listing.
- **[PUBLIC-TESLA]** stated by Tesla or its executives in public talks, events or pages (AI Day, Autonomy Day, earnings calls, X posts), as reported by the cited source.
- **[REPORTED]** third-party reporting or candidate accounts; plausible but **unconfirmed**.
- **[INFERRED]** my synthesis or generalization; **not a Tesla statement**.

---

## 1. Sampled postings (22; 20 current in 2026 plus 2 older ones kept for planning and simulation coverage)

| # | Title (team) | Source (date seen) | Required / preferred skills (condensed) |
|---|---|---|---|
| 1 | Embedded Software Engineer, Optimus | https://www.ihiretechnology.com/jobs/view/532702934 (posted 8/13/2026) | Real-time embedded C; MCU peripherals ADC/PWM/SPI/I2C/CAN; Ethernet data-link; sensors + DSP; RTOS & multicore; MISRA C, power/battery budgeting a plus; automated tests; bring up sensors, networks, boards; "sensing, control and safety management of the Tesla Bot subsystems". $140k–$390k |
| 2 | Embedded Linux Engineer, Optimus (Tesla AI, Req 281344) | https://simplify.jobs/p/0885ed26-3298-423f-9777-5159989c8adc/Embedded-Linux-Engineer (8/26/2026) | Buildroot/Yocto, kernel config, cross-compilation; kernel modules & platform drivers; vendor BSPs; device trees; I2C/SPI/UART/PWM/ADC/eMMC/PCIe/USB/Ethernet MAC-PHY-MDIO/CAN; PHY bring-up; TSN/PTP/AVB a plus |
| 3 | Embedded Systems Engineer, Optimus | https://lensa.com/job-v1/tesla/palo-alto-ca/embedded-systems-engineer/680e91cd09d9b07ef2f569e86492e473 (9/13/2026) | Linux bring-up + real-time firmware on heterogeneous compute; inter-process and inter-processor communication; boot & updater flows across Linux/RTOS/bare-metal; modern C++; audio DSP, display, high-speed comms drivers; device trees |
| 4 | Software Engineer, C++ Generalist, AI Systems & Infrastructure (Foundations) | https://lensa.com/job-v1/tesla/palo-alto-ca/c-developer/1c49371afd05fd194a41835fade89659 (4/14/2026) | Modern C++14/17/20; latency/throughput/memory of the onboard camera & vision stack; image compression; high-performance IPC buffers; logging/telemetry; replay software; embedded Linux cross-compilation; CUDA/OpenCL/SIMD a plus. Serves FSD and Optimus |
| 5 | Software Engineer, Core AI Compiler | https://tallo.com/talent/job/technology/software-developer-or-engineer/ca/palo-alto/software-engineer-core-ai-com-6a1ee0c8 | ML compilers/runtimes (MLIR, XLA, PJRT, TensorRT); PyTorch/JAX internals; modern C++; debug massively parallel systems; deploy models to the car and Optimus |
| 6 | Firmware Engineer, AI Linux Systems | https://www.ihireengineering.com/jobs/view/532705397 (8/13/2026) | Strong C and C++; MCU firmware (bare-metal/RTOS); Ethernet, PCIe switch, NVLink config; IPC/data transport across compute nodes; secure boot & updates; TSN/PTP; JTAG/logic analyzers/scopes. Covers vehicles, humanoids and server inference |
| 7 | Sr. Embedded Firmware Development Engineer (Sensing) | https://www.physicalai.jobs/tesla/sr-embedded-firmware-development-engineer | 5+ yrs embedded C/C++; Python/Matlab for testing DSP/ML; FreeRTOS + Linux; drivers SPI/I2C/UART/DMA/IRQ/USB/timers/ADC/Flash; CAN/CAN-FD; bootloaders, linker scripts; JTAG/SWD; FIR/IIR/FFT; "debug hard issues using the first principles"; "more than half of the development time is spent on … testing and validation" |
| 8 | Motor Controls Engineer, Vehicle Software / Vehicle Controls | https://emploive.com/jobs/5455205/motor-controls-engineer-vehicle-software-tesla ; https://www.jointaro.com/jobs/tesla/motor-controls-engineer-vehicle-controls/ | AC motors & drives; linear systems & stability; embedded C/C++; Matlab/Simulink; FOC, PWM schemes, sensorless/low-speed; torque control; steer-by-wire; Taro listing mentions Optimus |
| 9 | Applied Reinforcement Learning Engineer, Whole Body Controls, Optimus | https://justjobs.com/career/17500921/Applied-Reinforcement-Learning-Engineer-Whole-Body-Controls-Optimus-California-Palo-Alto | Python/PyTorch; RL for control; observations/actions/rewards "based on physics first principles"; sim2real, domain randomization, learned dynamics; kinematics, dynamics, probability; IMU/state estimation a plus; C++/real-time a plus; IsaacLab/mjlab |
| 10 | Reinforcement Learning Engineer, Whole Body Controls (Locomotion), Optimus | https://justjobs.com/career/13470048/Reinforcement-Learning-Engineer-Locomotion-Optimus-California-Palo-Alto | Policy-gradient/actor-critic; reward design, curricula; sim2real; massively parallel sim |
| 11 | Modeling & Simulation Design Engineer, Optimus | https://talents.vaia.com/companies/tesla/modeling-simulation-design-engineer-optimus-24067752/ | Controls (inverted pendulum, MPC, motor control); IK, forward/inverse dynamics, impedance & torque control; gear reductions (planetary, belt, magnetic); Python/C++/Matlab |
| 12 | Software Engineer, Controls, Optimus | https://www.climatetechlist.com/job/tesla-software-engineer-controls-optimus-yk6SBpjKikduvZ | Control code for bipedal locomotion, manipulation, state estimation; simulation engine; "will run in thousands of humanoid robots" |
| 13 | Sr. Software Engineer, Motion Planning & Navigation, Optimus | https://www.dice.com/job-detail/07ef842f-7836-4276-8a58-192e73c94369 | Motion planning under uncertainty; multi-agent; trajectory generation; interfaces between subsystems; safety-critical production software |
| 14 | Embedded Systems Software Engineer Intern (AI platform) | https://simplify.jobs/p/88766d81-38a1-4e05-86b9-0d4f5f4f630b/Embedded-Systems-Software-Engineer-Intern | RTOS bring-up; real-time C; Linux drivers for AI accelerators, **camera capture, ISP**, GPU, Ethernet, UFS, PCIe; Ethernet/CAN. Car + humanoid + inference |
| 15 | Kernel Optimization Software Engineer, AI Hardware | https://justjobs.com/career/16840980/Kernel-Optimization-Software-Engineer-Ai-Hardware-California-Palo-Alto (9/26/2026) | Kernels for Tesla AI and Dojo ASICs with an MLIR-based compiler; quantization/precision tradeoffs; roofline; SIMD/GPU architecture; shaping **AI5, AI6, Dojo3** |
| 16 | Software Engineer, Runtime, AI Inference | https://tesla.veteran-hiring.com/job-detail/software-engineer-runtime-ai-inference-221965 | Inference runtime on the **FSD chip**; export/compiler/runtime; GPU kernels; async/multithreaded; modern C++; CUDA/OpenCL/SIMD or custom ASIC a plus; MLIR/XLA/TensorRT/TVM a plus |
| 17 | Software Engineer, AI Inference CoDesign | https://justjobs.com/career/15751532/Software-Engineer-Ai-Inference-Codesign-California-Palo-Alto (9/27/2026) | Lower networks to edge CPU/GPU/AI ASIC; compress to low precision; custom CUDA/OpenCL kernels; PyTorch; modern C++; computer architecture |
| 18 | Camera Software Engineer, Tesla AI (also "Software Engineer, Camera, AI Platforms") | https://www.physicalai.jobs/tesla/camera-software-engineer-tesla-ai (8/26/2026); https://autonomywork.com/software-engineer-camera-ai-platforms-tesla-315 | Modern C++, multithreading, Python; CUDA/OpenCL plus; **color filter arrays, exposure control, sensor timing, in-sensor HDR, imager bring-up**; ISP pipelines & tuning; 3A; codecs; embedded Linux cross-compilation |
| 19 | Robotics Software Engineer, C++ Generalist, Optimus | https://ev.careers/jobs/225595064-robotics-software-engineer-c++-generalist-optimus | Modern C++, multithreading, Python; low-level systems design; **CAN, EtherCAT, Ethernet**; embedded Linux cross-compilation; integrate main computer, sensors, motor controllers, telemetry |
| 20 | Software Engineer, Distributed Training, AI Infrastructure | https://justjobs.com/career/11193826/Software-Engineer-Distributed-Training-Ai-Infrastructure-California-Palo-Alto (9/27/2026) | Python and/or C/C++; PyTorch; scale training across many GPUs; parallel primitives; profile CPU–GPU interactions; CUDA/Triton/NCCL; debug failures across thousands of nodes |
| 21 | Motion Planning Engineer, Autopilot *(older/undated listing)* | https://www.wizbii.com/company/tesla/job/motion-planning-engineer-autopilot | Production C++; safety-critical; A*, D*, RRTs; simulation + hardware; real-time embedded |
| 22 | Software Engineer, Generalist, Simulation (Autopilot) *(Jun 2024, closed)* | https://www.huzzle.com/jobs/software-engineer-generalist-simulation-346907 | C++/Python; HIL; linear algebra, numerical methods; Unreal Engine 5; vehicle dynamics, sensors |

Salary ranges seen in these postings: $104k–$420k plus cash and stock awards, depending on the role.

## 2. Skill frequency across the 22 postings [INFERRED: my tagging]

| Skill cluster | Postings (count) |
|---|---|
| C / C++ (modern C++14/17/20 often explicit) | 18 |
| Python (required or plus) | 13 |
| Embedded Linux: kernel modules, drivers, BSP, device tree, cross-compilation | 8 |
| Buses: CAN/CAN-FD, EtherCAT, Ethernet, SPI/I2C/UART | 7 |
| MCU firmware / RTOS / bare-metal | 6 |
| CUDA / OpenCL / SIMD / GPU kernels | 6 |
| Controls: kinematics, dynamics, state estimation, MPC, impedance, FOC | 5 |
| Simulation / RL / sim2real | 5 |
| Testing & validation (HIL/SIL, automated tests) | 5 |
| Multithreading / IPC / async | 5 |
| PyTorch / distributed training | 5 |
| ML compilers/runtimes (MLIR, XLA, TensorRT, TVM) & lowering | 4 |
| Performance profiling / latency / roofline | 4 |
| PCIe / Ethernet PHY / TSN / PTP | 4 |
| Camera / ISP / imaging pipeline / image sensors | 3 (+1 sensing firmware) |
| Secure boot / OTA / bootloaders / updater flows | 3 |
| Safety-critical (MISRA, safety-critical production code) | 3 |
| Hardware debugging (JTAG, scope, logic analyzer, schematics) | 3 |
| Motion planning (A*, D*, RRT, trajectory generation) | 2 |
| Quantization / low precision | 2 |

**Fit with your background [INFERRED]:** your Poly work already lines up with postings #1–4, 6, 7, 14, 18 and 19: camera/CSI-2/ISP bring-up on Lontium, Ambarella and Qualcomm, plus vendor drivers and C/C++. The biggest gaps for Optimus and FSD roles are:
- controls fundamentals (kinematics, balance, MPC, FOC);
- fieldbuses (EtherCAT/CAN-FD) at kHz rates;
- inference lowering and quantization;
- modern-C++ fluency under interview conditions.

## 3. Interview signals

- **[POSTING]** "Degree … or proof of exceptional skills in related fields" appears in many listings (#1, 2, 3, 15, 16, 17). The sensing posting stresses first-principles debugging and says more than half the time goes to testing and validation (#7). The Optimus listings stress that code ships "to thousands of humanoid robots" (#9–13).
- **[PUBLIC-TESLA / Musk quote]** Musk: "When hiring, I look for evidence of exceptional ability … In interviews, I ask people to tell me the story of their career and some of the tougher problems they dealt with … Ask them detailed questions about it, and they'll know the answers." Source: *The Book of Elon Musk* (E. Jorgenson), compiled quotes, https://www.elonmuskbook.org/the-book-of-elon-musk-free-online-version/recruit-for-exceptional-ability
- **[PUBLIC-TESLA]** Musk's 5-step "algorithm" (make requirements less dumb → delete the part or process → simplify/optimize → accelerate cycle time → automate) was described in his 2021 Starbase tour with Everyday Astronaut. Sources: https://www.erikksherman.com/blog/musk-design-process ; https://aviationweek.com/space/commercial-space/algorithm-spacexs-five-step-process-better-engineering
- **[REPORTED]** Process (third-party guide, candidate reports): recruiter or AI screen → hiring-manager call → online assessment (Codility/HackerRank) → live coding screen (CoderPad) → 3–5 round panel (coding, system design, behavioral/first-principles). The guide reports an "Evidence of Excellence" application field (2,500 characters) and that take-homes were dropped for software engineers. Commonly reported design prompts are fleet telemetry and an Autopilot training-data pipeline. Source: https://leonstaff.com/blogs/tesla-interview-process/ (Jun 2026). **Unconfirmed; it varies by team.** Firmware and embedded teams are widely reported to ask C questions (bit manipulation, volatile, ISRs, ring buffers) **[REPORTED/INFERRED]**.

## 4. Public technical facts used in the track (with sources)

### FSD / Autopilot perception
- **[PUBLIC-TESLA, AI Day 2021]** The vision stack rectifies eight camera streams (1280×960, 12-bit HDR, ~36 Hz) to a common virtual camera. It uses a RegNet backbone and BiFPN multi-scale fusion. A transformer projects multi-camera features into a "vector space" (bird's-eye view). A feature queue (time-based ~27 ms and distance-based ~1 m entries) and a spatial RNN supply temporal memory. HydraNet means a shared backbone with task-specific heads (objects, lanes, traffic lights, depth/velocity). The talk also covered auto-labeling and simulation. Sources: talk https://www.youtube.com/watch?v=j0z4FweCy4M ; summaries https://kimbochen.github.io/blog/2021/11/09/tesla-ai-day-vision.html , https://pharath.github.io/self%20driving/post-Tesla-AI-day-2021/
- **[PUBLIC-TESLA, AI Day 2022]** The occupancy network predicts 3D occupancy, occupancy flow and semantics from 8 cameras. Lanes are decoded autoregressively as a "language of lanes." Auto-labeling uses multi-trip 3D reconstruction. Tesla reported ~12 hours of cluster time to label 10,000 trips vs ~5 million human hours (as presented). Sources: talk https://www.youtube.com/watch?v=ODSJsviD_SU ; summaries https://www.armand.so/recap-tesla-ai-day-2022/ , https://kevinchen.co/blog/tesla-ai-day-2022/
- **[PUBLIC-TESLA]** FSD v12 was described as end-to-end neural networks ("photons in, controls out"), replacing ~300k lines of C++ control code. **[REPORTED]** Observers note it is not necessarily a single monolithic network. Sources: https://www.notateslaapp.com/news/1713/tesla-fsd-v12-rolls-out-to-employees-with-update-2023-38-10 ; https://www.rev.com/transcripts/tesla-q3-2023-financial-results-and-qa-webcast-transcript
- **[PUBLIC-TESLA]** "Tesla Vision" removed radar from Model 3/Y in North America from May 2021, and ultrasonic sensors from 2022–23. HW2 and HW3 have 8 cameras (3 forward, 2 B-pillar, 2 fender repeaters, 1 rear). The HW3 cameras used a 1.2 MP sensor (AR0136A per a teardown, **[REPORTED]**). Source: https://en.wikipedia.org/wiki/Tesla_Autopilot_hardware

### FSD computer / inference hardware
- **[PUBLIC-TESLA, Autonomy Day & Hot Chips 2019]** The FSD chip (HW3, Samsung 14 nm) has 12 Cortex-A72 cores, a Mali GPU and **two NPUs**. Each NPU has a 96×96 INT8 MAC array at 2 GHz (~36.8 TOPS) and 32 MB SRAM, and is designed for batch-1 inference. Each board carries **two FSD chips for redundancy**. Sources: https://fuse.wikichip.org/news/2707/inside-teslas-neural-processor-in-the-fsd-chip/ ; https://old.hotchips.org/hc31/HC31_2.3_Tesla_Hotchips_ppt_Final_0817.pdf ; https://en.wikipedia.org/wiki/Tesla_Autopilot_hardware
- **[REPORTED]** HW4/AI4 (Samsung 7 nm), with 16 GB RAM per a teardown. AI4.1 was announced on the Q1-2026 call. AI5 was taped out in April 2026 (Musk on X); volume is expected around mid-2027. Musk said AI5 targets Optimus and data centers rather than cars. Sources: https://electrek.co/2026/04/15/tesla-ai5-chip-taped-out-musk-ai6-dojo3/ ; https://en.wikipedia.org/wiki/Tesla_Autopilot_hardware
- **[POSTING]** The inference stack uses an **MLIR-based compiler** and a co-designed runtime on the FSD chip (#15, #16).

### Dojo / training infrastructure
- **[PUBLIC-TESLA, AI Day 2021/2022; Hot Chips; IEEE Micro 2023]**
  - **D1 chip:** TSMC 7 nm, 50 B transistors, 354 usable cores in a 2D mesh, 1.25 MB SRAM per core, ~362–376 TFLOPS BF16/CFloat8.
  - **Training tile:** 25 D1s in a 5×5 array, ~9 PFLOPS, ~15 kW.
  - **Scale-up:** 6 tiles per system tray; ExaPOD = 120 tiles.
  - **Design choice:** no virtual memory or coherency, chosen deliberately for scalability.
  - **Formats:** CFloat8 and CFloat16, per Tesla's whitepaper.
  - Source: https://en.wikipedia.org/wiki/Tesla_Dojo
- **[REPORTED]** Bloomberg (Aug 2025) reported that the Dojo team was disbanded. Musk restarted "Dojo3" work in Jan 2026. A Kernel Optimization posting (Sep 2026) mentions Dojo3. **Status is fluid**; the track teaches the mesh/SRAM dataflow *concepts*. Sources: same Wikipedia page; posting #15.
- **[REPORTED]** GPU clusters: 5,760 A100s were described in 2021 and 10k H100s were brought online in 2023. Source: https://en.wikipedia.org/wiki/Tesla_Dojo

### Optimus
- **[PUBLIC-TESLA]** Announced at AI Day 2021 as "controlled by the same AI system" as the cars. AI Day 2022 prototype details:
  - 28 structural actuators, consolidated into 6 unique designs;
  - rotary and linear actuators, with linear ones using **planetary roller screws**;
  - hands with 6 actuators and 11 DoF;
  - a 2.3 kWh / 52 V battery pack and a Tesla SoC in the torso;
  - perception reused from Autopilot (the occupancy network).
  - Sources: https://en.wikipedia.org/wiki/Optimus_(robot) ; https://www.theverge.com/2022/9/30/23374729/tesla-bot-ai-day-robot-elon-musk-prototype-optimus-humanoid ; https://www.techspot.com/news/96169-tesla-ai-day-delivers-real-optimus-prototype-more.html
- **[REPORTED]** Gen 2 shown Dec 2023 (hands 11 DoF); a 22-DoF hand reported in 2024. Critics noted teleoperation in some demos (2024). Gen 3 is not revealed as of Sep 2026. Production lines are being installed in Fremont (Q1-2026 update). Source: https://en.wikipedia.org/wiki/Optimus_(robot)

## 5. What is NOT claimed
- No internal Tesla architectures, code, interview questions or team structures beyond the public sources above.
- Wherever the track shows code "inspired by" a Tesla system, it is **general engineering** (textbook PID, FOC, LIPM, A*, INT8 quantization, ring all-reduce and so on), labeled as such.
- Numbers like "a 1 kHz joint loop" or "a 30 ms perception budget" are typical industry figures **[INFERRED]**, not Tesla specs.

## 6. Additional public facts used in chapters T2–T8 (added during content build)
- **[PUBLIC-TESLA, archived Tesla Autopilot page, HW2/HW3 era]** Camera maximum ranges: narrow forward 250 m, main forward 150 m, wide forward 60 m, forward-looking side (B-pillar) 80 m, rearward-looking side (repeater) 100 m, rear 50 m. Used only as an approximate layout in the T3.3 BEV lab. Sources: https://web.archive.org/web/20170204091621/www.tesla.com/autopilot-features-landing-page ; https://electrek.co/2017/05/16/tesla-autopilot-2-0-can-see/
- **[PUBLIC-TESLA, Autonomy Day 2019]** Karpathy described the "data engine": the fleet collects rare and failure cases (interventions, disagreements), new models run in **shadow mode**, and triggers stream data back for retraining. **[PUBLIC, patent]** Tesla patented trigger classifiers that score intermediate network outputs to decide which sensor data to upload. Sources: https://pharath.github.io/self%20driving/post-Tesla-Autonomy-Day-2019/ ; https://patents.google.com/patent/US20210271259A1/en ; https://electrek.co/2020/03/23/tesla-patent-sourcing-self-driving-training-data/
- **[PUBLIC-TESLA, AI Day 2021, planning segment (Ashok Elluswamy)]**
  - The planner consumes vector space and optimizes safety, comfort and efficiency, using hybrid discrete search plus continuous optimization ("convex corridor, then optimize for a smooth path"; lateral jerk minimized).
  - Thousands of maneuver searches run in a short time span, for the ego car and for other agents.
  - Parking-lot example: A* with a Euclidean heuristic expanded ~400,000 nodes; adding a navigation-route heuristic, ~22,000; a neural-network value function with Monte Carlo tree search, 288 nodes.
  - Source (transcript summary): https://pharath.github.io/self%20driving/post-Tesla-AI-day-2021/
