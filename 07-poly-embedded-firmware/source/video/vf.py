from common import *
V=[
V("v12-usb-classes","Lesson 12 · USB","UVC, UAC, HID and CDC for conferencing",[
S("title",sub="Why conference bars 'just work'",items=["UVC topology and probe/commit","Isochronous payloads","UAC, HID, composite rules"],say=[
"This video covers the standard USB classes that make a conference bar work on any laptop without a driver install: video, audio, buttons and serial."]),
S("analogy","Plain analogy: standard job descriptions",items=["Class = a standard job description","Every OS already has the handbook","No custom driver install","Composite = one person, several jobs"],say=[
"USB classes are standard job descriptions.",
"If a device says: I'm a U V C camera, every operating system already has the handbook for that job.",
"So no custom driver install is needed.",
"And a composite device is one person holding several jobs at once: camera, microphone, speaker and buttons."]),
S("terms",items=[("UVC","USB Video Class: cameras."),("UAC","USB Audio Class 1, 2, 3: mics and speakers."),("HID","Human Interface Device: buttons, telephony controls."),("CDC ACM","Communications class serial port."),("Probe / Commit","UVC negotiation of format, size, interval and payload.")],say=[
"Words.",
"U V C is the USB video class, for cameras.",
"U A C is the USB audio class, versions one, two and three.",
"H I D is the human interface device class: keyboards, but also mute and hook switch buttons.",
"C D C A C M is a serial port over USB, great for debug consoles.",
"And probe and commit is how a U V C host and camera agree on a format."]),
S("seq","UVC probe/commit, then streaming",lanes=["Host uvcvideo","Device UVC function","Gadget streaming app"],msgs=[(0,1,"SET_CUR PROBE: format, frame, interval"),(1,2,"UVC event: setup request"),(2,1,"fill probe: dwMaxPayloadTransferSize"),(0,1,"GET_CUR PROBE"),(0,1,"SET_CUR COMMIT"),(0,1,"SET_INTERFACE alt = 1 (reserve bandwidth)"),(1,2,"STREAMON event"),(2,1,"queue frames (V4L2 output)"),(1,0,"isoc payloads: header + data")],say=[
"Here's what happens when a laptop app opens the camera.",
"The host sends a probe request with the format, frame size and frame interval it wants.",
"On the device, the U V C function turns this into an event for the user space streaming app.",
"The app fills in the probe structure, including the maximum payload per transfer.",
"The host reads the probe back, to see what the device agreed to.",
"Then it commits.",
"It selects an alternate setting big enough for that payload. This reserves bandwidth on the bus.",
"The streaming app receives a stream on event.",
"It starts queueing frames from the ISP or encoder.",
"And the device sends isochronous payloads, each with a small header and then image data. If any step here is wrong, the classic symptom is: the camera opens, but the picture is black."]),
S("code","UVC payload header (every isoc packet)",code="""byte 0  bHeaderLength   = 12
byte 1  bmHeaderInfo:
          bit0 FID  toggles every new frame
          bit1 EOF  set on the last packet of a frame
          bit2 PTS present   bit3 SCR present
          bit6 ERR           bit7 EOH
bytes 2-5   PTS  presentation time (device clock)
bytes 6-11  SCR  source clock reference
then: image data ...""",hl=[[0],[2],[3],[4,6,7],[5],[8]],say=[
"Every isochronous packet starts with a payload header. The first byte is its length, often twelve.",
"The frame I D bit toggles at each new frame. That's how the host finds frame boundaries.",
"The end of frame bit marks the last packet of a frame.",
"Optional presentation time and source clock fields let the host sync audio and video.",
"An error bit tells the host to drop a bad frame.",
"Then the image data follows. Wrong F I D or E O F handling causes torn or merged frames."]),
S("bullets","UAC and HID for conferencing",items=["UAC1: works everywhere; UAC2: high speed, clock entities","Async sync + feedback EP for own crystal","Feature Unit: volume and mute","HID telephony page 0x0B: hook switch, mute, LEDs","Host → device output reports keep mute LED in sync"],say=[
"Audio and buttons.",
"U A C one works everywhere. U A C two supports high speed and higher sample rates, with clock entities.",
"A device with its own crystal should use asynchronous mode, with a feedback endpoint that tells the host the real rate.",
"Volume and mute are controls on a feature unit.",
"For Teams and Zoom, buttons use the H I D telephony page: hook switch and phone mute.",
"And output reports from the host drive your LEDs, so the device's mute light follows the app."]),
S("bullets","Composite device rules",items=["Group functions with IADs (class EF/02/01)","Keep interface numbers stable across releases","Bump bcdDevice when descriptors change","Test on Windows, macOS and Linux every release"],say=[
"Composite device rules.",
"Group each function's interfaces with interface association descriptors, and use device class E F, two, one.",
"Keep interface numbers stable across firmware releases.",
"Bump b c d Device whenever descriptors change, because Windows caches by it.",
"And test every release on Windows, macOS and Linux."]),
S("recap","Recap",items=["Classes = no driver install","Probe/commit then alt setting then stream","FID toggles, EOF ends a frame","Async UAC with feedback","HID telephony for certified mute"],say=[
"Recap.",
"Standard classes mean no driver install.",
"For video: probe, commit, select an alternate setting, then stream.",
"The frame I D bit toggles each frame, and end of frame closes it.",
"Use asynchronous U A C with feedback.",
"And H I D telephony controls give certified mute behavior."])]),

V("v13-usb-gadget","Lesson 13 · USB","Linux USB gadget: configfs, FunctionFS and Android",[
S("title",sub="Building a webcam out of a Linux board",items=["The gadget stack","configfs, step by step","Android USB HAL"],say=[
"This video shows how a Linux or Android board becomes a USB webcam, microphone and serial port, using the gadget framework and configfs. We'll build the gadget from lab six step by step."]),
S("analogy","Plain analogy: a LEGO baseplate",items=["configfs = the baseplate","Functions = bricks (camera, mic, serial, buttons)","Configuration = how bricks are stacked","Writing UDC = plugging it into the wall"],say=[
"Configfs is a LEGO baseplate.",
"Each USB function, camera, microphone, serial port or buttons, is a brick.",
"You stack bricks into a configuration.",
"And writing the controller's name into a file called U D C plugs the whole thing into the wall. Writing an empty string unplugs it."]),
S("terms",items=[("Gadget","Linux's name for device-mode USB."),("libcomposite","Kernel library combining functions into one device."),("configfs","Filesystem where mkdir creates kernel objects."),("FunctionFS","Lets a userspace program implement a USB function."),("DWC3","Synopsys USB3 controller used in many SoCs."),("dummy_hcd","Software host + device pair for testing on one PC.")],say=[
"Words.",
"Gadget is Linux's name for device mode USB.",
"Lib composite is the kernel library that combines several functions into one device.",
"Configfs is a filesystem where making a directory creates a kernel object.",
"Function F S lets a user space program implement a USB function. Android's adb uses it.",
"D W C 3 is the Synopsys USB three controller found in many Qualcomm and N X P chips.",
"And dummy h c d is a software host and device pair, for testing a gadget on one PC."]),
S("flow","The gadget stack",items=["UDC driver (dwc3 / chipidea / cdns3)","udc-core","libcomposite","Functions: uvc, uac2, hid, acm, ncm, ffs","Userspace: UVC app, adbd, MTP","Android USB gadget HAL + init .rc"],subs=["hardware","binds gadgets to controllers","descriptors, ep0","class logic","frames, protocols","switches functions"],say=[
"The stack, from the bottom.",
"The controller driver, such as d w c three.",
"U D C core, which binds a gadget to a controller.",
"Lib composite, which builds descriptors and answers endpoint zero.",
"Function drivers: U V C, U A C two, H I D, A C M, network, and function F S.",
"User space: the U V C streaming app, adbd, and M T P.",
"And on Android, the USB gadget HAL and init scripts that switch functions."]),
S("code","Lab 06: make_gadget.sh, step by step",code="""G=/sys/kernel/config/usb_gadget/polydemo ; mkdir -p $G ; cd $G
echo 0x1d6b > idVendor ; echo 0x0104 > idProduct
echo 0xEF > bDeviceClass ; echo 0x02 > bDeviceSubClass ; echo 0x01 > bDeviceProtocol
mkdir -p strings/0x409 ; echo "Lab Conference Cam" > strings/0x409/product
mkdir -p configs/c.1 ; echo 500 > configs/c.1/MaxPower
mkdir -p functions/uac2.0 functions/acm.0 functions/hid.0 functions/uvc.0
echo 640 > functions/uvc.0/streaming/uncompressed/u/480p/wWidth
ln -s $G/functions/acm.0 configs/c.1/ ; ln -s $G/functions/hid.0 configs/c.1/
echo dummy_udc.0 > UDC""",hl=[[0],[0],[1],[2],[3],[4],[5],[6],[7],[8]],say=[
"Now the script from lab six.",
"Make a directory under configfs. The kernel creates a gadget object.",
"Write the vendor and product IDs. These demo values belong to the Linux Foundation; real products use the company's own.",
"Set the device class to E F, two, one, meaning composite with interface association descriptors.",
"Add English strings: manufacturer, product, serial.",
"Create configuration one, and declare five hundred milliamps.",
"Create function instances: audio, serial, buttons, and video.",
"Describe the video format, for example six forty by four eighty uncompressed.",
"Link the functions into the configuration. Linking is composing.",
"Finally, write the controller name into U D C. The device pulls D plus up, and the host enumerates."]),
S("bullets","What our QEMU test showed",items=["ACM + HID on dummy_hcd: enumerated","cdc_acm → /dev/ttyACM0","hid-generic → hidraw0","UVC + UAC2: bind fails -EINVAL","Reason: dummy_hcd has no isochronous support"],say=[
"Here's what actually happened when we ran it in QEMU.",
"With serial and buttons, the host enumerated the Lab Conference Cam.",
"The C D C A C M driver created dev tty A C M zero.",
"And the generic H I D driver created a hid raw device.",
"With video and audio included, binding failed with minus twenty two.",
"Because dummy h c d has no isochronous support. That's a real lesson: test isochronous functions on a real controller, with an analyzer."]),
S("bullets","Android and DWC3 debugging",items=["Framework → USB gadget HAL setCurrentUsbFunctions","Vendor .rc / HAL rewrites configfs, rebinds UDC","ADB + MTP via FunctionFS","Type-C HAL reports roles","/sys/kernel/debug/usb/<dwc3>/ + events/dwc3 tracepoints"],say=[
"On Android, the framework calls the USB gadget HAL to change functions.",
"Vendor init scripts or the HAL rewrite configfs, and rebind the controller, which re enumerates the device.",
"A D B and M T P are function F S functions, served by user space daemons.",
"The Type C HAL reports port roles.",
"And to debug d w c three, read its debugfs files, and enable its trace points to see every endpoint zero request."]),
S("recap","Recap",items=["mkdir = create; ln -s = compose; write UDC = plug in","UVC gadget needs a userspace streaming app","dummy_hcd: no isoc; use real UDC for UVC/UAC","Android switches functions via HAL + configfs","dwc3 tracepoints for ep0 debugging"],say=[
"Recap.",
"Make directory creates, link composes, and writing U D C plugs in.",
"A U V C gadget needs a user space streaming app.",
"Dummy h c d can't do isochronous, so use a real controller for video and audio.",
"Android switches functions through the HAL and configfs.",
"And d w c three trace points show every control request."])]),
]
