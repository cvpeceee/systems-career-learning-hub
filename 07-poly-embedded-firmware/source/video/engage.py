"""Makes every video less lecture-like: a story hook after the title, a pause-and-think question before the recap,
and a NEW WORD card (spoken meaning + analogy) the first time each glossary term is heard in that video."""
import re
from common import S
from glossary import G, BY, find
def speak(t):
    t=t.replace('I2C','I two C').replace('H.265','H two sixty five').replace('H.264','H two sixty four').replace('U-Boot','U boot').replace('e.g.','for example')
    for g in G:
        tok=g['t'].split(' ')[0]
        if re.fullmatch(r'[A-Z][A-Z0-9]{1,5}',tok) and tok not in ('USB',): t=re.sub(r'\b'+tok+r'\b',g['say'],t)
    return t
H={
'v01-roles-decoded':(dict(t="A Monday morning at Poly",items=[('laptop','Laptop in the meeting room'),('cable','One USB-C cable'),('bar','The video bar'),('screen','Zoom shows a camera, mic and speaker')],say=["Picture this. A sales team walks into a meeting room, plugs one USB C cable from the video bar into a laptop, and opens Zoom.","The laptop has never seen this bar before.","Yet within two seconds, Zoom lists a new camera, a new microphone and a new speaker, and the mute button on the bar works.","Nobody installed a driver. In this video we open the box and follow that magic, piece by piece, because that path is exactly your job."]),
  ("When the bar shows up in Zoom with no driver install, which two standard USB languages make the camera and the microphone work?","The USB Video Class makes it a webcam, and the USB Audio Class makes it a microphone and speaker. Every laptop already speaks both.")),
'v02-embedded-cpp':(dict(t="The code review",items=[('doc','Your first patch'),('person','A senior reviewer'),('bug','One hidden bug')],say=["Your first patch at a new team goes up for review.","A senior reviewer leaves one comment: this allocates memory in the camera's frame callback.","It worked on your desk, but in the field it causes a stutter every few minutes. Let's learn the habits that catch this before review."]),
  ("Why is calling new or malloc inside a per-frame callback risky on a device?","It can take an unpredictable amount of time and fragment memory, so frames can miss their deadline. Allocate once up front and reuse buffers.")),
'v03-driver-model':(dict(t="The bridge that never woke up",items=[('chip','HDMI bridge chip'),('doc','Board description'),('gear','Driver')],say=["A new board arrives. The HDMI bridge chip is soldered on, the driver is compiled in, but the screen stays black.","dmesg shows nothing at all from the driver.","Was it never matched to the hardware? Let's see how Linux pairs a device with its driver."]),
  ("A driver is built in but its probe function never runs. Name two things to check first.","Check that the device was actually created, for example in the device tree with the right compatible string, and that the driver's match table contains that same string.")),
'v04-device-tree':(dict(t="Same driver, new board",items=[('board','Board revision A'),('board','Board revision B'),('chip','Same chip, different pins')],say=["Hardware moves the HDMI bridge's reset line to a different pin on board revision B.","Do you change the driver code? No.","You change one line in a text file that describes the board. That file is the device tree, and this video shows how it works."]),
  ("The reset pin moved on a new board revision. Where should the change go, and why?","In the board's device tree, not the driver. The driver reads the pin from the description, so one driver serves every board.")),
'v05-irq-dma':(dict(t="The button that froze the video",items=[('bolt','Button press'),('chip','Processor'),('clock','Video frame deadline')],say=["A user presses mute on the bar, and the video freezes for a split second.","The interrupt handler for the button was reading a chip over a slow bus while everything else waited.","Let's learn how to split interrupt work so the fast part stays fast."]),
  ("Why can't you read an I2C chip directly inside the top-half interrupt handler?","The top half runs with interrupts blocked and must never sleep, but an I2C transfer can sleep and is slow. Defer it to a threaded interrupt or a workqueue.")),
'v06-boot-chain':(dict(t="Power on to picture",items=[('bolt','Power button'),('chip','Chip ROM'),('lock','Signature checks'),('screen','First picture')],say=["Press the power button on the bar. About fifteen seconds later the screen shows the meeting room.","In between, five different programs run, each checking the next one's signature.","If any check fails, the bar refuses to boot.","Only when every check passes does the first picture appear. Let's walk the chain."]),
  ("If an attacker replaces the kernel on the flash, what stops it from running with secure boot?","The bootloader checks the kernel's signature against a trusted key before running it, and the bootloader itself was checked by the stage before. The fake kernel fails the check.")),
'v07-yocto-bsp':(dict(t="The two-thousand-patch kernel",items=[('box','Vendor kit'),('doc','2,000 patches'),('gear','Your product build')],say=["The chip vendor sends a new kit with a kernel carrying two thousand patches.","Your product has its own fifty patches on top of the old kit.","How do you move without breaking everything? That's what build systems and good layering are for."]),
  ("Why put your product changes in your own layer instead of editing the vendor's files?","So a new vendor release can be dropped in and your changes reapplied cleanly, and it's always clear which changes are yours.")),
'v08-v4l2-alsa':(dict(t="Camera on, but green",items=[('eye','Image sensor'),('chip','Image processor'),('screen','Green picture')],say=["The camera starts streaming, but every frame is bright green.","The sensor, the image processor and the app each thought the pixels were packed a different way.","Let's follow a frame from sensor to app, and a sound from microphone to speaker."]),
  ("Frames arrive but the picture is green. What is the first thing to compare between the sensor and the app?","The pixel format and size each side agreed on. A mismatch, such as one packing format on one side and another on the other, gives wrong colors.")),
'v09-codecs-hdmi':(dict(t="Video on a bad network",items=[('cloud','Shaky hotel Wi-Fi'),('person','Remote participant'),('wave','Video stream')],say=["One participant joins from shaky hotel Wi-Fi.","Without care, everyone's video would drop to their level, or their screen would freeze.","Modern conferencing sends video in layers so each person gets what their network can take."]),
  ("Why do video streams send a complete picture every so often instead of only changes?","Because a receiver that joins late or loses packets needs a complete picture to start from; changes alone can't be decoded.")),
'v10-usb-fundamentals':(dict(t="One cable, four jobs",items=[('wave','Video'),('mic','Sound'),('bolt','Buttons'),('box','Firmware update')],say=["One USB cable carries live video, two-way sound, button presses and, sometimes, a firmware update, all at the same time.","How does USB keep them from tripping over each other?","With different transfer types and separate mailboxes.","Even a firmware update can share the cable during a call without hurting the video. Let's see how."]),
  ("Live video uses a transfer type with no retries. Why is that the right choice?","For live video, a late frame is useless. It's better to skip a damaged packet and keep the timing than to stop and resend.")),
'v12-usb-classes':(dict(t="No driver install",items=[('laptop','Windows'),('laptop','Mac'),('laptop','Linux'),('bar','Same bar')],say=["The same bar works on Windows, Mac and Linux without installing anything.","That's not luck. The bar speaks languages every operating system already understands.","Same bar, same firmware, three different laptops.","Let's meet those standard languages, called classes."]),
  ("Why does the call-control button use the human interface class rather than a custom protocol?","Because every operating system and meeting app already understands that class, so the button works everywhere with no driver.")),
'v13-usb-gadget':(dict(t="Building a webcam from folders",items=[('doc','Make folders'),('gear','Link functions'),('bar','Bind to controller'),('laptop','Laptop sees a webcam')],say=["What if I told you that you can turn a Linux board into a webcam by creating a few folders and writing a few words into files?","That's literally how it works on our bars.","Then you hand the finished setup to the controller.","And the laptop sees a webcam. Let's build one, step by step."]),
  ("Your gadget works on the bench but the laptop sees nothing after a firmware update. What two things would you check?","That the gadget was bound to the device controller after setup, and that the descriptors changed together with a bumped device version so the laptop doesn't use stale cached ones.")),
'v14-usb-debug-typec':(dict(t="Works on Windows, fails on Mac",items=[('laptop','Windows: works'),('laptop','Mac: fails'),('chart','Packet capture')],say=["A customer escalation: the bar works on Windows laptops but drops off a particular Mac after ten minutes.","Guessing won't fix it. Capturing the actual packets will.","This video is your USB debugging toolbox, plus the Type C rules about who powers whom."]),
  ("The device disappears after exactly ten minutes on one laptop. Name one likely area and one tool to confirm it.","Power management, such as the link going to sleep or the port suspending. Confirm with a USB packet capture and the kernel log at the moment it drops.")),
'v15-android-platform':(dict(t="The update that broke the camera",items=[('cloud','Android system update'),('lock','Vendor partition'),('bar','Camera stops')],say=["An Android system update ships, and suddenly the camera service on the bar can't open the camera.","The system part and the vendor part disagreed about their interface.","Let's see how Android keeps those two halves stable."]),
  ("Why does Android require the vendor part to talk to the system through fixed interfaces?","So Google's system part and the device maker's hardware part can be updated separately without breaking each other.")),
'v16-rtos-tinyusb':(dict(t="The tiny chip in the microphone pod",items=[('mic','Extension mic pod'),('chip','Small microcontroller'),('clock','Strict deadlines')],say=["The extension microphone pod on the table has no Linux at all.","It runs a tiny chip with a scheduler that must answer within microseconds.","Let's look inside that smaller world."]),
  ("A high-priority task waits on a lock held by a low-priority task. What goes wrong, and what is the fix?","A medium task can keep the low one from running, so the high one waits too long. That is priority inversion. Priority inheritance lends the low task the high priority while it holds the lock.")),
'v17-debugging-oops':(dict(t="Crash at 3 a.m.",items=[('bug','Field crash'),('doc','Crash log'),('person','You, the next morning')],say=["Overnight, a bar in a customer's office reboots, and the log shows a wall of hexadecimal.","Most engineers scroll past it. You'll read it like a map.","Let's decode a kernel crash and meet the tools that find the cause."]),
  ("A crash log says the program counter was at polybridge_hpd_work plus 0x3c. What do you do with that?","Use the matching build's symbols, for example with faddr2line, to turn that offset into the exact source file and line.")),
'v18-power-net-security':(dict(t="Warm bar, choppy call",items=[('bolt','Power'),('wave','Network'),('lock','Security')],say=["A bar runs warm and a call gets choppy when someone starts a big file download on the same network.","Power, networking and security all touch that one moment.","Let's tour each quickly."]),
  ("Live audio stutters when someone downloads a big file on the same network. What network feature helps?","Quality of service marking, so audio and video packets get priority over bulk download traffic.")),
'v19-ota-testing':(dict(t="Ten thousand bars updating tonight",items=[('cloud','Update server'),('bar','10,000 bars'),('lock','Rollback safety')],say=["Tonight ten thousand bars in customer offices will install new firmware.","If one in a thousand fails to boot, that's ten angry customers by morning.","Let's see how updates and tests make that number zero."]),
  ("The new firmware fails to boot on one bar. What should happen automatically?","The bootloader counts failed boot attempts and switches back to the previous, known-good copy of the system.")),
'v20-senior-staff':(dict(t="From fixing bugs to raising the bar",items=[('bug','Fix one bug'),('doc','Write the standard'),('person','Mentor the team')],say=["A junior engineer fixes a bug. A senior engineer fixes the class of bug.","A staff engineer makes sure the whole team never ships it again.","Let's turn that into weekly habits."]),
  ("You fixed a tricky USB descriptor bug. What would turn that fix into senior-level impact?","Add a test that catches it automatically, write the rule into the team's descriptor checklist, and share the debugging story in a short team session.")),
'v11-usb-enumeration':(dict(t="Two seconds after plug-in",items=[('cable','Plug in'),('laptop','Laptop asks'),('bar','Bar answers'),('gear','Drivers load')],say=["Plug in the bar, and within two seconds about a dozen small questions and answers fly over the cable.","If any one of them is wrong, the device never appears.","When all of them succeed, the laptop loads its drivers and the camera appears.","Let's watch every one."]),
  ("After SET ADDRESS, when must the device switch to its new address?","Only after it finishes the status stage of that request at the old address zero. Switching earlier is a classic firmware bug.")),
}
BASIC={'kernel','driver','firmware','framework','userspace','module','probe','endpoint','descriptor','enum','composite','bulk','bootloader','codec','dtb','init','oops','ftrace','spinlock','sysfs','yuv','pm','wifi'}
def enhance(v):
    hk=H.get(v['id']); sc=list(v['scenes'])
    if hk and not any(x['k']=='hook' for x in sc):
        h,(q,a)=hk; hs=S('hook',h['t'],say=h['say'],items=h['items'],chain=True)
        sc.insert(1,hs)
        ri=next((i for i,x in enumerate(sc) if x['k']=='recap'),len(sc))
        sc.insert(ri,S('ask','Your turn',q=q,a=a,say=[dict(s='Question for you: '+q,sp=speak('Question for you. '+q)),dict(pause=5),dict(s='Answer: '+a,sp=speak('Here is the answer. '+a))]))
    defined=set(); out=[]
    for x in sc:
        x=dict(x); ns=[]
        for e in x['say']:
            ns.append(e)
            if isinstance(e,dict) and ('pause' in e or 'card' in e): continue
            text=e if isinstance(e,str) else e['s']
            if isinstance(e,dict) and e.get('nocard'): continue
            for pos,k in find(text,'_sx'):
                if k in defined: continue
                defined.add(k); g=BY[k]
                mean_full=g['mean'].split(':')[0] if ':' in g['mean'][:60] else None
                inline=(isinstance(e,dict) and k in e.get('defines',())) or (mean_full and mean_full.lower() in text.lower()) or (g['full'] and g['full'].lower() in text.lower()) or bool(re.match(r'^\S*(?:\s\S+){0,3}?,? (?:is|are|means|or)\b',text[pos:pos+40]))
                short=g['mean'].split(': ',1)[1] if ': ' in g['mean'][:60] else g['mean']
                if k in BASIC:
                    ns.append(dict(s=f"{g['t']}: {g['mean']} Like: {g['ana']}",sp=speak(f"Quick word: {g['say']}. {short}"),card=k,newcard=True,gap=0.25,ls='1.0'))
                elif inline:
                    ns.append(dict(s=f"{g['t']}: {g['mean']} Like: {g['ana']}",sp=speak(f"{g['say']}: picture {g['ana'][0].lower()+g['ana'][1:]}"),card=k,newcard=True,gap=0.3,ls='0.97'))
                else:
                    ns.append(dict(s=f"{g['t']}: {g['mean']} Like: {g['ana']}",sp=speak(f"{g['say']}. {g['mean']} Like: {g['ana']}"),card=k,newcard=True,gap=0.3,ls='0.97'))
        x['say']=ns; out.append(x)
    v=dict(v); v['scenes']=out; v['_terms']=sorted(defined); return v
