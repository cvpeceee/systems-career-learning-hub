from common import *
V=[
V("v07-yocto-bsp","Lesson 7 · Build","Yocto, Buildroot and vendor BSPs",[
S("title",sub="Repeatable images on top of vendor kits",items=["Layers and recipes","How an image is built","Living with vendor BSPs"],say=[
"This video explains how a product image is assembled with Yocto, and how to live with chip vendor BSPs without drowning in patches."]),
S("analogy","Plain analogy: a meal kit and a recipe book",items=["Vendor BSP = meal kit for their kitchen","Yocto layers = recipe book pages","bbappend = 'same recipe, our spices'","Pinned revisions = the same meal next year"],say=[
"A vendor BSP is like a meal kit: everything in the box, pre measured, but designed for the vendor's kitchen.",
"Yocto is your recipe book, organized in layers. Each layer adds or changes recipes.",
"A b b append file says: use the vendor's recipe, but add our spices. You never edit the kit itself.",
"And pinning every layer revision means you can cook exactly the same meal again next year."]),
S("terms",items=[("BitBake","Yocto's task engine that runs recipes."),("Recipe (.bb)","Instructions to fetch, patch, build and package one component."),("Layer (meta-*)","A folder of recipes: meta-qcom, meta-freescale, meta-company."),("sstate cache","Reusable build outputs that make rebuilds fast."),("Upstream / downstream","Main project vs a vendor or company fork.")],say=[
"Words.",
"BitBake is Yocto's engine. It reads recipes and runs their tasks.",
"A recipe describes how to fetch, patch, configure, build and package one component.",
"A layer is a folder of recipes, like meta qcom from Qualcomm, meta freescale for N X P, and your company's own layer.",
"The shared state cache stores build outputs so unchanged parts are never rebuilt.",
"Upstream means the main open source project. Downstream means a vendor or company fork of it."]),
S("flow","How an image is assembled",items=["poky + vendor layers","meta-company: bbappends, .cfg fragments","BitBake parses recipes","fetch → patch → configure → compile","package (ipk / rpm / deb)","rootfs + kernel + dtb → wic image","flash, or runqemu"],subs=["vendor kit","your spices","dependency graph","per recipe, sstate cached","per-package","sd/eMMC image","test it"],say=[
"Here's how an image comes together.",
"You start with poky, the Yocto reference, plus the vendor's layers.",
"On top, your company layer adds b b append files and kernel config fragments.",
"BitBake parses every recipe and builds a dependency graph.",
"For each recipe, it fetches source, applies patches, configures and compiles. Anything unchanged comes from the shared state cache.",
"Outputs are split into packages.",
"Then the root filesystem, kernel and device tree are combined into a flashable image.",
"And you flash it, or run it in QEMU with run qemu."]),
S("code","Day-to-day commands",code="""source oe-init-build-env build
bitbake core-image-minimal
bitbake -c devshell linux-yourboard
bitbake -c menuconfig virtual/kernel
devtool modify linux-yourboard     # edit, then: devtool finish
bitbake -e myapp | grep ^SRC_URI=
MACHINE=qemuarm64 bitbake core-image-minimal && runqemu qemuarm64 nographic""",hl=[[0],[1],[2],[3],[4],[5],[6]],say=[
"Set up the build environment.",
"Build an image.",
"Open a shell inside the kernel recipe's work directory, with the cross compiler ready.",
"Change kernel options interactively. Then save them as a fragment.",
"Dev tool modify checks out the source for editing, and dev tool finish turns your commits into patches in your layer.",
"Bitbake dash e shows the final value of any variable, which answers most where did this come from questions.",
"And this line builds and boots an ARM sixty four image in QEMU, with no hardware. Expect a long first build and a lot of disk space."]),
S("bullets","Vendor BSP strategy",items=["Know exactly which vendor release you're on","Keep your changes as a numbered patch series","Search upstream before patching; backport with Fixes: tags","File vendor tickets with repro, versions, logs, an ask","Maintain a 'BSP delta' document"],say=[
"Now a senior strategy for vendor BSPs.",
"Always know exactly which vendor release each product is on.",
"Keep your changes as a numbered patch series on top. Moving to the next vendor release becomes a mechanical rebase.",
"Before patching a vendor driver, search upstream. The fix often exists. Backport it, with its fixes tag, instead of inventing your own.",
"File vendor tickets with a minimal reproduction, versions, logs, and a clear ask. That saves weeks.",
"And keep a BSP delta document: what changed, why, and whether it can go upstream."]),
S("recap","Recap",items=["Never edit vendor layers in place","bbappend + .cfg fragments in meta-company","Pin layer revisions","Prefer upstream backports","Document every delta"],say=[
"Recap.",
"Never edit vendor layers in place.",
"Put changes in your own layer, as b b appends and config fragments.",
"Pin every layer revision.",
"Prefer upstream backports to custom fixes.",
"And document every delta."])]),

V("v08-v4l2-alsa","Lesson 8 · Media","Camera and audio pipelines: V4L2 and ALSA",[
S("title",sub="Frames and samples through the kernel",items=["The V4L2 buffer queue","Conference camera pipeline","Audio clocks"],say=[
"In this video, we follow camera frames through V four L two, the Linux video API, and look at the audio side with ALSA."]),
S("analogy","Plain analogy: cafeteria trays",items=["You hand empty trays to the kitchen (QBUF)","The kitchen fills them (DMA)","You take a full tray (DQBUF)","Eat, then hand it back","Slow to return trays → kitchen drops meals"],say=[
"V four L two works like a cafeteria tray system.",
"You hand empty trays to the kitchen. That's queueing a buffer.",
"The kitchen fills them with food. That's the hardware writing a frame by DMA.",
"You take a full tray off the counter. That's dequeueing.",
"You eat, then hand the tray back.",
"If you're slow to hand trays back, the kitchen runs out, and drops meals. Those are dropped frames."]),
S("terms",items=[("V4L2","Video4Linux2, the kernel API for cameras, encoders and HDMI capture."),("Media controller","Graph of sensor → CSI receiver → ISP → video node."),("Subdevice","/dev/v4l-subdevN: one block in the pipeline."),("ALSA / ASoC","Linux audio; ASoC splits codec, platform and machine drivers."),("vivid","A virtual V4L2 test camera.")],say=[
"Words.",
"V four L two is the Linux kernel API for cameras, video encoders and HDMI capture. It shows up as slash dev slash video nodes.",
"The media controller describes the graph: sensor, then the CSI receiver, then the image signal processor, then the video node.",
"A subdevice is one block in that graph, with its own formats.",
"ALSA is Linux audio. Its system on chip layer, called ASoC, splits drivers into codec, platform and machine parts.",
"And vivid is a virtual test camera, so you can test code without hardware."]),
S("seq","The buffer ping-pong (Lab 07)",lanes=["App","V4L2 core","Driver / DMA"],msgs=[(0,1,"QUERYCAP, S_FMT 640x480 YUYV"),(0,1,"REQBUFS count=4, mmap each"),(0,1,"QBUF #0..#3 (empty)"),(0,1,"STREAMON"),(2,2,"DMA fills #0, IRQ"),(2,1,"vb2_buffer_done(#0)"),(1,0,"DQBUF → #0 full, seq=0"),(0,0,"encode / send over UVC"),(0,1,"QBUF #0 back")],say=[
"Here's the exact sequence from lab seven.",
"The app checks capabilities, and sets the format: six forty by four eighty, YUYV.",
"It requests four buffers, and maps each one into its memory.",
"It queues all four, empty.",
"It starts streaming.",
"The hardware fills buffer zero by DMA and raises an interrupt.",
"The driver marks buffer zero done.",
"The app's dequeue call returns buffer zero, full, with sequence number zero.",
"The app uses it, for example encodes it, or sends it out over USB as a webcam.",
"And queues it back. In our QEMU run with vivid, every frame came back with six hundred fourteen thousand four hundred bytes, exactly six forty times four eighty times two."]),
S("flow","Conference camera pipeline",items=["Image sensor","MIPI CSI-2 receiver","ISP","Scaler / crop (auto-framing)","H.264 / MJPEG encoder or raw","UVC gadget → laptop / or RTP → network"],subs=["raw Bayer","SoC","debayer, 3A, noise","dma-buf, zero copy","V4L2 M2M or vendor SDK","USB isoc or network"],say=[
"Now the whole camera pipeline in a conferencing device.",
"The image sensor produces raw Bayer data.",
"It arrives over MIPI CSI two into the SoC's receiver.",
"The image signal processor turns it into a real picture, and runs auto exposure, white balance and focus.",
"A scaler crops and zooms, for example for auto framing on the speaker. Buffers move between blocks as d m a buf file descriptors, with no copies.",
"An encoder produces H two sixty four or M J P E G.",
"And the stream leaves either over USB as a webcam, or over the network as R T P."]),
S("bullets","Audio essentials",items=["Echo cancellation needs mic and speaker on one clock (or known drift)","Watch XRUNs: aplay -v, /proc/asound/.../status","USB UAC clock ≠ local I2S crystal → async UAC + feedback","Always run v4l2-compliance after driver changes"],say=[
"Conferencing lives or dies on audio.",
"Echo cancellation needs the microphone and speaker on the same clock, or with known drift.",
"Watch for over runs and under runs in the ALSA status files.",
"The USB host's clock is different from your board's crystal, so use asynchronous U A C with a feedback endpoint.",
"And for video, run v four l two compliance after every driver change."]),
S("recap","Recap",items=["QBUF empty → DQBUF full → use → QBUF again","Hold buffers briefly; enough buffers","dma-buf for zero copy","Media controller wires the pipeline","Audio: one clock domain, async UAC"],say=[
"Recap.",
"Queue empty, dequeue full, use it, queue it again.",
"Hold buffers briefly, and allocate enough of them.",
"Use d m a buf for zero copy between blocks.",
"The media controller wires the pipeline.",
"And for audio, keep one clock domain, or use asynchronous U A C."])]),
]
