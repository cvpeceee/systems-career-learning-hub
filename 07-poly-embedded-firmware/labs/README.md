# Labs

Run on a Linux PC (tested on Debian 13). Userspace labs need `gcc make`. Kernel labs need headers for your running kernel; safest is the QEMU harness in `00-qemu-harness/` (needs `linux-image` + `linux-headers` of the same version, `qemu-system-x86`, `busybox-static`, `kmod`, `cpio`, `xz-utils`).

| Lab | Topic | Status on our box |
|---|---|---|
| 00 | QEMU harness: runs 01/02/03/04/06/07 in a VM | Verified |
| 01 | Misc char device + sysfs + ioctl | Verified in QEMU |
| 02 | Platform driver + DT overlay | Builds/loads; probe needs DT hardware (not verified) |
| 03 | Top/bottom half (timer as IRQ) + workqueue | Verified in QEMU |
| 04 | USB descriptor parser | Verified (sanitizers + real gadget descriptors) |
| 05 | USB enumeration state machine | Verified |
| 06 | configfs composite gadget (UVC+UAC2+ACM+HID) | ACM+HID verified on dummy_hcd; UVC/UAC2 need a real UDC (dummy_hcd has no isoc) |
| 07 | V4L2 mmap capture | Verified against vivid in QEMU |
| 08 | Lock-free ISR→task ring | Verified (ASan/UBSan/TSan) |
| 09 | Firmware image verify + A/B rollback | Verified |
| 10 | RTOS priority inversion/inheritance sim | Verified |
| 11 | Android AIDL HAL + init.rc + SELinux templates | Not verified (needs AOSP tree) |
| 12 | Oops decoding exercise | Exercise (illustrative sample) |

Each lab's commands and expected output are also shown inside `index.html` → Labs.
