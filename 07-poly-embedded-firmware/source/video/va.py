from common import *
V=[
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
