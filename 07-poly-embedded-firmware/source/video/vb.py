from common import *
V=[
V("v03-driver-model","Lesson 3 · Kernel","The Linux driver model: bus, device, driver, probe",[
S("title",sub="How the kernel pairs hardware with code",items=["Bus, device, driver","probe() and deferral","Char devices and sysfs"],say=[
"In this video we see how Linux pairs each piece of hardware with the right driver, what probe really does, and how a driver shows itself to user space."]),
S("analogy","Plain analogy: a wedding seating plan",items=["Guests = devices with name tags","Ushers = buses that read the tags","Table hosts = drivers","The greeting = probe()","'Come back later' = -EPROBE_DEFER"],say=[
"Think of a wedding with a seating plan.",
"Guests arrive wearing name tags. Those are devices, each with an identifier.",
"Ushers read each tag. Those are the buses: platform, I two C, SPI, USB, PCI.",
"Each table has a host. Those are drivers.",
"When an usher brings a guest to the right table, the host greets them. That greeting is the probe function.",
"And if the host isn't ready yet, they say: come back later. In Linux, that's minus E PROBE DEFER."]),
S("terms",items=[("Module","A .ko file loaded into the running kernel."),("probe()","Driver function called when a device matches; it sets the device up."),("devm_*","Device-managed resources, freed automatically on unbind."),("sysfs","The /sys filesystem: kernel objects as files."),("Char device","A /dev node read and written as a byte stream.")],say=[
"Some words.",
"A module is a dot k o file you load into the running kernel with insmod or modprobe.",
"Probe is the driver function the kernel calls when a device matches. It turns the device on and registers its interfaces.",
"Device managed, or devm, functions allocate resources that are freed automatically when the device is unbound. They remove whole classes of cleanup bugs.",
"Sysfs is the slash sys filesystem, where kernel objects appear as small files.",
"A character device is a node in slash dev that you read and write as a stream of bytes."]),
S("seq","Binding and probe, step by step",lanes=["DT / firmware","Bus core","Driver","Userspace"],msgs=[(0,1,"device registered: compatible = poly,hdmi-bridge-demo"),(2,1,"driver registered with of_match_table"),(1,1,"match(): compatible strings equal"),(1,2,"call probe(dev)"),(2,1,"reset GPIO not ready → -EPROBE_DEFER"),(1,1,"park device on deferred list"),(1,2,"GPIO provider appears → retry probe → 0"),(2,3,"/dev node + sysfs attributes appear"),(3,2,"open / read / write / ioctl")],say=[
"Now the binding sequence, step by step.",
"First, a device is registered. On ARM boards it usually comes from the device tree, with a compatible string, here poly comma h d m i bridge demo.",
"Second, a driver registers, with a table of compatible strings it supports.",
"Third, the bus core runs its match function. The strings are equal, so we have a pair.",
"Fourth, the core calls the driver's probe function with the device.",
"Fifth, probe asks for its reset GPIO, but the GPIO controller driver hasn't loaded yet. So probe returns minus E PROBE DEFER.",
"Sixth, the core parks the device on the deferred list. That's not an error yet.",
"Seventh, when the GPIO provider shows up, the core retries probe, and this time it returns zero.",
"Eighth, the driver now creates its user facing interfaces: a dev node and sysfs attributes.",
"Ninth, user space can open, read, write and send ioctls."]),
S("code","Lab 01: a misc char device (polychar.c)",code="""static ssize_t pc_write(struct file *f, const char __user *u,
                        size_t n, loff_t *off) {
	if (n > BUF_SZ) n = BUF_SZ;
	mutex_lock(&lock);
	if (copy_from_user(buf, u, n)) { mutex_unlock(&lock); return -EFAULT; }
	len = n; writes++;
	mutex_unlock(&lock);
	return n; }
static ssize_t writes_show(struct device *d, struct device_attribute *a, char *b)
{ return sysfs_emit(b, "%u\\n", writes); }
static DEVICE_ATTR_RO(writes);
static struct miscdevice mdev = { .minor = MISC_DYNAMIC_MINOR,
	.name = "polychar", .fops = &fops, .groups = pc_groups };
module_misc_device(mdev);""",hl=[[0,1],[2],[3,6],[4],[8,9,10],[11,12,13]],say=[
"Here's lab one. The write handler receives a pointer into user memory.",
"We clamp the length, because user space can pass anything.",
"A mutex protects the buffer, because two processes can write at the same time.",
"Copy from user can fault and sleep, which is why we use a mutex here and never a spinlock.",
"A read only sysfs attribute exposes the write counter, using sysfs emit.",
"And a misc device gives us a dev node with almost no boilerplate. In the QEMU test, writing hello poly and reading it back worked, and the counter showed one."]),
S("bullets","Debugging a device that never appears",items=["Is the DT node status = \"okay\"?","Does compatible match the driver table exactly?","cat /sys/kernel/debug/devices_deferred","dmesg | grep -i probe; use dev_err_probe()","Is the driver built (=y/=m) and the module loaded?"],say=[
"A very common bring up bug: the device simply never appears. Check five things.",
"Is the device tree node enabled, with status okay?",
"Does the compatible string match the driver's table exactly, character by character?",
"Read devices deferred in debugfs. It lists every device waiting on a dependency.",
"Search the kernel log for probe errors. Using dev err probe in your driver makes deferrals visible but quiet.",
"And confirm the driver is actually built and loaded."]),
S("recap","Recap",items=["Bus matches device to driver; probe() sets it up","-EPROBE_DEFER = wait for dependency, not failure","Prefer devm_* resources","Use frameworks (V4L2, ALSA, input) before custom ioctls","Never copy_*_user under a spinlock"],say=[
"Recap.",
"A bus matches devices to drivers, and probe sets the device up.",
"Minus E PROBE DEFER means wait for a dependency, not failure.",
"Prefer device managed resources.",
"Use existing frameworks like V four L two and ALSA before inventing custom ioctls.",
"And never copy to or from user space while holding a spinlock."])]),

V("v04-device-tree","Lesson 4 · Kernel","Device Tree, I2C, SPI, GPIO and regmap",[
S("title",sub="Describing hardware the kernel can't discover",items=["The blueprint","A real bridge node","From dts to probe"],say=[
"This video explains the device tree: how we describe hardware the kernel can't discover by itself, using an HDMI bridge on I two C as the example."]),
S("analogy","Plain analogy: the house blueprint",items=["Kernel = the electrician","Device tree = blueprint of sockets and breakers","compatible = the name tag on each socket","Overlay = a renovation sheet"],say=[
"Think of the kernel as an electrician arriving at a new house.",
"USB devices announce themselves, but chips on I two C or SPI can't. So the electrician needs a blueprint showing which room has which socket, and which breaker feeds it. That's the device tree.",
"Each socket on the blueprint has a name tag that tells the electrician which tool to use. That's the compatible string.",
"And when you add a room later, you hand over a renovation sheet that patches the blueprint. That's an overlay."]),
S("terms",items=[("dts / dtb","Device tree source text, compiled by dtc into a binary blob."),("compatible","String that selects the driver, e.g. \"lontium,lt9611\"."),("reg","Address of the node on its bus, e.g. the I2C address."),("regmap","Kernel helper for register access over I2C/SPI with caching and locking."),("pinctrl","Chooses each pin's function: GPIO, I2C, UART.")],say=[
"Key words.",
"A d t s file is device tree source text. The d t c compiler turns it into a d t b binary that the bootloader passes to the kernel.",
"Compatible is the string that selects the driver, for example lontium comma l t ninety six eleven.",
"Reg is the address of the node on its bus. For an I two C chip, that's its seven bit address.",
"Regmap is a kernel helper that wraps register reads and writes over I two C or SPI, with caching and locking built in.",
"Pin control decides what each physical pin does: GPIO, I two C, or UART."]),
S("code","A bridge node on I2C",code="""&i2c3 {
  hdmi-bridge@3b {
    compatible = "lontium,lt9611";
    reg = <0x3b>;                       /* I2C address */
    interrupts-extended = <&tlmm 50 IRQ_TYPE_EDGE_FALLING>;
    reset-gpios = <&tlmm 52 GPIO_ACTIVE_HIGH>;
    vdd-supply = <&vreg_1p8>;
    ports { port@0 { reg = <0>;
        endpoint { remote-endpoint = <&dsi0_out>; }; }; };
  };
};""",hl=[[0],[1],[2],[3],[4],[5],[6],[7,8]],say=[
"Here is a typical node for an HDMI bridge.",
"It lives under the third I two C controller, at address three B.",
"The compatible string picks the driver.",
"Reg repeats the I two C address.",
"The interrupt comes from pin fifty of the SoC's GPIO controller, and fires on a falling edge. That's the hot plug signal.",
"The reset line is pin fifty two. The flag says active high.",
"Vdd supply names the regulator that powers the chip. The driver asks for it by the name vdd.",
"And the ports section is a graph: it says the bridge's input is connected to the SoC's D S I display output. That's how the display pipeline is wired together."]),
S("flow","From blueprint to running driver",items=["board.dts written","dtc → board.dtb","Bootloader passes dtb + kernel","Kernel unflattens the tree","i2c / platform device created","Driver matched by compatible","probe(): regulator, GPIO, regmap"],subs=["source text","binary blob","U-Boot / ABL","of_platform_populate","one struct device per node","of_match_table","resources from properties"],say=[
"Now the whole path from blueprint to running driver.",
"You write the board's d t s file.",
"The d t c compiler turns it into a d t b.",
"The bootloader loads the d t b next to the kernel, and passes its address at boot.",
"Early in boot, the kernel unflattens the blob into a tree of nodes.",
"For each enabled node, it creates a device on the right bus. Our bridge becomes an I two C device at address three B.",
"The bus matches it to the driver by compatible string.",
"And probe gets its resources from the properties: devm regulator get for vdd, devm g p i o d get for reset, and a regmap for registers."]),
S("bullets","Bus cheat sheet",items=["I2C: 2 wires, addressed, 100 kHz–1 MHz; i2cdetect, i2cget; watch NACKs, pull-ups","SPI: 4 wires, fast, full duplex; flash, some codecs","GPIO: resets, enables, interrupts; gpiod uses logical values","Document bindings (YAML) and run make dtbs_check"],say=[
"A quick bus cheat sheet.",
"I two C has two wires, addressed devices, and runs from one hundred kilohertz to one megahertz. Use i two c detect and i two c get, and on a logic analyzer look for NACKs and weak pull ups.",
"SPI uses four wires and is faster and full duplex. You'll find flash and some audio codecs there.",
"GPIOs drive resets and enables, and carry interrupts. The g p i o d API uses logical values, so an active low flag in the device tree is handled for you.",
"And as a senior habit: document every binding you add in YAML, and run make d t b s check in CI."]),
S("recap","Recap",items=["DT describes what can't be discovered","compatible picks the driver; reg is the bus address","Resources (GPIO, regulator, IRQ) come from properties","Keep board values in DT, not #ifdefs","Lab 02: build the overlay with dtc"],say=[
"Recap.",
"The device tree describes hardware that can't be discovered.",
"Compatible picks the driver, and reg is the address on the bus.",
"GPIOs, regulators and interrupts come from properties.",
"Keep board specific values in the device tree, not in if defs.",
"And in lab two, you compile an overlay and a matching platform driver."])]),
]
