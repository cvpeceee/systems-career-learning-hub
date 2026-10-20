# 07 · Poly Embedded Firmware Academy (Linux/Android + USB)

On-the-job learning plan and hands-on course for the two Poly/HP roles:
- **Linux/Android Embedded Firmware Developer – Poly** (Greenhouse job 6228640004)
- **Senior Embedded USB Firmware Developer – Poly** (Greenhouse job 6228641004)

## Open it
Download this folder and open `index.html` in Chrome (phone or laptop). GitHub's preview and phone file viewers show raw code.

## What's inside
| Path | What |
|---|---|
| `index.html` | 20 lessons: plain analogy first, jargon defined, full depth, animated diagram, tap-to-reveal quiz, linked lab; plus Labs, Plan and a random quiz mix. Progress is saved in the browser. |
| `UDEMY_PICKS.md` | Exact Udemy sections (~30 h must-watch) mapped to lessons and the 30/60/90 phases |
| `LEARNING_PLAN.md` | 30/60/90 days + months 4–12 toward staff, weekly cadence, milestones, how to show impact |
| `docs/SKILL_MAP.md` | Both postings decoded into skills, mapped to lessons/labs |
| `docs/posting-*.txt` | Posting text as fetched 2026-10-20 |
| `videos/` | 20 narrated videos (one per lesson, 854×480, burned-in captions + .vtt), embedded in each lesson and in the Videos tab |
| `labs/` | 13 runnable labs (kernel modules, USB gadget, V4L2, USB descriptor parser, enumeration sim, ISR ring, A/B update, RTOS sim, Android HAL templates, oops decoding) |
| `TEST_RESULTS.txt` | What was built/run and what is unverified |
| `source/` | Generator for index.html (`python3 build.py`); `source/video/` = video scripts + renderer |

## Lessons
1 Roles decoded · 2 Embedded C/C++ craft · 3 Linux driver model · 4 Device Tree, I2C/SPI/GPIO · 5 IRQs, workqueues, DMA, locking · 6 Boot chain & secure boot · 7 Yocto/Buildroot & vendor BSPs · 8 V4L2 & ALSA · 9 Codecs (H.264/H.265/SVC) & HDMI · 10 USB fundamentals · 11 Enumeration · 12 UVC/UAC/HID/CDC · 13 Linux USB gadget & Android USB HAL · 14 Host side, Type-C/PD, DFU, USB debugging · 15 Android below the framework · 16 MCU/RTOS & TinyUSB · 17 Debugging toolbox · 18 Power, networking, Wi-Fi/BT, security · 19 OTA & firmware testing/CI · 20 Growing to senior/staff

## Videos (20, total 73 min)
| File | Length |
|---|---|
| v01-roles-decoded.mp4 | 4:27 |
| v02-embedded-cpp.mp4 | 3:55 |
| v03-driver-model.mp4 | 3:45 |
| v04-device-tree.mp4 | 3:42 |
| v05-irq-dma.mp4 | 3:50 |
| v06-boot-chain.mp4 | 3:18 |
| v07-yocto-bsp.mp4 | 3:13 |
| v08-v4l2-alsa.mp4 | 3:21 |
| v09-codecs-hdmi.mp4 | 3:23 |
| v10-usb-fundamentals.mp4 | 3:21 |
| v11-usb-enumeration.mp4 | 7:31 |
| v12-usb-classes.mp4 | 3:34 |
| v13-usb-gadget.mp4 | 4:00 |
| v14-usb-debug-typec.mp4 | 3:39 |
| v15-android-platform.mp4 | 3:15 |
| v16-rtos-tinyusb.mp4 | 3:10 |
| v17-debugging-oops.mp4 | 3:15 |
| v18-power-net-security.mp4 | 3:01 |
| v19-ota-testing.mp4 | 3:03 |
| v20-senior-staff.mp4 | 2:42 |

Rebuild: `cd source/video && python3 render.py ../../videos va vb vc vd ve v11 vf vg vh` (needs Piper + the en_US-lessac-medium voice, ffmpeg, Pillow).

## Udemy watch list (exact sections, ~30 h must-watch)

Full details, optional sections and skip list: [`UDEMY_PICKS.md`](UDEMY_PICKS.md)

| Phase | Course | Watch these sections | Time |
|---|---|---|---|
| Days 1–30 | [Linux Device Driver Programming With Beaglebone Black](https://www.udemy.com/course/linux-device-driver-programming-using-beaglebone-black/) (FastBit) | Platform bus/devices/drivers; Device tree; Device tree nodes and platform driver; Linux device driver model | ~6.9 h |
| Days 1–30 | [Embedded Linux Step by Step Using Beaglebone Black](https://www.udemy.com/course/embedded-linux-step-by-step-using-beaglebone/) (FastBit) | Beaglebone Linux booting Process | ~1.8 h |
| Days 1–30 | [Embedded USB Programming on STM32](https://www.udemy.com/course/embedded-usb-programming-on-stm32/) (FastBit) | USB Protocol Concepts; Enumeration, Descriptors, and First Detection; USB Physical and Electrical Layer | ~4.9 h |
| Days 31–60 | [USB Behind the Scenes: Hands-on HID Firmware Development](https://www.udemy.com/course/usb-behind-the-scenes-hands-on-hid-firmware-development/) | USB Device Framework | ~4.5 h |
| Days 31–60 | [Interrupts and Bottom Halves in Linux Kernel](https://www.udemy.com/course/interrupts-and-bottom-halves-in-deep/) | Enabling and Disabling Interrupts; Threaded IRQs; Workqueues | ~1.5 h |
| Days 31–60 | [Embedded Linux Using Yocto Part 2](https://www.udemy.com/course/embedded-linux-using-yocto-part-2/) | Operators; Layers; Writing Recipes; Recipes for git projects | ~2.5 h |
| Days 61–90 | [Visual Embedded Android (AOSP)](https://www.udemy.com/course/embedded-android-training/) | Native C++ Service; Tour Through Android Source and Partitions; Going Forward | ~2.9 h |
| Days 61–90 | [Android 14 Internals – Cuttlefish](https://www.udemy.com/course/android-internals/) | Images and partitions; Labs 1–4 (AIDL HAL, daemon, SELinux, registration); Security basics | ~0.8 h |
| Days 61–90 | [Linux Debug Training (Part-2)](https://www.udemy.com/course/linux-debug-training-part-2/) | Module 7 Kernel Debugging; Module 5 Ftrace, trace-cmd, KernelShark, Perf lectures | ~3 h |
| Days 61–90 | [Mastering RTOS: Hands on FreeRTOS and STM32Fx](https://www.udemy.com/course/mastering-rtos-hands-on-with-freertos-arduino-and-stm32fx/) (FastBit) | RTOS Introduction; FreeRTOS and ARM Cortex-M details; FreeRTOS Scheduler | ~1 h |

Not covered well on Udemy (use kernel docs, Bootlin slides, USB-IF specs and this course's videos/labs): V4L2/ALSA, codecs/HDMI, UVC/UAC depth, Linux USB gadget/configfs, USB-C/PD.
