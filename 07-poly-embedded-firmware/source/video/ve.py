from common import *
V=[
V("v09-codecs-hdmi","Lesson 9 · Media","Video codecs, SVC and HDMI",[
S("title",sub="Compressing meetings and moving pixels",items=["I, P and B frames","SVC layers","HDMI hot-plug and EDID"],say=[
"This video covers video compression for meetings, scalable video coding, and the HDMI path you already know from Lontium bridges."]),
S("analogy","Plain analogy: describing a scene over the phone",items=["Send one full picture (I-frame)","Then describe only what moved (P-frames)","Layers: the gist first, details after (SVC)","A slow listener stops after the first layer"],say=[
"Imagine describing a movie scene over the phone.",
"First you describe the whole picture once. That's an I frame.",
"After that you only describe what moved. Those are P frames.",
"Now describe in layers: the gist first, then extra detail. That's scalable video coding.",
"A listener on a bad line can stop after the first layer, and still follow the story."]),
S("terms",items=[("I / P / B frame","Self-contained / predicted from past / from past and future."),("GOP","Group of pictures between I-frames."),("IDR","An I-frame that resets all references: safe join point."),("SVC","Layered stream: temporal, spatial, quality."),("EDID / HPD","Display capabilities / hot-plug detect pin.")],say=[
"Words.",
"An I frame stands alone. A P frame is predicted from earlier frames. A B frame uses earlier and later frames, which adds delay.",
"A GOP, or group of pictures, is the run of frames between I frames.",
"An I D R frame is a special I frame that resets all references. A new participant can start decoding there.",
"S V C sends temporal, spatial or quality layers.",
"E D I D is the data a display reports about itself, and H P D is the hot plug detect pin."]),
S("flow","SVC temporal layers in a meeting",items=["Encoder makes layer T0 (7.5 fps)","Layer T1 adds frames (15 fps)","Layer T2 adds frames (30 fps)","SFU server receives all layers","Good link: forward T0+T1+T2","Weak link: forward T0 only"],subs=["base, every 4th frame","depends on T0","depends on T0/T1","selective forwarding unit","30 fps","7.5 fps, still smooth"],say=[
"Here's how temporal layers work in a meeting.",
"The encoder makes a base layer, T zero, at seven and a half frames per second.",
"Layer T one adds frames in between, for fifteen.",
"Layer T two adds the rest, for thirty.",
"A selective forwarding server receives all layers.",
"For a participant on a good link, it forwards everything.",
"For a weak link, it forwards only the base layer. No re encoding, and nobody freezes. Your firmware must expose these layer controls and keep timestamps exact."]),
S("bullets","Encoder tuning for real-time",items=["No B-frames (they add latency)","CBR/VBR rate control matched to the network","IDR on request (PLI/FIR) when someone joins","Slices for packet-loss resilience","Measure glass-to-glass latency per stage"],say=[
"Tuning an encoder for real time conferencing.",
"Turn off B frames, because they add delay.",
"Match rate control to the network.",
"Send an I D R on request, when a participant joins or loses packets, instead of waiting seconds for the next periodic I frame.",
"Use slices, so one lost packet only damages part of a frame.",
"And measure glass to glass latency, stage by stage."]),
S("seq","HDMI-in: laptop plugged into the room bar",lanes=["Laptop (source)","Bridge (e.g. Lontium)","V4L2 driver","Capture app"],msgs=[(1,0,"HPD high, EDID over DDC"),(0,0,"choose mode from EDID"),(0,1,"TMDS video 1080p60"),(1,2,"IRQ: signal locked"),(2,3,"V4L2_EVENT_SOURCE_CHANGE"),(3,2,"QUERY_DV_TIMINGS → S_DV_TIMINGS"),(3,2,"restart streaming")],say=[
"Now HDMI input, when someone connects a laptop to share a screen.",
"The bridge raises hot plug detect, and the laptop reads the E D I D over the D D C wires, which are I two C.",
"The laptop picks a mode it likes from the E D I D.",
"It starts sending video, say ten eighty p sixty.",
"The bridge locks to the signal and raises an interrupt.",
"The driver sends a source change event to user space.",
"The app queries the new timings and applies them.",
"And restarts streaming. Forgetting any of these steps is why screen share sometimes needs a replug."]),
S("bullets","Classic HDMI bugs",items=["EDID not re-read after hot-plug","HPD not debounced","Pixel clock beyond bridge limits","RGB limited vs full range → washed out","HDCP failures on certain TVs"],say=[
"Classic HDMI bugs to recognize.",
"The E D I D isn't re read after hot plug.",
"H P D isn't debounced, so glitches look like replugs.",
"A pixel clock beyond what the bridge supports.",
"Limited versus full RGB range, which makes the image look washed out.",
"And content protection failures with certain TVs."]),
S("recap","Recap",items=["I-frame once, then deltas","IDR on demand for joins","SVC lets servers drop layers","No B-frames for real-time","HDMI: HPD → EDID → timings → restart"],say=[
"Recap.",
"An I frame once, then only changes.",
"Send I D R on demand when people join.",
"S V C lets servers drop layers instead of freezing.",
"No B frames for real time.",
"And for HDMI: hot plug, E D I D, timings, restart."])]),

V("v10-usb-fundamentals","Lesson 10 · USB","USB fundamentals: transfers, endpoints, descriptors",[
S("title",sub="The rules of the strict classroom",items=["Speeds and microframes","Four transfer types","Bandwidth math"],say=[
"This video lays the foundation of USB: speeds, endpoints, the four transfer types, descriptors, and the bandwidth math that decides your camera formats."]),
S("analogy","Plain analogy: a strict classroom",items=["Teacher = host: nobody speaks unless asked","Numbered mailboxes = endpoints","Paperwork = control","Big parcels = bulk","Urgent notes, on a schedule = interrupt","Live radio = isochronous"],say=[
"USB is a strict classroom.",
"The host is the teacher. No student speaks unless asked.",
"Each device has numbered mailboxes, called endpoints.",
"Control transfers are paperwork, like registration.",
"Bulk transfers are big parcels that can wait.",
"Interrupt transfers are small urgent notes, checked on a fixed schedule.",
"And isochronous transfers are a live radio broadcast: if a piece arrives late, it's as useless as lost."]),
S("terms",items=[("Endpoint","Numbered pipe, IN to host or OUT. EP0 is control."),("Interface","One function, e.g. video streaming, with alt settings."),("Alt setting","Variant of an interface; alt 0 reserves no bandwidth."),("Microframe","125 µs slot in high-speed USB; 8 per millisecond."),("wMaxPacketSize","Bytes per transaction plus extra transactions per microframe.")],say=[
"Words.",
"An endpoint is a numbered pipe, either IN toward the host, or OUT from it. Endpoint zero is always the control endpoint.",
"An interface is one function of the device, like video streaming.",
"An alternate setting is a variant of an interface. Alt zero reserves no bandwidth; higher alts reserve more.",
"A microframe is a one hundred twenty five microsecond time slot in high speed USB. There are eight per millisecond.",
"And w Max Packet Size encodes the bytes per transaction, plus how many extra transactions fit in each microframe."]),
S("bullets","Speeds",items=["Low 1.5 Mb/s, Full 12 Mb/s","High 480 Mb/s (USB 2.0)","SuperSpeed 5 Gb/s (USB 3)","SuperSpeed+ 10 / 20 Gb/s","USB 3 adds separate wires + companion descriptors"],say=[
"Speeds.",
"Low speed is one and a half megabits, full speed is twelve.",
"High speed, the fastest USB two, is four hundred eighty.",
"SuperSpeed, USB three, is five gigabits.",
"SuperSpeed plus is ten or twenty.",
"USB three adds separate wires, and companion descriptors for bursts."]),
S("seq","One high-speed microframe (125 µs)",lanes=["Host","Isoc EP (video)","Interrupt EP (HID)","Bulk EP (serial)"],msgs=[(0,1,"IN → 1024 B"),(0,1,"IN → 1024 B"),(0,1,"IN → 1024 B (mult = 3)"),(0,2,"IN (interval due) → NAK or data"),(0,3,"IN → bulk uses leftover time"),(0,0,"next microframe begins")],say=[
"Let's watch one microframe.",
"The host asks the video endpoint for data, and receives up to ten twenty four bytes.",
"Because this endpoint declared a multiplier, the host asks again in the same microframe.",
"And a third time. That's three transactions, reserved every microframe.",
"Next, the button endpoint's polling interval is due. The device sends a report, or says NAK: nothing new.",
"Bulk gets whatever time is left, which is why bulk has no timing guarantee.",
"And the next microframe starts."]),
S("code","Bandwidth math",code="""wMaxPacketSize = 0x1400
  bits 0..10  = 0x400 = 1024 bytes
  bits 11..12 = 2  -> 3 transactions per microframe
1024 B x 3 x 8000 microframes/s = 24.6 MB/s  (~196 Mb/s)

1080p30 YUY2 = 1920 x 1080 x 2 B x 30 = 124 MB/s   -> does NOT fit
1080p30 MJPEG ~ 5-15 MB/s                         -> fits
720p30 NV12  = 1280 x 720 x 1.5 x 30 = 41 MB/s     -> needs USB 3""",hl=[[0],[1],[2],[3],[5],[6],[7]],say=[
"Now the math that decides your camera's formats.",
"This endpoint's packet size field is hex fourteen hundred. The low eleven bits are hex four hundred: ten twenty four bytes.",
"Bits eleven and twelve are two, meaning three transactions per microframe.",
"Ten twenty four, times three, times eight thousand microframes per second, is about twenty four and a half megabytes per second. That's the maximum for one high speed isochronous endpoint.",
"Uncompressed ten eighty p thirty in YUY2 needs one hundred twenty four megabytes per second. It doesn't fit.",
"Compressed M J P E G does fit. That's why USB two webcams send M J P E G at ten eighty p.",
"And even seven twenty p uncompressed needs USB three."]),
S("recap","Recap",items=["Host asks; device answers","Control, bulk, interrupt, isochronous","Alt 0 = no bandwidth; higher alts reserve it","HS isoc max ≈ 24.6 MB/s per endpoint","Lab 04 decodes all of this"],say=[
"Recap.",
"The host asks, the device answers.",
"Four transfer types: control, bulk, interrupt, isochronous.",
"Alt zero reserves no bandwidth; higher alts reserve it.",
"One high speed isochronous endpoint tops out near twenty four and a half megabytes per second.",
"And lab four parses these descriptors, including the multiplier bits."])]),
]
