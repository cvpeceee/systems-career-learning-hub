from common import *
V=[
V("v05-irq-dma","Lesson 5 · Kernel","Interrupts, threaded IRQs, workqueues and DMA",[
S("title",sub="Doorbells, unpacking, and moving data without the CPU",items=["Top half vs bottom half","HDMI hot-plug, step by step","DMA and cache coherency"],say=[
"This video covers interrupts: the fast part, the slow part, and how data moves with DMA. We'll follow an HDMI hot plug interrupt on an I two C bridge, step by step."]),
S("analogy","Plain analogy: a doorbell and a delivery",items=["Doorbell rings = interrupt","Sign for the package = top half (seconds)","Unpack later in the kitchen = bottom half","A conveyor belt that loads itself = DMA"],say=[
"An interrupt is a doorbell.",
"The top half is answering the door and signing for the package. It must take seconds, because other visitors may be waiting.",
"The bottom half is unpacking later in the kitchen, where you can take your time and even make phone calls.",
"And DMA is a conveyor belt that loads the shelves by itself, while you do other work."]),
S("terms",items=[("Top half","Hard IRQ handler. Interrupts masked, very short, cannot sleep."),("Threaded IRQ","A kernel thread runs the slow part and may sleep."),("Workqueue","Deferred functions run later in process context."),("DMA","Hardware copies data to RAM without the CPU."),("Spinlock","Busy-waiting lock, usable in interrupt context.")],say=[
"Words.",
"The top half is the hard interrupt handler. It runs with that interrupt masked, must be very short, and cannot sleep.",
"A threaded interrupt moves the slow part into a kernel thread, which may sleep, for example to talk over I two C.",
"A workqueue runs deferred functions later, in normal process context.",
"DMA, direct memory access, lets hardware copy data into memory without the CPU.",
"A spinlock is a lock that busy waits instead of sleeping, so it's safe in interrupt context."]),
S("seq","HDMI hot-plug on an I2C bridge",lanes=["Bridge chip","IRQ core (GIC)","Hard handler","IRQ thread","DRM core"],msgs=[(0,1,"HPD line falls"),(1,2,"mask line, call handler"),(2,1,"return IRQ_WAKE_THREAD"),(1,3,"wake thread"),(3,0,"I2C read status (sleeps)"),(3,0,"I2C write: clear status"),(3,4,"drm_bridge_hpd_notify()"),(3,1,"IRQ_HANDLED → unmask (ONESHOT)")],say=[
"Let's follow a hot plug, step by step.",
"A monitor is connected. The bridge chip pulls its interrupt line low.",
"The interrupt controller masks that line, and calls the hard handler.",
"Because the bridge sits on I two C, the hard handler can't read it. Reading I two C sleeps. So it simply returns I R Q WAKE THREAD.",
"The core wakes the interrupt thread.",
"The thread reads the bridge's status register over I two C. This sleeps, and that's fine here.",
"It writes to clear the status, so the chip releases the interrupt line.",
"It tells the display core that a monitor arrived, so the EDID can be read and a mode chosen.",
"Finally it returns handled, and only now is the line unmasked. That's what the oneshot flag guarantees. Without it, a level interrupt would fire again and again before the thread could clear it."]),
S("code","Requesting a threaded IRQ",code="""static irqreturn_t lt_irq_thread(int irq, void *data)
{
	struct lt *lt = data;
	unsigned int st;
	regmap_read(lt->regmap, REG_INT_STATUS, &st);   /* may sleep */
	regmap_write(lt->regmap, REG_INT_CLEAR, st);
	if (st & HPD_CHANGE)
		drm_bridge_hpd_notify(&lt->bridge, lt_detect(lt));
	return IRQ_HANDLED;
}
ret = devm_request_threaded_irq(dev, client->irq, NULL, lt_irq_thread,
				IRQF_ONESHOT, "lt9611", lt);""",hl=[[11,12],[4],[5],[6,7],[11,12]],say=[
"Here's what that looks like in code.",
"The thread function reads the status through regmap. It may sleep.",
"Then it clears the status.",
"If the hot plug bit changed, it notifies the display core.",
"Notice the request call passes null for the hard handler. The kernel supplies a default one that just wakes the thread, and oneshot keeps the line masked until the thread returns."]),
S("bullets","Locking map",items=["Shared with hard IRQ → spin_lock_irqsave","Process context only → mutex","Single flags/counters → atomic_t, READ_ONCE/WRITE_ONCE","Debug builds: lockdep (CONFIG_PROVE_LOCKING)"],say=[
"Which lock to use?",
"Data shared with a hard interrupt handler needs spin lock irq save.",
"Data touched only from process context can use a mutex.",
"Single counters and flags can be atomics.",
"And turn on lockdep in debug builds. It reports deadlock risks before they ever happen."]),
S("flow","DMA streaming buffer, step by step",items=["dma_map_single(buf, DMA_FROM_DEVICE)","Give bus address to hardware","Hardware writes RAM (CPU not involved)","Completion interrupt","dma_sync_single_for_cpu()","CPU reads the frame","Re-sync for device, reuse"],subs=["cache cleaned/invalidated","descriptor ring","no CPU copy","top half","invalidate stale cache lines","correct data","next frame"],say=[
"Now DMA, step by step.",
"The driver maps a buffer for the device. On ARM, this cleans or invalidates the CPU caches for that memory.",
"It hands the bus address to the hardware, usually through a descriptor ring.",
"The hardware writes the frame into memory, without the CPU.",
"A completion interrupt arrives.",
"Before reading, the driver syncs the buffer for the CPU, which throws away any stale cache lines.",
"Now the CPU sees the correct data.",
"Then it syncs back for the device, and reuses the buffer. Skip these syncs, and on ARM you'll see green stripes or stale lines in video, even though it works perfectly on x86."]),
S("recap","Recap",items=["Top half: ack and defer; never sleep","I2C/SPI devices → threaded IRQ + IRQF_ONESHOT","Pick the lock by context","Use the DMA API; sync caches on ARM","Teardown: disable source → free irq → cancel work → free memory"],say=[
"Recap.",
"The top half acknowledges and defers. It never sleeps.",
"Devices on I two C or SPI need a threaded interrupt with oneshot.",
"Choose the lock by the context that touches the data.",
"Always use the DMA API, and sync caches on ARM.",
"And tear down in order: disable the source, free the interrupt, cancel work, then free memory. Lab three practices exactly that."])]),

V("v06-boot-chain","Lesson 6 · Boot","Boot chain, U-Boot and secure boot",[
S("title",sub="A relay race with ID checks",items=["Every stage, in order","U-Boot console skills","Debugging a silent boot"],say=[
"This video follows the boot chain from the chip's first instruction to Linux init, and shows how secure boot checks every handoff."]),
S("analogy","Plain analogy: a relay race",items=["Each runner = one boot stage","Passing the baton = loading the next stage","Checking the ID badge = verifying a signature","Badge list burned into the track = fused key hash"],say=[
"Booting is a relay race.",
"Each runner is one boot stage, and passing the baton means loading and jumping to the next stage.",
"In secure boot, every runner checks the next runner's ID badge before handing over. That's a signature check.",
"And the list of valid badges is burned into the track itself, in one time programmable fuses."]),
S("terms",items=[("Boot ROM","Code fixed inside the chip at manufacture."),("SPL / XBL","Small first-stage loader that brings up DRAM. XBL is Qualcomm's."),("U-Boot / ABL","Full bootloader. ABL is Qualcomm's Android bootloader."),("TF-A / TEE","ARM trusted firmware and the trusted execution environment."),("AVB","Android Verified Boot, using vbmeta and dm-verity.")],say=[
"Words.",
"The boot ROM is code fixed inside the chip when it's manufactured. It can never change.",
"The S P L, or on Qualcomm the X B L, is a small first stage loader. Its main job is setting up DRAM.",
"U-Boot, or Qualcomm's A B L, is the full bootloader that loads the kernel.",
"T F A is ARM's trusted firmware, and the T E E is a secure world that keeps keys.",
"A V B is Android verified boot. It checks Android partitions using a signed table called v b meta."]),
S("flow","Secure boot relay",items=["Boot ROM","SPL / XBL","TF-A BL31 + TEE","U-Boot / ABL","Linux kernel + DTB","init","dm-verity on system"],subs=["verifies SPL with fused key hash","DDR training, verifies next","secure monitor + keys","picks A/B slot, verifies boot.img","earlycon, probe drivers","systemd or Android init","checks blocks at read time"],say=[
"Let's run the race.",
"The boot ROM reads fuses to find the boot device, loads the first stage, and checks its signature against the key hash burned in fuses.",
"The first stage sets up clocks, the power chip, and trains DRAM. Then it verifies the next images.",
"Trusted firmware starts the secure monitor, and optionally a trusted OS that holds keys.",
"U-Boot or A B L reads its environment, picks the A or B slot, loads the kernel and device tree, and verifies them.",
"The kernel starts, prints to an early console, and probes drivers.",
"Init starts: systemd or busybox on Linux, Android's init on Android.",
"And on Android, d m verity keeps checking every block of the system partition as it's read, so tampering is caught even after boot."]),
S("code","U-Boot console skills",code="""=> printenv bootargs
=> setenv bootargs console=ttyMSM0,115200 earlycon loglevel=8
=> mmc dev 0 ; mmc part
=> load mmc 0:1 ${kernel_addr_r} Image
=> load mmc 0:1 ${fdt_addr_r} board.dtb
=> fdt addr ${fdt_addr_r} ; fdt print /soc/i2c@a90000
=> booti ${kernel_addr_r} - ${fdt_addr_r}""",hl=[[0],[0],[1],[2],[3],[4],[5],[6]],say=[
"A few U-Boot commands worth knowing by heart.",
"Print the kernel command line.",
"Set it, adding earlycon so the kernel prints before its real console driver loads.",
"Select the eMMC and list its partitions.",
"Load the kernel image into memory.",
"Load the device tree.",
"Inspect the device tree right from the bootloader, for example to check an I two C node.",
"And boot it. The dash means no separate initramfs."]),
S("bullets","Debugging a silent boot",items=["No output at all → UART pins, baud, ROM boot mode","'Starting kernel...' then silence → wrong DTB, load address, console","Add earlycon, keep_bootcon, initcall_debug","Hang before console → JTAG: read PC","Never ship debug keys; sign in CI"],say=[
"When boot goes silent, narrow it down.",
"No output at all? Check UART wiring and baud rate, and the boot mode pins.",
"If you see starting kernel and then nothing, it's usually a wrong device tree, a wrong load address, or the console not enabled.",
"Add earlycon, keep boot con, and initcall debug to see how far the kernel gets.",
"If it hangs before any console, attach JTAG and read the program counter.",
"And for security: never ship debug keys, and do signing in a controlled CI step, never on a laptop."]),
S("recap","Recap",items=["ROM → SPL/XBL → TF-A/TEE → U-Boot/ABL → kernel → init","Each stage verifies the next (fused root of trust)","Anti-rollback stops old signed images","earlycon is your first debug tool","Lab 09: verify + A/B fallback"],say=[
"Recap.",
"The chain is ROM, first stage, trusted firmware, bootloader, kernel, then init.",
"Each stage verifies the next, anchored in fuses.",
"Anti rollback counters stop old but validly signed images.",
"Earlycon is your first debugging tool.",
"And lab nine simulates image verification and automatic A B fallback."])]),
]
