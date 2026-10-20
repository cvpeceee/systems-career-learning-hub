#!/bin/sh
mount -t proc p /proc; mount -t sysfs s /sys; mount -t devtmpfs d /dev; mount -t configfs c /sys/kernel/config 2>/dev/null
M=/lib/modules/$(cat /proc/sys/kernel/osrelease)
for m in $(cat /lab/mods); do insmod $M/$m 2>/dev/null; done
mount -t configfs c /sys/kernel/config 2>/dev/null

echo; echo "=== LAB01 polychar"; insmod /lab/polychar.ko; echo hello-poly > /dev/polychar; cat /dev/polychar; cat /sys/class/misc/polychar/writes
echo "=== LAB02 polyplat insmod"; insmod /lab/polyplat.ko && echo loaded-ok
echo "=== LAB03 polyirq"; insmod /lab/polyirq.ko; sleep 2; rmmod polyirq; dmesg | grep polyirq | tail -3
echo "=== LAB07 vivid"; ls /dev/video*; /lab/v4l2cap /dev/video0 5
echo "=== LAB06 gadget"; FUNCS="acm.0 hid.0" sh /lab/make_gadget.sh 2>&1 | grep -v '^modprobe'
sleep 2
for d in /sys/bus/usb/devices/*; do [ -f $d/idProduct ] && echo "$(basename $d) $(cat $d/idVendor):$(cat $d/idProduct) $(cat $d/product 2>/dev/null)"; done
for x in /sys/bus/usb/drivers/*/*:1.*; do echo "bound: $x"; done
for d in /sys/bus/usb/devices/*; do [ "$(cat $d/idProduct 2>/dev/null)" = "0104" ] && cat $d/descriptors > /tmp/d.bin; done
echo "=== LAB04 parse REAL gadget descriptors"; /lab/usbdesc /tmp/d.bin | grep -vE 'class-specific' 
echo "=== DONE"; poweroff -f
