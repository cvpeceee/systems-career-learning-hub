import json,sys
import os;H=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,H)
from lessons4 import L
LABS=[
("00-qemu-harness","Run all kernel labs safely inside QEMU","./run_all_in_qemu.sh","Boots your distro kernel in QEMU with a tiny busybox initramfs and runs labs 01/02/03/04/06/07 inside it. A crash kills only the VM.","=== LAB01 polychar\nhello-poly\n=== LAB07 vivid\nframe  4 seq=4 bytes=614400 dt=200.1ms\nOK\n=== LAB06 gadget\nbound: /sys/bus/usb/drivers/cdc_acm/1-1:1.0\nbound: /sys/bus/usb/drivers/usbhid/1-1:1.2\n=== DONE","VERIFIED (Debian 13, kernel 6.12.113, QEMU TCG)"),
("01-chardev-sysfs","Misc char device + sysfs + ioctl","make\nsudo insmod polychar.ko   # better: inside the QEMU harness\necho hello-poly > /dev/polychar\ncat /dev/polychar\ncat /sys/class/misc/polychar/writes\nsudo rmmod polychar","Implements read/write/ioctl with a mutex, a read-only sysfs counter, auto /dev node via miscdevice.","hello-poly\n1","VERIFIED in QEMU (built with 0 warnings)"),
("02-platform-dt","Platform driver matched from a DT overlay","make\ndtc -@ -I dts -O dtb -o polyplat.dtbo polyplat-overlay.dts\n# on an arm64 board/QEMU virt with overlays: apply dtbo, then\nsudo insmod polyplat.ko ; dmesg | grep polyplat","probe() reads poly,lanes and an optional reset GPIO with devm_ helpers and dev_err_probe.","polyplat polybridge: probed: lanes=2 reset=yes   (expected on DT hardware)","PARTIAL: module builds + loads in QEMU x86; overlay compiles with dtc; probe() not exercised (x86 has no DT)"),
("03-irq-workqueue","Top half / bottom half with a timer as fake IRQ","make\nsudo insmod polyirq.ko ; sleep 2 ; sudo rmmod polyirq\ndmesg | grep polyirq","Atomic-context handler defers to a workqueue; correct teardown order.","polyirq: bottom half drained 1 events (total 1)\npolyirq: bottom half drained 1 events (total 2)\npolyirq: bottom half drained 1 events (total 3)","VERIFIED in QEMU"),
("04-usb-descriptor-parser","Parse USB descriptors like lsusb -v","make && ./usbdesc\n# real device:\nsudo cat /sys/bus/usb/devices/1-1/descriptors > d.bin ; ./usbdesc d.bin","Walks device/config/IAD/interface/endpoint descriptors, decodes isoc mult bits, validates lengths.","CONFIG  wTotalLength=99 bNumInterfaces=4 ...\n  IAD   first=0 count=2 class=Video(UVC)\n    EP 0x81 IN  Isochronous maxpkt=1024 mult=3 interval=1\nOK: parsed 99 bytes","VERIFIED (ASan/UBSan) + on real gadget descriptors in QEMU"),
("05-usb-enum-sim","Enumeration state machine","make && ./enumsim\n./enumsim fail-address","Host/device ch9 sequence with a SET_ADDRESS failure and reset/retry path.","device: DEFAULT -> ADDRESS ...\ndevice: ADDRESS -> CONFIGURED (endpoints enabled; class drivers may bind)","VERIFIED (ASan/UBSan)"),
("06-configfs-uvc-uac-gadget","Composite gadget with configfs + dummy_hcd","sudo FUNCS=\"acm.0 hid.0\" ./make_gadget.sh   # on dummy_hcd\nsudo ./make_gadget.sh                     # real UDC: uvc.0 uac2.0 acm.0\nsudo ./teardown.sh","Builds UVC (YUY2 640x480@30), UAC2 48 kHz stereo, ACM serial and a HID telephony-style report.","usb 1-1: Product: Lab Conference Cam\ncdc_acm 1-1:1.0: ttyACM0: USB ACM device\nhid-generic ...: USB HID v1.01 Device [Lab Corp Lab Conference Cam]","PARTIAL: ACM+HID VERIFIED in QEMU on dummy_hcd; UVC/UAC2 bind fails on dummy_hcd (-EINVAL, no isoc) -> needs real UDC; teardown.sh syntax-checked only"),
("07-v4l2-capture","V4L2 mmap streaming capture","make\nsudo modprobe vivid\n./v4l2cap /dev/video0 30","The QUERYCAP/S_FMT/REQBUFS/QBUF/DQBUF loop every camera stack uses.","driver=vivid card=vivid\nformat 640x480 fourcc=YUYV sizeimage=614400\nframe  0 seq=0 bytes=614400 ...\nOK","VERIFIED against vivid in QEMU; also cross-compiles for arm64"),
("08-isr-ring-buffer","Lock-free SPSC ring (ISR→task)","make && ./ring\ngcc -fsanitize=thread -pthread -o ring_tsan ring.c && ./ring_tsan","Acquire/release ring, 2M items, checks order.","OK 2000000 items in order, no loss","VERIFIED (ASan/UBSan + TSan clean)"),
("09-dfu-ab-image","Firmware image verify + A/B rollback","make && ./fwimg","CRC32, magic/size checks, anti-rollback, boot-try fallback.","crc32(\"123456789\")=0xCBF43926\n  reject: CRC mismatch (corrupt download)\n  bootloader falls back to A\n  reject: rollback v4 < v5\nRESULT active=A","VERIFIED (ASan/UBSan)"),
("10-rtos-scheduler-sim","Priority inversion & inheritance","make && ./sched","Tick scheduler with a mutex; compares HIGH-task latency.","WITHOUT inheritance: ... HIGH finished at tick 11\nWITH    inheritance: ... HIGH finished at tick 5","VERIFIED (ASan/UBSan)"),
("11-android-hal-init-sepolicy","AIDL vendor HAL + init.rc + SELinux","# inside an AOSP tree (device/vendor dir):\nm vendor.poly.usbcam-update-api\nm vendor.poly.usbcam-V1-ndk\n# flash, then: adb shell service list | grep usbcam","Templates: IUsbCamControl.aidl, Android.bp, .rc fragment, .te policy, file_contexts.","(on device) vendor.poly.usbcam.IUsbCamControl/default: [...]","NOT VERIFIED: needs an AOSP checkout (~300 GB). Templates only; service implementation is an exercise"),
("12-oops-decoding","Decode a kernel oops","Read sample_oops.txt, then answer the lesson questions.\n./scripts/faddr2line yourmodule.ko func+0x3c   # on a real build","Annotated NULL-deref oops from a workqueue.","pc : polybridge_hpd_work+0x3c/0x120 [polybridge]","Exercise (sample oops is illustrative, written for this lab)"),
]
VIDS=["v01-roles-decoded","v02-embedded-cpp","v03-driver-model","v04-device-tree","v05-irq-dma","v06-boot-chain","v07-yocto-bsp","v08-v4l2-alsa","v09-codecs-hdmi","v10-usb-fundamentals","v11-usb-enumeration","v12-usb-classes","v13-usb-gadget","v14-usb-debug-typec","v15-android-platform","v16-rtos-tinyusb","v17-debugging-oops","v18-power-net-security","v19-ota-testing","v20-senior-staff"]
import json as _j
DUR={}
try: DUR=_j.load(open(os.path.join(H,"..","videos","durations.json")))
except Exception: pass
for l,v in zip(L,VIDS): l["video"]=v; l["vdur"]=DUR.get(v,0)
data={"lessons":L,"labs":[dict(id=a,t=b,cmd=c,what=d,exp=e,status=f) for a,b,c,d,e,f in LABS]}
html=open(os.path.join(H,'template.html')).read().replace('/*DATA*/',json.dumps(data).replace('</','<\\/'))
open(os.path.join(H,'..','index.html'),'w').write(html)
print(len(L),"lessons",len(LABS),"labs",len(html),"bytes")

