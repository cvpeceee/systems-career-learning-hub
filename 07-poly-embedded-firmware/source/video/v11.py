from common import *
V=[V("v11-usb-enumeration","Lesson 11 · USB","USB enumeration, packet by packet",[
S("title",sub="From cable plug-in to a working camera",items=["Device states","Every control transfer","Reading host errors"],say=[
"Welcome. In this video we follow a conference camera from the moment its USB cable is plugged in, to the moment the laptop shows a working camera.",
"First a plain analogy, then the key words, then every packet, step by step.",
"At the end, we read real error messages and recap."]),
S("analogy","Plain analogy: a new hire's first morning",items=["Arrive at the front desk (attach)","Wear a visitor badge: address zero","Tell HR your basics (device descriptor)","Get an employee number (SET_ADDRESS)","Hand in your full résumé (configuration)","Get assigned to a team (SET_CONFIGURATION)"],say=[
"Think of enumeration as a new employee's first morning at a company.",
"You walk up to the front desk. That's attaching the cable.",
"Before you have an employee number, you wear a visitor badge. In USB, every new device starts at address zero.",
"HR asks a few basic questions: who are you, and how big are your messages? That's the device descriptor.",
"Then HR gives you a real employee number. That's the SET ADDRESS request.",
"You hand over your full résumé, listing every skill. That's the configuration descriptor.",
"Finally, you're assigned to a team, and work can start. That's SET CONFIGURATION. Now the drivers bind, and the camera appears."]),
S("terms",items=[("Host","The computer side. It starts every transfer; devices only answer."),("Control transfer","A three-part conversation on endpoint zero: setup, optional data, then status."),("SETUP packet","Eight bytes: request type, request number, value, index and length."),("Descriptor","A small table of facts the device reports about itself."),("UDC","USB Device Controller: the hardware and driver that let our board act as a device."),("STALL","The device saying: I can't do that request.")],say=[
"Let's define the words we'll use.",
"The host is the computer side. It starts every single transfer. A device never speaks unless asked.",
"A control transfer is a short conversation on endpoint zero, in up to three stages: a setup stage, an optional data stage, and a status stage.",
"The setup packet is exactly eight bytes. It holds the request type, the request number, a value, an index, and the number of bytes wanted.",
"A descriptor is a small table of facts the device keeps about itself, like its vendor ID or its endpoints.",
"The U D C, or USB device controller, is the hardware and driver that let our board act as a USB device. On many Qualcomm and NXP chips this is the Synopsys D W C 3.",
"And a stall is the device's way of saying: I can't do that request."]),
S("flow","Device states (USB 2.0, chapter 9)",items=["Attached","Powered","Default (address 0)","Address","Configured","Suspended (bus idle > 3 ms)"],subs=["cable in","VBUS 5 V seen","after bus reset","SET_ADDRESS done","SET_CONFIGURATION done","can resume / remote wake"],say=[
"The USB specification, in chapter nine, defines a short list of device states. Let's walk them.",
"Attached: the cable is in.",
"Powered: the device sees five volts on the V bus wire.",
"Default: the host has reset the bus. The device answers only at address zero.",
"Address: the device has been given its own number.",
"Configured: the host picked a configuration, so the data endpoints are now live.",
"And Suspended: if the bus goes idle for more than three milliseconds, the device must drop into low power, and can wake up again later."]),
S("seq","Enumeration, packet by packet",lanes=["Host (xHCI + hub)","Device (UDC + gadget)"],msgs=[(1,0,"attach: device pulls D+ high"),(0,1,"bus reset (SE0 ≥10 ms) + high-speed chirp"),(0,1,"SETUP GET_DESCRIPTOR(DEVICE, 64) @ addr 0"),(1,0,"DATA: 18-byte device descriptor"),(0,1,"status (zero-length OUT)"),(0,1,"SETUP SET_ADDRESS(7)"),(1,0,"status IN (ZLP) → switch to address 7"),(0,1,"GET_DESCRIPTOR(DEVICE, 18) @ addr 7"),(0,1,"GET_DESCRIPTOR(CONFIG, 9)"),(1,0,"9 bytes: wTotalLength = 107"),(0,1,"GET_DESCRIPTOR(CONFIG, 107)"),(1,0,"config + IADs + interfaces + endpoints"),(0,1,"GET_DESCRIPTOR(STRING 0, 1, 2, 3)"),(0,1,"SET_CONFIGURATION(1)"),(1,0,"status → endpoints enabled"),(0,0,"bind uvcvideo, snd-usb-audio, usbhid")],say=[
"Now the main event: every step of enumeration.",
"Step one. When the device is ready, it pulls the D plus data line high through a resistor. The hub notices and tells the host something arrived.",
"Step two. The host resets the bus by holding both data lines low for at least ten milliseconds. During reset, a high speed device does a chirp handshake, so both sides agree to run at four hundred eighty megabits.",
"Step three. The host sends a setup packet to address zero, asking for the device descriptor, and allows up to sixty four bytes.",
"Step four. The device answers with its eighteen byte device descriptor. The most important field right now is b Max Packet Size zero, the largest packet endpoint zero can take.",
"Step five. The host finishes the transfer with a status stage, a zero length packet in the other direction.",
"Step six. The host sends SET ADDRESS, with the value seven.",
"Step seven. Here is a subtle rule. The device must finish the status stage while still at address zero, and only then switch to address seven. Many firmware bugs are about changing the address too early.",
"Step eight. Now the host talks to address seven and reads the full device descriptor again.",
"Step nine. The host asks for only the first nine bytes of the configuration descriptor.",
"Step ten. Why only nine? Because those nine bytes contain w Total Length: the size of the whole configuration, here one hundred seven bytes.",
"Step eleven. Now the host asks for all one hundred seven bytes in one read.",
"Step twelve. The device sends the configuration, followed by interface association descriptors, interfaces, class specific descriptors, and endpoints, all packed together.",
"Step thirteen. The host reads string descriptors: the language list, the manufacturer, the product name, and the serial number.",
"Step fourteen. The host chooses configuration one with SET CONFIGURATION.",
"Step fifteen. The device enables its endpoints and finishes the status stage. It is now in the configured state.",
"Step sixteen. Finally, the host matches the interfaces to drivers: u v c video for the camera, snd usb audio for the microphone and speaker, and u s b h i d for the buttons. The camera now shows up in Teams."]),
S("code","What the device descriptor bytes mean",code="""12        bLength            = 18
01        bDescriptorType    = DEVICE
00 02     bcdUSB             = 2.00
EF 02 01  class/sub/protocol = Misc / IAD composite
40        bMaxPacketSize0    = 64
6B 1D     idVendor           = 0x1d6b
04 01     idProduct          = 0x0104
0C 06     bcdDevice          = 6.12   <- bump when descriptors change!
01 02 03  iManufacturer/iProduct/iSerial (string indexes)
01        bNumConfigurations = 1""",hl=[[0,1],[0,1],[2],[3],[4],[5,6],[7],[8,9]],say=[
"Let's decode the eighteen byte device descriptor, the same one our lab gadget produced.",
"The first two bytes are always the length and the type. Eighteen, and type one for device.",
"b c d USB says which USB version the device follows. Note it's little endian, so zero zero, zero two means two point zero.",
"Class E F, subclass two, protocol one means: look inside, this is a composite device grouped with interface association descriptors. That's how a camera, microphone and buttons share one cable.",
"Sixty four is the maximum packet size for endpoint zero.",
"Then the vendor ID and the product ID, again little endian.",
"b c d Device is the device release number. Windows caches drivers by vendor, product and this number, so bump it whenever your descriptors change.",
"And finally the string indexes, and the number of configurations, here just one."]),
S("code","Reading host-side errors (dmesg)",code="""usb 1-1: new high-speed USB device number 2 using xhci_hcd
usb 1-1: device descriptor read/64, error -71
usb 1-1: device not accepting address 2, error -71
usb 1-1: unable to enumerate USB device

-71  EPROTO     -> signal integrity, PHY tuning, cable, VBUS, slow firmware
-110 ETIMEDOUT  -> device stopped answering
-32  EPIPE      -> STALL: request not supported

$ sudo modprobe usbmon ; sudo tshark -i usbmon1 -Y usb.setup.bRequest""",hl=[[0],[0],[1],[2],[3],[5],[6],[7],[9]],say=[
"When enumeration fails, the host kernel log tells you which step failed. Let's read a typical one.",
"First line: the hub saw a new high speed device and gave it number two.",
"Second line: reading the first sixty four byte device descriptor failed with error minus seventy one. That's step three or four in our diagram.",
"Third line: the device did not accept its address. That's step six or seven.",
"And the host gives up.",
"Minus seventy one means a protocol error. Suspect the electrical side first: the cable, the connector, V bus, PHY tuning, or firmware that pulled D plus up before the controller was ready.",
"Minus one hundred ten is a timeout: the device stopped answering.",
"Minus thirty two means the device stalled, usually because it doesn't support a request.",
"To see the actual packets, load usbmon on the host and capture with Wireshark or tshark. For electrical problems, use a hardware analyzer, because usbmon can't see retries on the wire."]),
S("recap","Recap",items=["Host asks, device answers; everything starts at address 0","Device desc → SET_ADDRESS → config (9 bytes, then wTotalLength) → strings → SET_CONFIGURATION","Switch address only AFTER the status stage","Bump bcdDevice when descriptors change","-71 electrical, -110 timeout, -32 stall; usbmon + analyzer","Try Lab 05 (enumsim) and Lab 06 (real gadget on dummy_hcd)"],say=[
"Let's recap.",
"The host asks and the device answers, and every device starts at address zero.",
"The order is: device descriptor, set address, the first nine bytes of configuration to learn the total length, the full configuration, strings, then set configuration.",
"The device switches to its new address only after the status stage.",
"Bump b c d Device when descriptors change, so Windows doesn't apply a stale cached setup.",
"Minus seventy one is usually electrical, minus one hundred ten is a timeout, and minus thirty two is a stall.",
"Now try lab five, the enumeration simulator, and lab six, which builds a real gadget and watches the host enumerate it. Thanks for watching."])])]
