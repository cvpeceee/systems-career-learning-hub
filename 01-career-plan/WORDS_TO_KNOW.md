# Words to know — Career Plan

Every technical term in the career plan PDF and draft, in the order it first appears. Same definitions as the shared glossary used by every course (`shared/glossary/glossary.json`). Read the meaning, then the everyday picture.

| # | Term | Plain meaning | Like… |
|---|---|---|---|
| 1 | **driver** | Code that lets the OS talk to one kind of hardware. | An interpreter between the OS and a device. |
| 2 | **AI** | Artificial Intelligence: software that learns patterns from data to make predictions or decisions. | A trainee who learns by looking at thousands of worked examples. |
| 3 | **SoC** | System on Chip: a single chip containing CPU, GPU, memory controllers and peripherals. | A whole kitchen packed into one appliance. |
| 4 | **firmware** | Software that runs close to the hardware, usually stored in flash on the device. | The instincts built into a device. |
| 5 | **latency** | How long one operation takes from request to answer. | How long you wait for your coffee. |
| 6 | **device tree** | A text description of a board's hardware that the Linux kernel reads at boot. | A floor plan handed to the electrician. |
| 7 | **IRQ** | Interrupt Request: a signal from hardware telling the CPU "stop and deal with me now". | A doorbell ringing while you are cooking. |
| 8 | **DMA** | Direct Memory Access: a helper engine that copies data between devices and memory without the CPU touching each byte. | A conveyor belt that moves boxes while the manager (CPU) does other work. |
| 9 | **CUDA** | NVIDIA's programming platform for writing code that runs on its GPUs. | The instruction manual for directing the stadium of students. |
| 10 | **edge** | A connection between two nodes in a graph; also "the edge" = servers close to users. | A road between two cities. |
| 11 | **ROS** | Robot Operating System: a toolkit of libraries and message passing for building robot software. | A shared intercom system so every robot part can talk to every other part. |
| 12 | **PID** | Proportional-Integral-Derivative controller: a feedback loop that nudges a motor or heater toward a target; also Process ID in Linux. | Steering a car: correct for how far off you are, how long you've been off, and how fast you're drifting. |
| 13 | **PCIe** | PCI Express: the modern high-speed serial version of PCI. | A multi-lane motorway for expansion cards. |
| 14 | **GPU** | Graphics Processing Unit: a chip with thousands of small cores that do the same math on lots of data at once. | A stadium of students each solving one simple sum at the same time. |
| 15 | **stack** | Last-in-first-out structure; also the memory area holding function calls. | A stack of plates. |
| 16 | **ASIC** | Application-Specific Integrated Circuit: a chip designed for one job. | A kitchen gadget that only makes waffles, but makes them perfectly. |
| 17 | **SDK** | Software Development Kit: a bundle of libraries, tools and docs for building on a platform. | A toolbox that comes with a new piece of furniture. |
| 18 | **API** | Application Programming Interface: the agreed set of functions or requests one piece of software offers another. | A restaurant menu: you order from it without knowing how the kitchen works. |
| 19 | **BSP** | Board Support Package: the chip vendor's bundle of bootloader, kernel, drivers and configs for one board. | The starter kit that comes with a new house: keys, wiring diagram and fuse box labels. |
| 20 | **ISP** | Image Signal Processor: the chip block that turns raw camera sensor data into a clean picture. | A photo lab that develops raw film into a finished print. |
| 21 | **MIPI** | Mobile Industry Processor Interface: a family of standard high-speed wires between chips, cameras (CSI) and displays (DSI). | A standard plug shape so any camera fits any phone board. |
| 22 | **Yocto** | A build system for making custom embedded Linux images from recipes. | A recipe kitchen that bakes your own Linux distribution. |
| 23 | **PREEMPT_RT** | The Linux real-time patch set that makes the kernel interruptible almost everywhere. | Letting an ambulance cut into any lane at any moment. |
| 24 | **RT** | Real-time: must finish within a fixed deadline; also RT kernel (PREEMPT_RT). | A train that must leave exactly on time. |
| 25 | **V4L2** | Video4Linux2: the Linux kernel framework and API for cameras and video capture. | The standard socket that every camera plugs into on Linux. |
| 26 | **CPU** | Central Processing Unit: the main general-purpose processor that runs programs step by step. | The head chef who can cook anything, one dish at a time. |
| 27 | **interrupt** | A hardware signal that makes the CPU pause and handle an urgent event. | A doorbell ringing while you cook. |
| 28 | **kernel** | The core of the operating system that controls hardware, memory and processes. | The building's engine room. |
| 29 | **node** | One point in a graph or tree; also one machine in a cluster. | A city on a map, or one computer in a group. |
| 30 | **CV** | Computer Vision: software that understands images; CV7 is an Ambarella camera chip. | Teaching a computer to see. |
| 31 | **RoCE** | RDMA over Converged Ethernet: running RDMA on normal Ethernet networks. | Express parcel lockers built on ordinary roads. |
| 32 | **I2C** | Inter-Integrated Circuit: a slow two-wire bus for chips on a board to talk (sensors, bridges, power chips). | A party line telephone where each chip answers only to its own name. |
| 33 | **OS** | Operating System: the core software (like Linux or Android) that manages hardware and runs apps. | The building manager who hands out rooms, power and water to tenants. |
| 34 | **DRAM** | Dynamic RAM: the main working memory of a computer; fast but forgets everything when power is off. | A whiteboard: quick to write on, wiped when the lights go out. |
| 35 | **LED** | Light-Emitting Diode. | A tiny light bulb. |
| 36 | **RDMA** | Remote Direct Memory Access: one machine writes straight into another machine's memory over the network, skipping the CPU. | Dropping a parcel straight into a neighbour's locker instead of handing it to their receptionist. |
| 37 | **HPC** | High-Performance Computing: supercomputing on large clusters. | A whole factory working on one giant order. |
| 38 | **mutex** | A lock that lets only one thread at a time into a section of code. | A single bathroom key on a hook. |
| 39 | **atomic** | An operation that happens all at once; no other thread can see it half-done. | Flipping a light switch — it's either on or off, never half. |
| 40 | **pointer** | A variable holding the memory address of something else. | A note saying "the book is on shelf 4". |
| 41 | **RAII** | Resource Acquisition Is Initialization: a C++ habit where an object frees its resource automatically when it goes out of scope. | A hotel key card that stops working the moment you check out. |
| 42 | **endianness** | The byte order a CPU uses to store multi-byte numbers (little- or big-endian). | Writing a date as day-month or month-day. |
| 43 | **MMIO** | Memory-Mapped I/O: controlling hardware by reading and writing special memory addresses. | Light switches that look like ordinary mailboxes: put a letter in and a light turns on. |
| 44 | **ISR** | Interrupt Service Routine: the short function that runs when a hardware interrupt fires. | The person who jumps up to answer the doorbell. |
| 45 | **ring buffer** | A fixed-size circular queue where the writer wraps around to the start. | A rotating sushi belt. |
| 46 | **URL** | Uniform Resource Locator: a web address. | A street address for a web page. |
| 47 | **NIC** | Network Interface Card: the hardware that connects a computer to a network. | The mailbox and postman's slot of a house. |
| 48 | **MTS** | Member of Technical Staff: an engineering job title. | A job title meaning "engineer". |
| 49 | **CSP** | Cloud Service Provider (AWS, Azure, Google Cloud); also Content Security Policy for web pages. | A company that rents out data-centre space. |
| 50 | **RTOS** | Real-Time Operating System: a small OS that guarantees tasks run within strict time limits. | A train timetable that never lets a train leave late. |
| 51 | **QEMU** | A free emulator that pretends to be a whole computer or board in software. | A flight simulator for computer hardware. |
| 52 | **array** | Items stored side by side in memory, reached by index. | A row of numbered lockers. |
| 53 | **two pointers** | A technique moving two indices through an array to avoid nested loops. | Two people walking toward each other from both ends of a hall. |
| 54 | **graph** | A set of nodes connected by edges. | A map of cities and roads. |
| 55 | **STL** | C++ Standard Template Library (vectors, maps, algorithms). | The C++ built-in toolbox. |
| 56 | **inference** | Running a trained model to get predictions (not training it). | Using a recipe you already perfected. |
