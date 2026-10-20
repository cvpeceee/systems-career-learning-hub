#!/bin/bash
# Undo in reverse order: unbind, unlink functions, rmdir. (configfs refuses rm -rf.)
G=/sys/kernel/config/usb_gadget/polydemo
cd $G || exit 0
echo "" > UDC || true
rm -f configs/c.1/uvc.0 configs/c.1/uac2.0 configs/c.1/acm.0 configs/c.1/hid.0
find functions/uvc.0 -type l -delete 2>/dev/null
rmdir functions/uvc.0/streaming/header/h functions/uvc.0/control/header/h 2>/dev/null
rmdir functions/uvc.0/streaming/uncompressed/u/480p functions/uvc.0/streaming/uncompressed/u 2>/dev/null
rmdir functions/* configs/c.1/strings/0x409 configs/c.1 strings/0x409 2>/dev/null
cd .. && rmdir polydemo && echo removed
