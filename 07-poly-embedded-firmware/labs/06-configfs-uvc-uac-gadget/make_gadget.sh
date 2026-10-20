#!/bin/bash
# Build a composite USB gadget (UVC camera + UAC2 mic/speaker + ACM serial console) with configfs,
# bound to dummy_hcd so a plain Linux PC acts as BOTH device and host (no hardware).
# Analogy: configfs is a LEGO baseplate; each "function" is a brick; binding to a UDC plugs it in.
# Run as root on a test VM (NOT your work laptop). Requires: CONFIG_USB_DUMMY_HCD=m, CONFIG_USB_CONFIGFS_*=y/m.
set -euo pipefail
# FUNCS: which functions to link. dummy_hcd has NO isochronous support, so UVC/UAC2 (isoc) fail to bind
# there with -EINVAL. On dummy_hcd use FUNCS="acm.0 hid.0"; on real hardware (DWC3/ChipIdea UDC) use the full set.
FUNCS=${FUNCS:-"uvc.0 uac2.0 acm.0"}
modprobe dummy_hcd
modprobe libcomposite
G=/sys/kernel/config/usb_gadget/polydemo
mkdir -p $G && cd $G
echo 0x1d6b > idVendor   # Linux Foundation (demo only; real products use the company VID)
echo 0x0104 > idProduct  # Multifunction Composite Gadget
echo 0x0200 > bcdUSB
echo 0xEF > bDeviceClass; echo 0x02 > bDeviceSubClass; echo 0x01 > bDeviceProtocol  # IAD composite
mkdir -p strings/0x409
echo "LAB0001" > strings/0x409/serialnumber
echo "Lab Corp" > strings/0x409/manufacturer
echo "Lab Conference Cam" > strings/0x409/product
mkdir -p configs/c.1/strings/0x409
echo "UVC+UAC2+ACM" > configs/c.1/strings/0x409/configuration
echo 500 > configs/c.1/MaxPower

# --- UAC2 (audio) ---
mkdir -p functions/uac2.0
echo 48000 > functions/uac2.0/c_srate; echo 3 > functions/uac2.0/c_chmask
echo 48000 > functions/uac2.0/p_srate; echo 3 > functions/uac2.0/p_chmask

# --- ACM serial (debug console) ---
mkdir -p functions/acm.0

# --- HID (mute/volume buttons): 1-byte consumer-control report ---
mkdir -p functions/hid.0
echo 0 > functions/hid.0/protocol; echo 0 > functions/hid.0/subclass; echo 1 > functions/hid.0/report_length
printf '\x05\x0c\x09\x01\xa1\x01\x15\x00\x25\x01\x75\x01\x95\x03\x09\xe2\x09\xe9\x09\xea\x81\x02\x95\x05\x81\x03\xc0' > functions/hid.0/report_desc

# --- UVC (video): one uncompressed YUY2 640x480 format ---
U=$G/functions/uvc.0; mkdir -p $U
mkdir -p $U/streaming/uncompressed/u/480p
F=$U/streaming/uncompressed/u/480p
echo 640 > $F/wWidth; echo 480 > $F/wHeight
echo 333333 > $F/dwDefaultFrameInterval   # 100ns units -> 30 fps
echo 333333 > $F/dwFrameInterval
echo $((640*480*2)) > $F/dwMaxVideoFrameBufferSize
mkdir -p $U/streaming/header/h
ln -s $U/streaming/uncompressed/u $U/streaming/header/h/u
for s in fs hs ss; do ln -s $U/streaming/header/h $U/streaming/class/$s/h; done
mkdir -p $U/control/header/h
ln -s $U/control/header/h $U/control/class/fs/h
ln -s $U/control/header/h $U/control/class/ss/h
echo 1024 > $U/streaming_maxpacket

for f in $FUNCS; do ln -s $G/functions/$f configs/c.1/; done
UDC=$(ls /sys/class/udc | head -1)
echo "binding to UDC: $UDC"
echo "$UDC" > UDC
sleep 1
echo "--- host side view ---"
lsusb | grep -i 1d6b:0104 || true
dmesg | tail -15
echo "Now try: v4l2-ctl --list-devices ; arecord -l ; ls /dev/ttyACM*"
echo "UVC needs a userspace app (e.g. uvc-gadget) to answer streaming requests; see README."
