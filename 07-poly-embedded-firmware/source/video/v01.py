from common import *
V=[V("v01-roles-decoded","Lesson 1 · Start here","Your two Poly roles, decoded",[
S("title",sub="Follow the bar's USB path, piece by piece",items=["The restaurant picture","The USB device path, one piece at a time","The rest of the stack and the senior verbs"],say=[
"Welcome to the Poly Firmware Academy. This first video decodes the two job postings for your team by following one real thing: what happens when our video bar is plugged into a laptop.",
"Every new word gets a card on screen with a plain meaning and an everyday picture, so nothing is left undefined."]),
S("analogy","Plain analogy: the bar is a restaurant",items=["Diners = Teams and Zoom apps","Dining room = Android's system services","Kitchen = hardware services and helper programs (your code)","Basement wiring = Linux kernel and drivers (your code)","Front door lock = boot and security (your code)","Delivery door = USB (your code)"],say=[
"First, one picture to hang everything on. Think of the bar as a restaurant.",
"The diners are the apps, like Teams or Zoom. They only ever see the dining room.",
"The dining room is Android's system services, the layer the postings call the framework layer.",
"The kitchen is where hardware gets turned into features: the hardware services and helper programs. That's your code.",
"The basement wiring is the Linux kernel and its drivers. Also yours.",
"The front door lock is the boot sequence and security checks. Also yours.",
"And the delivery door is USB: how video, sound and button presses leave the building. The USB posting says this door is a must have."]),
S("icons","The bar's USB device path, piece by piece",chain=True,snake=True,items=[
("laptop","Laptop = USB host","asks every question"),("cable","USB-C cable","power + data"),("chip","UDC, e.g. DWC3","the front desk"),("gear","Gadget framework + configfs","puts on the costume"),
("box","Functions: UVC, UAC2, HID","webcam, audio, buttons"),("doc","UVC streaming app","feeds video frames"),("eye","Camera pipeline (V4L2)","makes the frames"),("phone","Android USB HAL","picks the mode")],say=[
"Now the main walk. We'll follow the path from the laptop into the bar, one piece at a time.",
"Piece one: the laptop. In USB the laptop is the host. It is always the one asking questions; the bar only ever answers.",
"Piece two: the USB C cable. It carries power and data, and a couple of extra wires the two sides use to agree who is the host.",
dict(s="Piece three: inside the bar's main chip sits a UDC, a USB device controller: the hardware that lets the bar answer the laptop. On our Qualcomm and NXP chips it is usually a DWC3, a ready-made controller design that Synopsys sells to chip makers.",sp="Piece three: inside the bar's main chip sits a U D C, a USB device controller: the hardware that lets the bar answer the laptop. On our Qualcomm and N X P chips it is usually a D W C 3, a ready-made controller design that Synopsys sells to chip makers.",defines=["udc","dwc3"]),
dict(s="Piece four: Linux's gadget framework, the device side of USB that lets the board pretend to be a webcam. We describe the costume with configfs: a special folder tree where making folders and writing small files builds the gadget.",sp="Piece four: Linux's gadget framework, the device side of USB that lets the board pretend to be a webcam. We describe the costume with config F S: a special folder tree where making folders and writing small files builds the gadget.",defines=["gadget","configfs","framework"]),
dict(s="Piece five: the functions. UVC, the USB video class, makes the bar a webcam. UAC2, the USB audio class, makes it a microphone and speaker. HID, the human interface class, carries the mute and call buttons. Every laptop already speaks these standard languages, so no driver install is ever needed.",sp="Piece five: the functions. U V C, the USB video class, makes the bar a webcam. U A C two, the USB audio class, makes it a microphone and speaker. H I D, the human interface class, carries the mute and call buttons. Every laptop already speaks these standard languages, so no driver install is ever needed.",defines=["uvc","uac","hid","driver"]),
"Piece six: a normal program on the bar, the U V C streaming app. When the laptop asks for video, this app answers with frames.",
dict(s="Piece seven: where frames come from. The camera sensor and image processor deliver frames through V4L2, video for Linux, the standard Linux camera interface.",sp="Piece seven: where frames come from. The camera sensor and image processor deliver frames through V four L two, video for Linux, the standard Linux camera interface.",defines=["v4l2"]),
dict(s="Piece eight: the Android USB HAL, a hardware abstraction layer: a fixed interface Android calls and we implement. It decides whether the port is in conferencing, file transfer or debug mode, and switches the gadget setup to match.",sp="Piece eight: the Android USB HAL, a hardware abstraction layer: a fixed interface Android calls and we implement. It decides whether the port is in conferencing, file transfer or debug mode, and switches the gadget setup to match.",defines=["hal"])]),
S("seq","What happens when Zoom opens the camera",lanes=["Laptop (host)","UDC + gadget","UVC app","Camera (V4L2)"],msgs=[
(0,1,"plug in: enumeration, descriptors"),(1,0,"I am: webcam + mic + speaker + buttons"),(0,1,"Zoom: start video, 1080p, MJPEG"),(1,2,"event: stream on, format chosen"),(2,3,"start camera at that format"),(3,2,"frame ready (buffer)"),(2,1,"queue frame to the video endpoint"),(1,0,"isochronous packets every 125 µs")],say=[
"Let's watch one moment in detail: Zoom opening the camera.",
"On plug in, the laptop runs enumeration: it asks the bar for its descriptors.",
"The bar answers: I am a webcam, a microphone, a speaker, and some buttons.",
"Zoom asks the webcam to start video at a certain size and format.",
"The gadget framework passes that request up to the streaming app as an event.",
"The app starts the camera at exactly that format.",
"The camera hands back a filled frame buffer.",
"The app queues the frame to the video endpoint on the controller.",
"And the controller sends it as isochronous packets, a slice every hundred and twenty five microseconds. That's how a picture appears in Zoom."]),
S("bullets","The rest of the 'full USB stack'",items=["Host side: the bar also hosts accessories (xHCI, hubs)","Type-C and PD: who powers whom, cable orientation, DisplayPort alt mode","Firmware updates over USB (DFU), including accessory microcontrollers","Debugging: usbmon, Wireshark, hardware analyzers"],say=[
"The posting's phrase full USB software stack also includes three more rooms.",
"Host side: the bar also plugs in its own accessories, like extension microphones, so it runs an x H C I host controller too.",
"Type C and power delivery: deciding who powers whom, which way the cable is flipped, and sending DisplayPort video over the same connector.",
"Firmware updates over USB using D F U, including the small microcontrollers inside accessories.",
"And the debugging tools: usbmon, Wireshark and hardware analyzers. Lessons ten to fourteen cover each room."]),
S("flow","The whole stack you own, top to bottom",items=["Apps (Teams / Zoom rooms)","Android framework services","HALs + native daemons","Linux kernel drivers","Bootloader / secure boot","SoC, bridges, USB PHY"],subs=["not yours","calls your HALs","yours","yours","yours","vendor silicon"],say=[
"Zooming back out, here's the whole stack.",
"At the top, apps like Zoom. Not your layer.",
"Android's framework services, which call down into your code.",
"The hardware services and helper daemons, written in C plus plus. Yours.",
"The kernel drivers: camera, audio, USB gadget, and I two C drivers for chips like the Lontium HDMI bridges. Yours.",
"The bootloader and secure boot. Yours.",
"And the silicon from Qualcomm, NXP, Ambarella and Lontium, delivered with each vendor's BSP."]),
S("bullets","The senior verbs both postings repeat",items=["Lead secure, high-performance C/C++","Define architecture and standards","Troubleshoot system-level issues","Plan, document, own the test strategy","Mentor junior engineers"],say=[
"Finally, the senior behaviors both postings repeat.",
"Lead secure, high performance C and C plus plus.",
"Define architecture and standards with other teams.",
"Troubleshoot the bugs that cross hardware, kernel and Android.",
"Own planning, documentation and the test strategy.",
"And mentor junior engineers. Lesson twenty turns these into weekly habits."]),
S("recap","Recap",items=["Laptop asks, bar answers: the laptop is the host","UDC (often DWC3) → gadget + configfs → UVC/UAC2/HID → streaming app ← camera","Standard classes = no driver install","Android USB HAL picks the mode","Senior = lead, set standards, mentor"],say=[
"Quick recap.",
"The laptop is the host and asks every question.",
"Inside the bar, the path runs from the UDC, often a DWC3, through the gadget framework and configfs, to the U V C, U A C two and H I D functions, fed by the streaming app and the camera.",
"Standard classes mean no driver install on any laptop.",
"The Android USB HAL picks which mode the port is in.",
"And senior means leading, setting standards and mentoring. Next up: the C and C plus plus habits firmware reviewers look for."])])]
