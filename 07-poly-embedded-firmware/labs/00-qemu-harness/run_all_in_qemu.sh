#!/bin/bash
# Boots your distro kernel in QEMU with a tiny busybox initramfs and runs labs 01,02,03,04,06,07
# inside it (insmod is safe there: a crash only kills the VM). Tested on Debian 13, kernel 6.12.113+deb13-amd64.
# Needs: linux-image + linux-headers for the SAME version, qemu-system-x86, busybox-static, kmod, xz-utils, cpio.
set -euo pipefail
K=${K:-$(ls /lib/modules | sort -V | tail -1)}
HERE=$(cd "$(dirname "$0")" && pwd); L=$HERE/..; I=$(mktemp -d)
for d in 01-chardev-sysfs 02-platform-dt 03-irq-workqueue; do make -C $L/$d KDIR=/lib/modules/$K/build; done
mkdir -p $I/{bin,proc,sys,dev,tmp,lab,lib/modules/$K}
cp /bin/busybox $I/bin/; for a in sh mount insmod rmmod ls cat echo mkdir ln sleep dmesg grep head poweroff find rmdir tr printf; do ln -s busybox $I/bin/$a; done
for m in configfs dummy_hcd libcomposite usb_f_uvc usb_f_uac2 usb_f_acm usb_f_hid vivid uvcvideo snd_usb_audio cdc_acm usbhid hid_generic; do
  /sbin/modprobe -S $K --show-depends $m; done | awk '$1=="insmod"{print $2}' | awk '!s[$0]++' | while read p; do
  b=$(basename $p .xz); case $p in *.xz) xz -dc $p > $I/lib/modules/$K/$b;; *) cp $p $I/lib/modules/$K/;; esac; echo $b >> $I/lab/mods; done
cp $L/0[123]*/*.ko $I/lab/
gcc -static -O2 -o $I/lab/v4l2cap $L/07-v4l2-capture/v4l2cap.c
gcc -static -O2 -o $I/lab/usbdesc $L/04-usb-descriptor-parser/usbdesc.c
sed 's/^modprobe .*/true/; s/^lsusb.*/true/' $L/06-configfs-uvc-uac-gadget/make_gadget.sh > $I/lab/make_gadget.sh
cp $HERE/init.sh $I/init; chmod +x $I/init
(cd $I && find . | cpio -o -H newc 2>/dev/null | gzip) > /tmp/lab.cpio.gz
# NOTE: on our box -enable-kvm hung; plain TCG emulation took ~10 s. Add -enable-kvm if yours works.
sudo qemu-system-x86_64 -m 1024 -nographic -no-reboot -kernel /boot/vmlinuz-$K -initrd /tmp/lab.cpio.gz \
  -append "console=ttyS0 loglevel=4" | tr -d '\r' | tee qemu_run.log
