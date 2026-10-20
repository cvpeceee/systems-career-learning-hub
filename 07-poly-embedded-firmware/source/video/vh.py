from common import *
V=[
V("v17-debugging-oops","Lesson 17 · Debug","Debugging toolbox: oops decoding, ftrace, perf, JTAG",[
S("title",sub="Detective work in the kernel",items=["Reading an oops line by line","ftrace and perf recipes","When to grab JTAG"],say=[
"This video is about detective work: decoding a kernel oops line by line, then tracing and profiling with ftrace and perf."]),
S("analogy","Plain analogy: a detective's toolkit",items=["dmesg = witness statement","Oops = chalk outline: exactly where it happened","ftrace = CCTV timeline","perf = traffic counter","JTAG = freeze time and walk the scene"],say=[
"Debugging is detective work.",
"The kernel log is the witness statement.",
"An oops is the chalk outline. It shows exactly where it happened.",
"Ftrace is the CCTV timeline.",
"Perf is the traffic counter: where the time goes.",
"And JTAG freezes time, so you can walk around the scene."]),
S("terms",items=[("Oops","Kernel error report: registers + call trace."),("pc / lr","Program counter / link register (return address)."),("Tainted","Flags, e.g. O = out-of-tree module loaded."),("faddr2line","Script mapping function+offset to a source line."),("ftrace","Kernel's built-in tracer.")],say=[
"Words.",
"An oops is the kernel's error report, with registers and a call trace. It may or may not crash the system.",
"P C is the program counter, where it failed. L R is the link register, where it would return to.",
"Tainted flags tell you about the kernel's state. O means an out of tree module was loaded.",
"F addr two line maps a function plus offset to a source line.",
"And ftrace is the kernel's built in tracer."]),
S("code","Decoding the sample oops (Lab 12)",code="""Unable to handle kernel NULL pointer dereference at virtual address 0000000000000018
Internal error: Oops: 0000000096000006 [#1] PREEMPT SMP
Modules linked in: polybridge(O) uvcvideo videobuf2_vmalloc
CPU: 2 PID: 1876 Comm: kworker/2:1 Tainted: G   O   6.6.30 #1
Workqueue: events polybridge_hpd_work [polybridge]
pc : polybridge_hpd_work+0x3c/0x120 [polybridge]
lr : polybridge_hpd_work+0x30/0x120 [polybridge]
Call trace:
 polybridge_hpd_work+0x3c/0x120 [polybridge]
 process_one_work+0x1d8/0x4a0
 worker_thread+0x74/0x420

$ ./scripts/faddr2line polybridge.ko polybridge_hpd_work+0x3c""",hl=[[0],[0],[1],[2],[3],[4],[5],[8,9,10],[12]],say=[
"Let's decode lab twelve's oops, line by line.",
"Line one: a null pointer dereference at address hex eighteen. That means code read a field at offset twenty four bytes inside a struct, through a null pointer.",
"Line two: it's an oops, number one. The first oops is the one that matters; later ones are often fallout.",
"The modules list shows our out of tree bridge driver was loaded.",
"It happened on CPU two, in a kernel worker thread, and the kernel is tainted by an out of tree module.",
"The workqueue line names the work function: polybridge h p d work.",
"P C gives the exact place: sixty bytes into that function.",
"The call trace shows it came straight from the workqueue machinery, not from probe or an interrupt.",
"Now map it to a source line with f addr two line. In this scenario, the work ran after remove had freed the bridge state. The fix: cancel work sync in remove, and only schedule work after probe completes."]),
S("code","ftrace and perf recipes",code="""cd /sys/kernel/tracing
echo function_graph > current_tracer
echo 'dwc3_*' > set_ftrace_filter ; echo 1 > tracing_on
echo 1 > events/dwc3/enable ; cat trace_pipe
trace-cmd record -e xhci-hcd -p function_graph -g uvc_v4l2_qbuf
perf record -g -a sleep 10 ; perf report
echo 'module dwc3 +p' > /sys/kernel/debug/dynamic_debug/control""",hl=[[0],[1],[2],[3],[4],[5],[6]],say=[
"Tracing recipes. Go to the tracing directory.",
"Choose the function graph tracer, which shows call trees with timings.",
"Limit it to d w c three functions, and turn tracing on.",
"Or enable d w c three's trace events, and stream them.",
"Trace c m d wraps all of this in one command.",
"Perf record with call graphs, across all CPUs, finds CPU hogs, like a memcpy in a video path.",
"And dynamic debug turns on a module's debug prints at run time, without rebuilding."]),
S("bullets","More weapons",items=["KASAN, KCSAN, lockdep, kmemleak in debug builds","pstore / ramoops: logs survive reboot","JTAG (TRACE32, OpenOCD) for early hangs and lockups","Android: tombstones, bugreport, simpleperf, Perfetto","git bisect run <test> for regressions"],say=[
"More tools.",
"Debug builds with memory, race and lock checkers, and a leak detector.",
"P store and ram oops keep logs across a reboot, so you can read a crash that reset the board.",
"JTAG for hangs before the console, and for multi core lockups.",
"On Android: tombstones for native crashes, bug reports, simple perf, and Perfetto traces.",
"And git bisect run, with an automated test, finds the commit that broke something."]),
S("recap","Recap",items=["Oops: what, where (pc), how (trace)","Offset in fault address → struct field","faddr2line → source line","ftrace for timelines, perf for CPU","Fix + regression test + write-up"],say=[
"Recap.",
"An oops tells you what, where, and how.",
"The fault address offset points to the struct field.",
"F addr two line gives the source line.",
"Ftrace for timelines, perf for CPU time.",
"And every fix gets a regression test and a short write up."])]),

V("v18-power-net-security","Lesson 18 · Platform","Power, networking, Wi-Fi/BT and security",[
S("title",sub="Lights off in empty rooms, locks on every door",items=["Runtime PM, step by step","Networking for meeting devices","Security habits"],say=[
"This video covers power management, the networking and wireless basics a meeting device needs, and the security habits both postings ask for."]),
S("analogy","Plain analogy: running a building",items=["Turn off lights in empty rooms (runtime PM)","Never darken a busy room (usage counts)","Lock every door, including the builders' side door (JTAG, UART, adb)","Check every visitor's badge (validate inputs)"],say=[
"Running a device is like running a building.",
"Turn off the lights in empty rooms. That's runtime power management.",
"But never plunge a busy room into darkness. That's what usage counts protect.",
"Lock every door, including the side door the builders used. Those are JTAG, the UART console, and adb.",
"And check every visitor's badge. That means validating every input from USB, HDMI and the network."]),
S("terms",items=[("Runtime PM","Per-device power down when idle."),("Autosuspend","Delay before suspending, avoids flapping."),("USB LPM (U1/U2)","Link power states; exit latency can hurt isoc."),("TEE","Trusted execution environment for keys."),("cfg80211 / BlueZ","Linux Wi-Fi framework / Bluetooth stack.")],say=[
"Words.",
"Runtime power management turns individual devices off when idle.",
"Autosuspend waits a short delay first, so devices don't flap on and off.",
"USB link power management uses U one and U two states. Their exit latency can glitch isochronous streams.",
"The trusted execution environment protects keys.",
"And c f g eight oh two eleven and Blue Z are Linux's Wi-Fi framework and Bluetooth stack."]),
S("flow","Runtime PM of a camera sensor",items=["App opens /dev/video0","pm_runtime_get_sync()","resume: regulators, clocks, reset release","Streaming","App closes","pm_runtime_put_autosuspend()","Suspend: clocks + regulators off"],subs=["usage = 1","driver callback","datasheet power sequence","usage > 0 keeps it on","usage = 0","timer starts","power saved"],say=[
"Runtime power management for a camera sensor, step by step.",
"An app opens the video device.",
"The driver calls p m runtime get sync. The usage count becomes one.",
"The resume callback turns on regulators and clocks, and releases reset, in the order the datasheet requires.",
"While streaming, the usage count keeps it on.",
"The app closes the device.",
"The driver puts its reference, with autosuspend.",
"After the delay, the suspend callback turns clocks and regulators off. Unbalanced gets and puts are the classic bug: devices that never sleep, or that turn off mid stream."]),
S("bullets","Networking, Wi-Fi and Bluetooth",items=["ip, ethtool, tcpdump; QoS/DSCP for RTP","VLANs and 802.1X in enterprise networks","iw, wpa_supplicant; firmware in /lib/firmware","btmon for HCI capture; HFP/A2DP/LE Audio"],say=[
"Networking basics for meeting devices.",
"Know ip, ethtool and tcpdump, and mark real time media with D S C P so switches prioritize it.",
"Enterprise networks use VLANs and eight oh two dot one X authentication.",
"For Wi-Fi: i w, w p a supplicant, and where chip firmware is loaded from.",
"For Bluetooth: capture the host controller interface with b t mon, and know the headset profiles, including L E audio."]),
S("bullets","Security habits",items=["Lock JTAG/UART in production; no adb in user builds","Treat USB/HDMI/network input as hostile; fuzz it","Keys in TEE/keystore, never files","Signed updates, verified boot, dm-verity, SELinux enforcing","SBOM + monthly CVE patch merges"],say=[
"Security habits.",
"Lock JTAG and the UART in production, and disable adb in user builds.",
"Treat every USB descriptor, E D I D block and network packet as hostile, and fuzz the parsers.",
"Keep keys in the trusted environment, never in files.",
"Use signed updates, verified boot, d m verity, and enforcing SELinux.",
"And keep a software bill of materials, with monthly security patch merges."]),
S("recap","Recap",items=["Balance pm_runtime get/put","Watch USB LPM for stream glitches","Mark media traffic with DSCP","Close debug doors in production","Validate and fuzz every external input"],say=[
"Recap.",
"Balance every runtime get with a put.",
"Watch USB link power management when streams glitch.",
"Mark media traffic for priority.",
"Close the debug doors in production.",
"And validate and fuzz every external input."])]),

V("v19-ota-testing","Lesson 19 · Quality","OTA updates, testing and CI for firmware",[
S("title",sub="Changing the engine mid-flight",items=["A/B update with rollback, step by step","The test pyramid","CI that catches regressions"],say=[
"This video covers safe over the air updates with automatic rollback, and the testing and CI strategy a senior engineer is expected to own."]),
S("analogy","Plain analogy: two engines",items=["Slot A = the engine that's running","Slot B = install the new engine","Test before switching","Coughs → switch back automatically"],say=[
"Updating firmware in the field is like replacing an airplane engine mid flight.",
"Keep one good engine running. That's slot A.",
"Install the new engine on the other side. That's slot B.",
"Test it before you trust it.",
"And if it coughs, switch back automatically."]),
S("terms",items=[("A/B update","Two copies of partitions; update the inactive one."),("Boot counter","Tries left before falling back."),("Anti-rollback","Refuse images older than a stored version."),("HIL","Hardware-in-the-loop test rack."),("Bisect","Binary search through commits for a regression.")],say=[
"Words.",
"An A B update keeps two copies of each partition, and writes only the inactive one.",
"A boot counter tracks how many tries the new slot has left.",
"Anti rollback refuses images older than a stored version.",
"Hardware in the loop means automated tests on real boards in a rack.",
"And bisecting is a binary search through commits to find a regression."]),
S("seq","A/B update with automatic rollback",lanes=["Update agent","Bootloader","Slot A (good)","Slot B (new)"],msgs=[(0,3,"write image to inactive slot B"),(0,3,"verify hash, signature, version"),(0,1,"set B active, tries = 3"),(1,3,"boot B"),(3,1,"health check fails, no markBootSuccessful"),(1,3,"retry... tries = 0"),(1,2,"fall back to A"),(2,0,"report failure telemetry")],say=[
"An update, step by step.",
"The agent writes the new image into the inactive slot, B. The device keeps running from A.",
"It verifies the hash, the signature, and the version against the anti rollback counter.",
"It marks B active, with three tries.",
"The bootloader boots B.",
"But B fails its health checks, so it never marks itself successful.",
"The bootloader retries, decrementing the counter, until it reaches zero.",
"Then it falls back to A.",
"And A reports the failure, so the team sees it in telemetry. Mark a slot successful only after real health checks: services up, USB enumerated, camera streaming."]),
S("flow","The test pyramid for firmware",items=["Unit tests on PC (+ sanitizers)","Virtual: QEMU, dummy_hcd, vivid, v4l2-compliance","HIL rack: real boards, USB switches, HDMI generators","Certification: Teams/Zoom, USB-IF, CTS/VTS","Field telemetry"],subs=["seconds, every commit","minutes, every merge","hours, nightly","per release","always on"],say=[
"Now the test pyramid.",
"At the base, unit tests on a PC with sanitizers, like labs four, five, eight, nine and ten. Seconds, on every commit.",
"Then virtual tests: QEMU, dummy h c d, vivid and v four l two compliance, like our lab zero harness. Minutes, on every merge.",
"Then a hardware in the loop rack: real boards, programmable USB switches, HDMI generators, and power relays. Enumerate a thousand times on three host operating systems, every night.",
"Then certification: Teams and Zoom, USB I F compliance, and Android's test suites.",
"And field telemetry: crashes, enumeration failures and frame drops from real rooms."]),
S("code","CI and bisect",code="""# every merge
make -C labs/04-usb-descriptor-parser && ./usbdesc golden.bin
./labs/00-qemu-harness/run_all_in_qemu.sh | grep -q '=== DONE'
# nightly on HIL: enumerate x1000 on Windows/macOS/Linux, power-cut tests
# regression hunt
git bisect start bad_sha good_sha
git bisect run ./test_enumeration.sh""",hl=[[1],[2],[3],[5],[6]],say=[
"On every merge, run fast checks, like parsing the golden descriptor dump.",
"Then run the QEMU harness.",
"Nightly, run hardware tests, including power cuts during updates.",
"When something breaks, start a bisect between a known bad and a known good commit.",
"And let git bisect run your test automatically, to find the exact commit."]),
S("recap","Recap",items=["Verify before switch; boot counter + fallback","Mark successful only after health checks","Unit → virtual → HIL → certification → telemetry","Kill flaky tests","Bisect with automated tests"],say=[
"Recap.",
"Verify before switching, with a boot counter and fallback.",
"Mark the slot successful only after real health checks.",
"Test in layers: unit, virtual, hardware, certification, telemetry.",
"Fix flaky tests, because they hide real regressions.",
"And bisect with automated tests."])]),

V("v20-senior-staff","Lesson 20 · Career","Growing to senior and staff on this team",[
S("title",sub="From fixing bugs to multiplying the team",items=["The postings' senior verbs","From fix to multiplier, step by step","Showing impact"],say=[
"This final video turns the senior responsibilities in both postings into concrete habits, and shows how to make your impact visible."]),
S("analogy","Plain analogy: fixing vs preventing",items=["Senior: fixes the hard bug","Staff: makes the whole team stop creating that kind of bug","By changing design, tools or process"],say=[
"A senior engineer fixes the hard bug.",
"A staff engineer makes sure the whole team stops creating that kind of bug.",
"They do it by changing the design, the tools, or the process."]),
S("terms",items=[("Design doc","Context, options, trade-offs, decision, rollout, test plan."),("Blast radius","How much a change can affect."),("Brag doc","Running log of your impact with evidence."),("Lean","Small batches, fast feedback, less waste.")],say=[
"Words.",
"A design doc covers context, options, trade offs, the decision, rollout, and a test plan.",
"Blast radius is how many products or users a change can affect.",
"A brag doc is your own running log of impact, with evidence.",
"And lean means small batches, fast feedback, and less waiting and rework."]),
S("bullets","Posting verbs → habits",items=["Lead C/C++ → own one subsystem end to end (e.g. UVC gadget path)","Define standards → write a USB descriptor + composite rules doc","Troubleshoot → bring analyzer traces + root-cause write-ups","Testing strategy → land unit + QEMU + HIL jobs","Mentor → monthly deep dive; teaching code reviews","Agile/lean → measure one thing and improve it"],say=[
"The postings' verbs, turned into habits.",
"Lead C and C plus plus: own one subsystem end to end, for example the U V C gadget path.",
"Define standards: write a USB descriptor and composite rules document, and get it adopted.",
"Troubleshoot: be the person who brings the analyzer trace and the root cause write up.",
"Testing strategy: land unit, QEMU and hardware jobs for your area.",
"Mentor: run a monthly deep dive, and write code reviews that teach.",
"Agile and lean: measure one thing, like build time or flaky test rate, and improve it."]),
S("flow","From fix to multiplier",items=["Fix the bug","Write the root-cause note","Add a regression test","Add a checklist item / CI rule","Teach it in a deep dive","Change the design so it can't recur"],subs=["senior baseline","shared knowledge","never again here","never again anywhere","team capability","staff impact"],say=[
"Here's how one bug becomes staff level impact.",
"Fix the bug.",
"Write a short root cause note.",
"Add a regression test, so it never comes back here.",
"Add a checklist item or CI rule, so it never happens anywhere.",
"Teach it in a deep dive.",
"And change the design, so this class of bug becomes impossible."]),
S("bullets","Showing impact",items=["Numbers: frame drops 2.1% → 0.05%, enumeration failures −80%","Weekly brag doc: problem → action → result → who benefited","Monthly update tied to your manager's goals","Clear vendor escalations (Qualcomm, NXP, Ambarella, Lontium)","Upstream patches, with approval"],say=[
"Showing impact.",
"Use numbers. For example: frame drops reduced from two point one percent to zero point zero five, or enumeration failures down eighty percent. These are example targets, not facts.",
"Keep a weekly brag doc: the problem, what you did, the result, and who benefited.",
"Send a short monthly update tied to your manager's goals.",
"Run clear, reproducible vendor escalations. That visibility is staff level work.",
"And when allowed, send a few upstream kernel patches."]),
S("recap","Recap and next steps",items=["Days 1–30: learn the house","Days 31–60: own a slice","Days 61–90: design doc + deep dive + goals","Months 4–12: multiply the team","See LEARNING_PLAN.md"],say=[
"Let's close with the plan.",
"Days one to thirty: learn the house. Build, flash, debug, and map the stack.",
"Days thirty one to sixty: own a slice, like the USB device path.",
"Days sixty one to ninety: a design doc, a deep dive, and agreed goals.",
"Months four to twelve: multiply the team.",
"The full plan is in the learning plan file. Good luck. You've got this."])]),
]
