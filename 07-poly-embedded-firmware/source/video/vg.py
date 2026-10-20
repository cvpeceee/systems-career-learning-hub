from common import *
V=[
V("v14-usb-debug-typec","Lesson 14 · USB","USB host side, Type-C/PD, DFU and debugging",[
S("title",sub="Hearing both sides of the call",items=["Capturing traffic","Type-C attach, step by step","Firmware update over USB"],say=[
"This video covers how to debug USB problems, how a Type C connection decides who is host, and how firmware gets updated over USB."]),
S("analogy","Plain analogy: a phone call",items=["dmesg = one side's notes","usbmon / Wireshark = hearing the host's side","Hardware analyzer = a wiretap on the cable","Wiretap also hears line noise (electrical)"],say=[
"Debugging USB is like investigating a phone call.",
"The kernel log is one person's notes after the call.",
"Usbmon with Wireshark lets you hear the host's side of every request.",
"A hardware analyzer is a wiretap on the cable itself, hearing both sides.",
"And only the wiretap hears line noise: retries, chirps and power state changes."]),
S("terms",items=[("xHCI","Standard USB 3 host controller interface."),("usbmon","Kernel capture of USB traffic on the host."),("Type-C / PD","USB-C connector; Power Delivery negotiates power, roles, alt modes."),("DRD","Dual role: one port can be host or device."),("DFU","Device Firmware Upgrade class.")],say=[
"Words.",
"X H C I is the standard USB three host controller.",
"Usbmon captures USB traffic inside the host's kernel.",
"Type C is the connector. Power delivery is a protocol on its C C wire that negotiates power, data roles and alternate modes.",
"Dual role, or D R D, means one port can be either host or device.",
"And D F U is the device firmware upgrade class."]),
S("code","Capture workflow",code="""sudo modprobe usbmon
lsusb -t                              # find the bus number
sudo tshark -i usbmon1 -w cam.pcapng   # or Wireshark GUI
# filters:
usb.device_address == 7
usb.setup.bRequest == 6                # GET_DESCRIPTOR
usb.transfer_type == 0x00              # isochronous
# Windows: USBPcap + Wireshark ; macOS: ioreg -p IOUSB -l""",hl=[[0],[1],[2],[4],[5],[6],[7]],say=[
"Load usbmon on the host.",
"Find which bus your device is on.",
"Capture on that bus with tshark or Wireshark.",
"Filter on your device's address.",
"Filter on get descriptor requests to study enumeration.",
"Or on isochronous transfers to study video.",
"On Windows use U S B pcap, and on a Mac use I O reg."]),
S("bullets","Symptom → first check",items=["Enumeration -71 → PHY tuning, cable, VBUS, pull-up timing","Works on Linux not Windows → wTotalLength, strings, MS OS descriptors, bcdDevice","Video stutters on some laptops → bandwidth contention, alt too big, LPM","Drops after suspend → remote wakeup, runtime PM","Charges but no data → CC mux, DRD role, PD contract"],say=[
"A symptom table to memorize.",
"Enumeration error minus seventy one: check PHY tuning, cable, V bus, and when D plus is pulled up.",
"Works on Linux but not Windows: check total length, string descriptors, Microsoft O S descriptors, and b c d Device caching.",
"Video stutters only on some laptops: other devices sharing the host controller, an alternate setting that's too big, or link power management.",
"Disconnects after suspend: remote wake up and runtime power management.",
"Charges but no data on Type C: the orientation mux, the dual role state, or the power contract."]),
S("seq","Type-C attach and role decision",lanes=["Laptop (DFP)","CC / PD controller","Device SoC (DRD)"],msgs=[(0,1,"Rp on CC: I'm a source / host"),(1,1,"detect orientation CC1/CC2, set mux"),(1,0,"PD: request 20 V / 3 A"),(1,2,"role = device (UFP)"),(2,2,"DRD → gadget mode, start UDC"),(2,0,"D+ pull-up → enumeration"),(1,0,"optional: enter DisplayPort alt mode")],say=[
"Now a Type C attach, step by step.",
"The laptop presents a pull up resistor on the C C wire, which says: I'm a power source and a host.",
"The PD controller sees which C C pin is connected, so it knows which way the plug is flipped, and sets the data mux.",
"It negotiates a power contract, for example twenty volts at three amps.",
"It tells the SoC: you are the device.",
"The dual role driver switches the controller into gadget mode, and starts the U D C.",
"D plus is pulled up, and enumeration begins.",
"Optionally, the two sides enter DisplayPort alternate mode to share a display on the same cable."]),
S("flow","DFU update, step by step",items=["Host: DFU_DETACH / re-enumerate in DFU mode","DFU_DNLOAD block 0..N","DFU_GETSTATUS (poll)","Zero-length DNLOAD = done","Manifest: verify signature, version","Reset into new image"],subs=["dfu-util -l","write to inactive slot","device busy while writing flash","end of download","reject bad / old images","or fall back"],say=[
"Finally, a D F U firmware update.",
"The host asks the device to switch into D F U mode, and it re enumerates.",
"The host downloads the image in blocks.",
"After each block, it polls status while the device writes flash.",
"A zero length download means: that's everything.",
"In the manifest phase, the device verifies the signature and version, and rejects bad or old images.",
"Then it resets into the new image, or falls back to the old one. Lab nine simulates that."]),
S("recap","Recap",items=["usbmon sees URBs; analyzer sees the wire","Symptom table: electrical, descriptors, bandwidth, PM, roles","Type-C: CC detect → PD → role → UDC","DFU: download → verify → reset (with fallback)"],say=[
"Recap.",
"Usbmon sees requests; an analyzer sees the wire.",
"Use the symptom table: electrical, descriptors, bandwidth, power, roles.",
"Type C goes: detect, negotiate, choose role, start the controller.",
"And D F U is download, verify, reset, with a fallback."])]),

V("v15-android-platform","Lesson 15 · Android","Android below the framework: boot, Treble, HALs, SELinux",[
S("title",sub="Your code under Android",items=["Treble and partitions","Android boot, step by step","Writing a vendor HAL with SELinux"],say=[
"This video goes under Android: partitions, Treble, how Android boots, and how to add your own vendor HAL with the right SELinux policy."]),
S("analogy","Plain analogy: a building with a fixed electrical panel",items=["Apartment = Android framework","Walls and wiring = vendor HALs and drivers","Standard plugs = versioned HAL interfaces","Google replaces the apartment, not the wiring"],say=[
"Treble is like a building with a fixed electrical panel.",
"The apartment is the Android framework.",
"The walls and wiring are the vendor's HALs and drivers.",
"Between them are standard plugs: versioned HAL interfaces.",
"So Google can replace the apartment with a new Android version, without rewiring the walls."]),
S("terms",items=[("AOSP","Android Open Source Project."),("Treble / VINTF","Stable split between system and vendor, with versioned interfaces."),("AIDL HAL","Hardware interface defined in AIDL."),("init.rc","Android init's language: services, triggers, properties."),("SELinux","Mandatory access control: every access must be allowed."),("GKI","Generic Kernel Image: vendor code goes in modules.")],say=[
"Words.",
"A O S P is the Android open source project.",
"Treble, with the vendor interface manifest, splits system and vendor with stable, versioned interfaces.",
"An A I D L HAL is a hardware interface defined in the A I D L language.",
"Init dot r c is the language Android's init uses: services, triggers and properties.",
"SELinux is mandatory access control. Every process and file has a label, and every access must be explicitly allowed.",
"And G K I is the generic kernel image. Vendor code must live in loadable modules."]),
S("flow","Android boot path",items=["ABL + AVB verify vbmeta","GKI kernel + vendor_boot modules","First-stage init: mount, load modules","SELinux policy loaded (enforcing)","Second-stage init parses *.rc","servicemanager + vendor HALs (class hal)","zygote → system_server → apps"],subs=["bootloader","generic + vendor .ko","/vendor, /system","labels everywhere","early-init, init, boot triggers","your IUsbCamControl","framework calls HALs"],say=[
"Android's boot, step by step.",
"The bootloader verifies v b meta, which covers the boot and vendor images.",
"The generic kernel starts, with vendor modules from the vendor boot partition.",
"First stage init mounts the system and vendor partitions, and loads the remaining modules.",
"The SELinux policy is loaded, in enforcing mode.",
"Second stage init parses the r c files from system and vendor, and runs triggers in order.",
"Service manager starts, then the HAL services, including your own.",
"And finally zygote, system server, and the apps."]),
S("code","Lab 11: a vendor HAL, rc file and policy",code="""// IUsbCamControl.aidl
@VintfStability
interface IUsbCamControl { void setUsbFunctions(in String f); boolean isStreaming(); }

# vendor.poly.usbcam-service.rc
service vendor.poly.usbcam /vendor/bin/hw/vendor.poly.usbcam-service
    class hal
    user system

# vendor_poly_usbcam.te
type hal_poly_usbcam, domain;
init_daemon_domain(hal_poly_usbcam)
allow hal_poly_usbcam configfs:file { open write read getattr };""",hl=[[0,1,2],[2],[4,5,6,7],[9,10,11],[11]],say=[
"Here are the lab eleven files.",
"The interface is marked VINTF stable, with two methods: set U S B functions, and is streaming.",
"The r c fragment tells init to start the service in the hal class, as the system user.",
"The type enforcement file gives the service its own SELinux domain, and lets init launch it into that domain.",
"And one narrow rule lets it write configfs files, nothing more."]),
S("bullets","SELinux workflow and GKI rules",items=["adb logcat | grep avc → read each denial","Add the narrowest allow; never ship permissive","audit2allow = starting point, not the answer","neverallow rules are enforced by CTS/VTS","GKI: no core kernel edits; modules + stable KMI"],say=[
"A safe SELinux workflow.",
"Search the logs for a v c denials, and read each one.",
"Add the narrowest rule that fixes it. Never ship a permissive domain.",
"Audit two allow gives a starting point, but not the answer.",
"Never allow rules are checked by the compatibility test suites, so broad rules fail certification.",
"And under G K I, you can't edit the core kernel. Your drivers become modules against a stable symbol list."]),
S("code","Daily commands",code="""adb shell getprop | grep usb
adb shell dumpsys usb
adb shell service list | grep usbcam
adb logcat -b all ; adb shell dmesg -w
m -j vendorimage ; fastboot flash vendor_a vendor.img""",hl=[[0],[1],[2],[3],[4]],say=[
"A few daily commands. Check USB properties.",
"Dump the USB service state.",
"Check that your HAL registered.",
"Watch all logs and the kernel log.",
"And build and flash only the vendor image."]),
S("recap","Recap",items=["Treble: framework ↔ vendor via versioned HALs","Boot: ABL → GKI → init → HALs → zygote","HAL = AIDL + service + .rc + VINTF + sepolicy","Narrow SELinux rules only","Vendor kernel code = modules"],say=[
"Recap.",
"Treble connects framework and vendor through versioned HALs.",
"Boot goes from bootloader, to the generic kernel, to init, to HALs, to zygote.",
"A HAL needs an interface, a service, an r c file, a manifest entry, and policy.",
"Write only narrow SELinux rules.",
"And vendor kernel code lives in modules."])]),

V("v16-rtos-tinyusb","Lesson 16 · MCU","MCU and RTOS firmware, TinyUSB",[
S("title",sub="The small chips inside accessories",items=["RTOS scheduling","Priority inversion, step by step","TinyUSB and hard faults"],say=[
"This video covers the small microcontrollers inside conferencing accessories: real time operating systems, a classic bug called priority inversion, and the TinyUSB stack."]),
S("analogy","Plain analogy: an ER triage nurse",items=["Every tick, see the most urgent ready patient","Heart attack waits for a stretcher (mutex)","Sprained ankle holds it; flu patients keep cutting in","Fix: give the ankle patient top priority until they return it"],say=[
"An RTOS scheduler is an emergency room triage nurse. Every tick, the most urgent ready patient is seen.",
"Now a heart attack patient needs the only stretcher.",
"But a sprained ankle patient is holding it, and flu patients, more urgent than the ankle, keep getting seen first. The heart attack waits. That's priority inversion.",
"The fix: while the ankle patient holds the stretcher, treat them as top priority, so they return it fast. That's priority inheritance."]),
S("terms",items=[("RTOS","Real-time OS: FreeRTOS, Zephyr, ThreadX."),("Tick","Periodic timer interrupt that drives scheduling."),("Priority inheritance","Boost a mutex holder to the waiter's priority."),("Watchdog","Timer that resets the chip unless kicked."),("TinyUSB","Open-source USB stack for microcontrollers.")],say=[
"Words.",
"An RTOS is a real time operating system, like Free R T O S, Zephyr or ThreadX.",
"The tick is a periodic timer interrupt that drives scheduling.",
"Priority inheritance temporarily raises a task holding a mutex to the priority of the task waiting for it.",
"A watchdog resets the chip unless software kicks it regularly.",
"And TinyUSB is an open source USB stack for microcontrollers."]),
S("seq","Priority inversion vs inheritance (Lab 10)",lanes=["LOW (logger)","MED (stats)","HIGH (USB task)"],msgs=[(0,0,"tick 0: LOW takes the mutex"),(2,0,"tick 1: HIGH wants mutex → blocks"),(1,1,"tick 2+: MED preempts LOW, runs 6 ticks"),(2,2,"HIGH stuck → finishes at tick 11"),(0,0,"WITH inheritance: LOW boosted to HIGH"),(0,2,"LOW finishes, releases mutex"),(2,2,"HIGH runs → finishes at tick 5")],say=[
"Here's lab ten's simulation, step by step.",
"At tick zero, the low priority logger takes a mutex.",
"At tick one, the high priority USB task wants the same mutex, and blocks.",
"From tick two, the medium task becomes ready. It outranks low, so it runs for six ticks. Low can't finish, so it can't release the mutex.",
"The high priority task is stuck behind a medium one, and finishes only at tick eleven.",
"Now run it again with inheritance. When high blocks, low is boosted to high priority.",
"Medium can't preempt it, so low finishes quickly and releases the mutex.",
"High runs at once, and finishes at tick five instead of eleven. That's the bug that nearly sank the Mars Pathfinder mission in nineteen ninety seven."]),
S("code","TinyUSB device skeleton",code="""int main(void) {
  board_init();
  tusb_init();
  while (1) {
    tud_task();          // USB device stack work (from ISR events)
    app_task();
  }
}
uint8_t const *tud_descriptor_device_cb(void) { return (uint8_t const *)&desc_device; }
uint8_t const *tud_descriptor_configuration_cb(uint8_t idx) { return desc_cfg; }
void tud_hid_set_report_cb(uint8_t itf, uint8_t id, hid_report_type_t t,
                           uint8_t const *buf, uint16_t len) { set_mute_led(buf[0] & 1); }""",hl=[[2],[4],[8],[9],[10,11]],say=[
"A TinyUSB device in a few lines. Initialize the stack.",
"Call t u d task in the main loop or an RTOS task. The interrupt only records events; this function handles them. Same pattern as lesson two.",
"The stack calls you back for the device descriptor.",
"And for the configuration descriptor.",
"Class callbacks deliver data, here an H I D output report that sets the mute LED."]),
S("bullets","Bare-metal and hard faults",items=["Reset: copy .data, zero .bss, clocks, main()","Size stacks: uxTaskGetStackHighWaterMark","Watchdog per task health","Hard fault: read CFSR, MMFAR/BFAR, stacked PC","Debug with SWD + OpenOCD + gdb"],say=[
"Bare metal essentials.",
"At reset, startup code copies initialized data, zeroes the rest, sets clocks, and calls main.",
"Size every task's stack, and check the high water mark.",
"Kick the watchdog only when every task reports healthy.",
"On a Cortex M hard fault, read the fault status register, the fault address registers, and the stacked program counter.",
"And debug over S W D with Open O C D and gdb."]),
S("recap","Recap",items=["Highest-priority ready task runs","Mutexes with priority inheritance","ISR records, task processes (tud_task)","Watchdog + stack checks","Fault registers point at the bug"],say=[
"Recap.",
"The highest priority ready task runs.",
"Use mutexes with priority inheritance.",
"Interrupts record, tasks process.",
"Use watchdogs and stack checks.",
"And the fault registers point straight at the bug."])]),
]