# ---- glossary: Words to know + tap-to-expand chips at first use + Glossary tab
import re as _re
from glossary import G as _G, BY as _BY
def _chipify(html,seen,lesson_terms):
    parts=_re.split(r'(<[^>]+>)',html); out=[]; skip=0
    for part in parts:
        if part.startswith('<'):
            tg=_re.match(r'</?\s*(\w+)',part); n=tg.group(1).lower() if tg else ''
            if n in('code','pre','a','button') : skip+= -1 if part.startswith('</') else 1
            out.append(part); continue
        if skip>0 or not part.strip(): out.append(part); continue
        while True:
            best=None
            for g in _G:
                if g['k'] in seen: continue
                m=g['_rx'].search(part)
                if m and (best is None or m.start()<best[0].start()): best=(m,g)
            if not best: break
            m,g=best; seen.add(g['k']); lesson_terms.append(g['k'])
            out.append(part[:m.start()]+'<span class="chip" tabindex="0" data-k="%s">%s</span>'%(g['k'],m.group(0))); part=part[m.end():]
        out.append(part)
    return ''.join(out)
for i,l in enumerate(L):
    seen=set(); terms=[]
    l['an']=_chipify(l['an'],seen,terms); l['d']=_chipify(l['d'],seen,terms)
    rest=' '.join([a+' '+b for a,b in l['j']]+[a+' '+b for a,b in l['q']]+[str(l['anim'])])
    for pos,k in sorted((g['_rx'].search(rest).start(),g['k']) for g in _G if g['k'] not in seen and g['_rx'].search(rest)): seen.add(k); terms.append(k)
    l['terms']=terms
    gl={_BY[k]['t'].split(' ')[0].lower() for k in terms}
    l['j']=[[a,b] for a,b in l['j'] if a.split(' ')[0].lower() not in gl]
data['lessons']=L
data['glossary']=[dict(k=g['k'],t=g['t'],m=g['mean'],a=g['ana'],ls=[i for i,l in enumerate(L) if g['k'] in l['terms']]) for g in _G]
html=open(os.path.join(H,'template.html')).read().replace('/*DATA*/',json.dumps(data).replace('</','<\\/'))
open(os.path.join(H,'..','index.html'),'w').write(html)
print(len(L),"lessons",len(LABS),"labs",len(html),"bytes", sum(len(l['terms']) for l in L),"term uses", len([g for g in data['glossary'] if g['ls']]),"glossary terms used")
