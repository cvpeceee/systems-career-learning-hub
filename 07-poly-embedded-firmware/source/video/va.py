from common import *
V=[
V("v01-roles-decoded","Lesson 1 · Start here","Your two Poly roles, decoded",[
S("title",sub="What 'below the framework layer' really means",items=["The restaurant analogy","The stack you own","What 'full USB stack' means"],say=[
"Welcome to the Poly Firmware Academy. This first video decodes the two job descriptions for your team, so every later lesson has a place on the map.",
"We start with an analogy, define the key words, walk the stack from top to bottom, and finish with what success looks like."]),
S("analogy","Plain analogy: a restaurant",items=["Diners = Teams and Zoom apps","Dining room = Android framework","Kitchen = HALs and native daemons","Basement wiring = kernel drivers","Front door lock = bootloader and secure boot","Delivery door = USB"],say=[
"Picture a conference room camera bar as a restaurant.",
"The diners are the apps, like Microsoft Teams or Zoom. They only ever see the dining room.",
"The dining room is the Android framework: the system services the apps call.",
"The kitchen is the hardware abstraction layer and the native daemons. That's where the real cooking happens.",
"The basement wiring is the Linux kernel and its drivers.",
"The front door lock is the bootloader and secure boot.",
"And the delivery door is USB: how the camera, microphone and speaker reach a laptop. Both job postings say your work is below the dining room."]),
S("terms",items=[("Firmware","Software that runs close to hardware, usually stored in flash."),("Framework layer","Android's Java system services that apps talk to."),("HAL","Hardware abstraction layer: a fixed interface the OS calls and the device maker implements."),("BSP","Board support package: the chip vendor's bootloader, kernel, drivers and configs."),("SVC","Scalable video coding: a layered video stream.")],say=[
"A few words first.",
"Firmware is software that runs close to the hardware, usually stored in flash memory on the device.",
"The framework layer is Android's set of Java system services, like the camera service and the USB service, that apps talk to.",
"A HAL, or hardware abstraction layer, is a fixed interface that Android calls, and that the device maker implements.",
"A BSP, or board support package, is the chip vendor's bundle: bootloader, kernel, drivers and configuration for one chip or board. You already work with these from N X P, Qualcomm and Ambarella.",
"And S V C, scalable video coding, is a video stream sent in layers, so a slow receiver can drop layers instead of the whole picture."]),
S("flow","The stack you own, top to bottom",items=["Apps (Teams / Zoom rooms)","Android framework services","HAL + native daemons","Linux kernel drivers","Bootloader / secure boot","SoC, bridges, USB PHY"],subs=["not yours","calls your HALs","yours","yours","yours","vendor silicon"],say=[
"Now the stack, top to bottom.",
"At the top are apps, like the Teams or Zoom room software. That's not your layer.",
"Below that, Android framework services, which call down into your code.",
"Then the HALs and native daemons: camera, audio and USB services written in C plus plus. This is yours.",
"Then the Linux kernel drivers: video for Linux, ALSA audio, the USB gadget stack, and I two C bridge drivers, like the Lontium HDMI bridges. Also yours.",
"Then the bootloader and secure boot chain. Also yours.",
"And at the bottom, the silicon from Qualcomm, N X P, Ambarella and Lontium."]),
S("bullets","What the 'full USB software stack' means here",items=["Device side: DWC3 → gadget → UVC / UAC2 / HID → streaming app → Android USB HAL","Host side: xHCI, hubs, class drivers, power budget","Type-C / PD: role swap, orientation, DisplayPort alt mode","Firmware update over USB (DFU) and accessory MCUs","Debugging: usbmon, Wireshark, hardware analyzers"],say=[
"The USB posting calls one thing a must have: deep, hands on knowledge of the full USB software stack. Here's what that means on a conferencing device.",
"Device side: the board plugs into a laptop and appears as a webcam, microphone, speaker and buttons. That path runs from the D W C 3 controller, through the Linux gadget framework, to the U V C and U A C functions, a streaming app, and Android's USB HAL.",
"Host side: the device also hosts peripherals, like extension microphones, so you need the x H C I host controller, hubs and class drivers.",
"Type C and power delivery: who is host, who is device, which way the cable is flipped, and DisplayPort over the same connector.",
"Firmware updates over USB, including the small microcontrollers inside accessories.",
"And the debugging tools: usbmon, Wireshark and hardware analyzers. Lessons ten to fourteen cover all of this."]),
S("bullets","The senior verbs both postings repeat",items=["Lead secure, scalable, high-performance C/C++","Define architecture, standards, best practices","Troubleshoot complex system-level issues","Own planning, documentation, testing strategy","Mentor junior engineers","Drive agile / lean improvement"],say=[
"Both postings also repeat the same senior responsibilities.",
"Lead secure, scalable, high performance C and C plus plus.",
"Define architecture, standards and best practices with other teams.",
"Troubleshoot complex system level issues, the bugs that cross hardware, kernel and Android.",
"Own planning, documentation and testing strategy.",
"Mentor junior engineers.",
"And drive continuous improvement. Lesson twenty turns these into weekly habits."]),
S("recap","Recap",items=["Your layer: everything below the Android framework","USB role: device + host + Type-C + updates + debugging","Pluses: Wi-Fi, BT, security, H.264/H.265/SVC, HDMI","Senior = lead, set standards, mentor, measure","Next: C/C++ craft for firmware"],say=[
"To recap.",
"Your layer is everything below the Android framework: HALs, kernel, bootloader.",
"The USB role covers device mode, host mode, Type C, updates and debugging.",
"The nice to have skills are Wi-Fi, Bluetooth, security, H two sixty four, H two sixty five, S V C, and HDMI.",
"And senior means leading, setting standards, mentoring, and measuring impact.",
"Next up: the C and C plus plus habits that firmware reviewers look for. See you there."])]),

V("v02-embedded-cpp","Lesson 2 · C/C++","Embedded C/C++ craft",[
S("title",sub="Habits that prevent field bugs",items=["volatile vs atomics","ISR rules","A lock-free ring, step by step"],say=[
"In this video we cover the C and C plus plus habits that prevent most firmware bugs, and walk through a lock free ring buffer step by step."]),
S("analogy","Plain analogy: cooking on a boat",items=["Same recipe, but the floor moves (interrupts)","Tiny pantry (RAM)","No repairs at sea (shipped devices)"],say=[
"Writing firmware is like cooking on a boat.",
"You use the same recipes, but the floor moves under you. Those are interrupts, which can arrive between any two instructions.",
"The pantry is tiny. That's limited memory.",
"And once you've sailed, nobody can come aboard to fix a spill. That's a shipped device in a customer's meeting room."]),
S("terms",items=[("volatile","Tells the compiler a value can change outside normal code. Not thread safety."),("Memory barrier","Stops the CPU and compiler reordering memory accesses across it."),("ISR","Interrupt service routine: code run when hardware signals."),("Acquire / release","Atomic orderings: release publishes earlier writes; acquire sees them."),("RAII","C++: a destructor frees the resource automatically.")],say=[
"The key words.",
"Volatile tells the compiler a value can change outside the normal code flow, like a hardware register. It does not make code thread safe.",
"A memory barrier stops the CPU and the compiler from reordering memory accesses across it.",
"An I S R, or interrupt service routine, is the code the CPU jumps to when hardware raises an interrupt.",
"Acquire and release are atomic orderings. A release store publishes all the writes before it. An acquire load guarantees you see them.",
"And RAII, in C plus plus, means a resource is freed in a destructor, so cleanup can't be forgotten."]),
S("bullets","Rules that prevent most field bugs",items=["Kernel: readl()/writel(); bare metal: volatile + __DMB() around DMA","ISRs: no blocking, no malloc, no printf. Record and defer","Share ISR data via SPSC rings or brief IRQ-disable","Bounds-check every length from the wire (wTotalLength!)","C++ daemons: RAII, unique_ptr with deleters, std::span","Build -Wall -Wextra -Werror; ASan/UBSan/TSan; checkpatch, sparse, lockdep"],say=[
"Six rules.",
"One. Access registers with read L and write L in the kernel, because they include the right barriers. In bare metal, use volatile pointers, plus explicit barriers around DMA buffers.",
"Two. Interrupt handlers never block, never allocate, never print. Record what happened, and defer the work.",
"Three. Share data between an interrupt and a task through a single producer, single consumer ring, or by disabling interrupts very briefly.",
"Four. Bounds check every length that arrives from outside. A malformed USB descriptor is a classic security bug.",
"Five. In C plus plus daemons, use RAII for file descriptors, locks and memory maps.",
"Six. Build with all warnings as errors, and run the sanitizers on everything that can build on a PC. In the kernel, use checkpatch, sparse, and lockdep."]),
S("seq","Lock-free ring: ISR hands data to a task",lanes=["Hardware","ISR (producer)","Ring","Task (consumer)"],msgs=[(0,1,"IRQ fires"),(1,2,"read tail (acquire); full? drop + count"),(1,2,"write data[head & (CAP-1)]"),(1,2,"store head+1 (release)"),(1,0,"ack IRQ, return fast"),(3,2,"load head (acquire)"),(2,3,"read data[tail & (CAP-1)]"),(3,2,"store tail+1 (release)")],say=[
"Now the ring buffer from lab eight, step by step. Only the interrupt writes, and only the task reads, so no lock is needed.",
"The hardware fires an interrupt.",
"The interrupt handler loads the tail with acquire ordering, to check whether the ring is full. If it is full, it drops the sample and counts an overrun. It never waits.",
"It writes the data into the slot at head, masked by the capacity minus one. That's why the capacity is a power of two.",
"Then it stores head plus one with release ordering. This is the key step: the data write is guaranteed visible before the new head.",
"It acknowledges the interrupt and returns quickly.",
"Later, the task loads head with acquire ordering. If head differs from tail, there's data.",
"It reads the slot at tail.",
"And stores tail plus one with release ordering, freeing the slot for the producer. In our test, two million items passed in order, and ThreadSanitizer found no races."]),
S("code","The two functions (labs/08-isr-ring-buffer/ring.c)",code="""static int ring_put(ring_t *r, uint32_t v) {          /* ISR side */
  uint32_t h = atomic_load_explicit(&r->head, memory_order_relaxed);
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_acquire);
  if (h - t == CAP) return 0;          /* full: never block in ISR */
  r->data[h & (CAP - 1)] = v;
  atomic_store_explicit(&r->head, h + 1, memory_order_release);
  return 1; }
static int ring_get(ring_t *r, uint32_t *v) {         /* task side */
  uint32_t t = atomic_load_explicit(&r->tail, memory_order_relaxed);
  uint32_t h = atomic_load_explicit(&r->head, memory_order_acquire);
  if (h == t) return 0;                /* empty */
  *v = r->data[t & (CAP - 1)];
  atomic_store_explicit(&r->tail, t + 1, memory_order_release);
  return 1; }""",hl=[[0],[1,2],[3],[5],[9],[13]],say=[
"Here's the real code.",
"The producer reads its own head relaxed, because only it writes head, and the consumer's tail with acquire.",
"Head minus tail equals capacity means full. Unsigned wraparound makes this subtraction correct even after the counters overflow.",
"The release store of head publishes the data.",
"On the consumer side, the acquire load of head pairs with that release.",
"And the release store of tail hands the slot back. Two pairs of acquire and release, and no locks."]),
S("recap","Recap",items=["volatile ≠ thread safe; use atomics or locks","ISRs: record and defer, never block","Release publishes, acquire observes","Check every external length","Host-testable seams + sanitizers in CI"],say=[
"Recap.",
"Volatile is not thread safety. Use atomics or locks.",
"Interrupt handlers record and defer. They never block.",
"Release publishes, acquire observes.",
"Check every length that comes from outside.",
"And keep protocol logic in plain C that you can test on a PC with sanitizers. Every lab in this course follows that pattern."])]),
]
