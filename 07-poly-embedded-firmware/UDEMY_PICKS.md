# Udemy picks: exact sections to watch for the Poly roles

**Analogy:** don't eat the whole buffet. Each pick below is one plate: a single section from a course, chosen because it covers a lesson in this academy that's worth seeing done on real hardware.

- **Source:** every course, instructor, section title and section length below was read from the public Udemy course page on 2026-10-20 (US Central). Udemy edits courses, so check lengths before you start.
- **Unverified items** are labeled **UNVERIFIED**.
- **Lesson numbers** refer to `index.html`.
- **Phases** refer to `LEARNING_PLAN.md`.
- **Budget:** ~29.6 h must-watch, plus ~10 h optional, spread over 90 days (~2.5 h/week).
- **Speed:** watch at 1.25–1.5×. Where a section is setup on a hobby board (BeagleBone, STM32, Tinkerboard), watch for the concept and do the matching lab here instead.

## Days 1–30: learn the house (~13.5 h must)

### 1. Linux Device Driver Programming With Beaglebone Black (LDD1)
FastBit Embedded Brain Academy, Kiran Nayak. https://www.udemy.com/course/linux-device-driver-programming-using-beaglebone-black/ (14 sections, 21h 52m total)

| Priority | Section (as titled on Udemy) | Length | Maps to |
|---|---|---|---|
| MUST | Platform bus, Platform devices and Platform drivers | 2h 39m | L3 driver model (probe, devm_*), Lab 02 |
| MUST | Device tree | 1h 26m | L4 device tree, compatible, bindings |
| MUST | Device tree nodes and platform driver | 1h 16m | L4 + Lab 02 (of_match_table, DT properties in probe) |
| MUST | Linux device driver model | 1h 32m | L3 (kobjects, sysfs attributes, attribute groups), Lab 01 |
| optional | Device tree overlays | 54m | L4 overlays + L6 applying overlays from U-Boot |
| optional | Character device and driver | 2h 5m | L3/Lab 01, only if char drivers feel rusty |
| SKIP | Host and target setup; Linux kernel module; Char driver with multiple device nodes | – | You already build modules; BBB board setup isn't needed |

### 2. Embedded Linux Step by Step Using Beaglebone Black
FastBit Embedded Brain Academy, Kiran Nayak. https://www.udemy.com/course/embedded-linux-step-by-step-using-beaglebone/ (22 sections, 15h 49m total)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | Beaglebone Linux booting Process | 1h 46m | L6 boot chain: ROM → SPL/MLO → U-Boot → kernel → init |
| optional | uEnv.txt and Initramfs | 56m | L6 U-Boot env/bootargs |
| optional | Booting BBB Over TFTP protocol | 22m | L6 fast bring-up loops |
| SKIP | BBB intro, VirtualBox Ubuntu-16, eMMC update, LED/LCD/sensor projects | – | Hobby-board specific |

### 3. Embedded USB Programming on STM32: Build Real USB Devices
FastBit Embedded Brain Academy, Kiran Nayak. https://www.udemy.com/course/embedded-usb-programming-on-stm32/ (4 sections, 5h 58m when checked)

The page says this course is still under development, with new videos added weekly. Recheck it at day 60 for class and composite content.

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | USB Protocol Concepts | 1h 34m | L10 transfer types, packets, endpoints, Wireshark capture |
| MUST | Enumeration, Descriptors, and First Detection | 1h 37m | L11 enumeration, setup packets, descriptors, Labs 04/05 |
| MUST | USB Physical and Electrical Layer | 1h 42m | L11/L14: why `-71` errors happen (pull-ups, J/K/SE0, VBUS, clock accuracy) |
| optional | USB from Scratch: What and Why | 1h 6m | L10 intro; skim |

## Days 31–60: own a slice (~8.4 h must)

### 4. USB Behind the Scenes: Hands-on HID Firmware Development
Mohammed Noureldin. https://www.udemy.com/course/usb-behind-the-scenes-hands-on-hid-firmware-development/ (11 sections, 14h 29m total)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | USB Device Framework | 4h 28m | L11/L13: a device-side ep0 state machine written from scratch (SET_ADDRESS timing, config "combination", wTotalLength). This is what DWC3 + libcomposite do for you. |
| optional | USB Mouse | 1h 58m | L12 HID report descriptors; includes "Changing descriptors order (Windows compatibility)" |
| optional | USB Protocol | 2h 11m | Overlaps pick 3; take it only if you want a second explanation |
| SKIP | Configuring the Clock; Preparing the Workspace; USB Device Driver – Initialization/Polling Loop | – | STM32F4 register-level setup |

### 5. Interrupts and Bottom Halves in Linux Kernel
Linux Trainer. https://www.udemy.com/course/interrupts-and-bottom-halves-in-deep/ (10 sections, 5h 5m total)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | Enabling and Disabling Interrupts | 33m | L5 interrupt context, disable_irq, no sleeping in ISRs |
| MUST | Threaded IRQs | 17m | L5 threaded IRQ + IRQF_ONESHOT (the HDMI hot-plug pattern) |
| MUST | Workqueues | 37m | L5 / Lab 03: queue, cancel, flush, delayed work |
| optional | Own Workqueues | 43m | Dedicated/ordered workqueues for driver design |
| SKIP | Introduction (x86 PIC/APIC); Softirqs; Tasklets | – | x86-centric; tasklets are being phased out of new code |

### 6. Embedded Linux Using Yocto Part 2
Linux Trainer. https://www.udemy.com/course/embedded-linux-using-yocto-part-2/ (11 sections, 4h 55m total)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | Operators | 41m | L7: `?=`, `:append` and override syntax; read vendor layers correctly |
| MUST | Layers | 20m | L7 meta-company layer |
| MUST | Writing Recipes | 42m | L7 recipes, WORKDIR, S/D variables |
| MUST | Recipes for git projects | 48m | L7 SRCREV, branches, **patching source of recipe / create and apply patch** (your BSP patch series) |
| optional | Image Features | 28m | debug-tweaks vs production, read-only rootfs (L18 security) |
| optional | Logging | 25m | Debugging failed builds |

## Days 61–90: raise the bar (~7.7 h must)

### 7. Visual Embedded Android (AOSP) with Drawings and Practice
Mustafa Ozcelikors. https://www.udemy.com/course/embedded-android-training/ (11 sections, 7h 30m total)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | Understanding and Creating Native C++ Service | 1h 35m | L15 + Lab 11: AIDL service, init script, VINTF manifest, SELinux for the service |
| MUST | A Tour Through Android Source and Partitions | 29m | L15 partitions |
| MUST | Going Forward | 49m | L15/L19: fixing system-wide issues, CTS/VTS, ADB debugging commands |
| optional | Embedded Android Architecture | 56m | L15 big picture (Android vs Linux, boot) |
| optional | Exploring ASUS Tinkerboard 2 directories and sources | 31m | Where board config, rc files, DT and kernel configs live in a BSP tree |
| SKIP | Customizing Android Framework (launcher, wallpaper, night mode) | – | Above your layer |

### 8. Android 14 Internals – customize Cuttlefish in the cloud
Guy Levin. https://www.udemy.com/course/android-internals/ (14 sections, 1h 29m total)

The page lists 14 sections, but only those below were visible. The description says the remaining labs cover crash debugging with llvm-addr2line and lldb.

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | Images and partitions | 14m | L15 GSI, dynamic partitions, super.img, A/B, fastbootd (also L19) |
| MUST | Lab 1: AIDL for HAL – creating a CPU HAL Interface Definition | 8m | Lab 11 aidl_interface |
| MUST | Lab 2: Creating the service daemon | 5m | Lab 11 rc + VINTF |
| MUST | Lab 3: Setting correct SELinux permissions | 5m | L15 avc denials |
| MUST | Lab 4: Create and register the CPU service implementation | 5m | Lab 11 service registration |
| MUST | Security basics | 9m | L15/L18 DAC vs SELinux |
| optional | Set up / Download and build Cuttlefish sections | ~28m | Only if you want a cloud AOSP sandbox |

### 9. Linux Debug Training (Part-2)
Manas Marawaha, John O'Sullivan. https://www.udemy.com/course/linux-debug-training-part-2/ (5 sections, 6h 13m total)

| Priority | Section / lectures | Length | Maps to |
|---|---|---|---|
| MUST | Module 7 – Linux Kernel Debugging (whole section) | 2h 31m | L17: dynamic debug, oops analysis (GDB/addr2line/objdump), kdump, lockdep, KCSAN, KASAN, UBSAN, KGDB; Lab 12 |
| MUST | Module 5, these lectures only: Ftrace (8:44), trace-cmd (9:12), Kernel Shark (4:25), Perf event tracing (7:52) | ~30m | L17 ftrace/perf recipes |
| optional | Rest of Module 5 – Tracing in Linux (eBPF, LTTng, uprobes) | ~1h 15m | Advanced tracing |
| SKIP | Module 6 – Profiling (Massif, Heaptrack, Callgrind) | – | App-level profiling; lower priority for drivers |

### 10. Mastering RTOS: Hands on FreeRTOS and STM32Fx with Debugging
FastBit Embedded Brain Academy, Kiran Nayak. https://www.udemy.com/course/mastering-rtos-hands-on-with-freertos-arduino-and-stm32fx/ (27 sections, 14h 2m total; only the first ~10 sections were visible)

| Priority | Section | Length | Maps to |
|---|---|---|---|
| MUST | RTOS Introduction | 30m | L16, including "RTOS vs GPOS : Priority inversion" (Lab 10) |
| MUST | FreeRTOS and ARM Cortex Mx Arch. Specific details | 20m | L16 tick/SysTick/PendSV |
| MUST | FreeRTOS Scheduler | 9m | L16 |
| optional | Trace tool integration | 1h 7m | SEGGER SystemView; useful if your accessories run FreeRTOS |

## Must-watch total
LDD1 6h 53m + Boot 1h 46m + FastBit USB 4h 53m + USB Behind the Scenes 4h 28m + Interrupts 1h 27m + Yocto 2h 31m + Visual Android 2h 53m + Android 14 Internals 46m + Debug Part-2 ~3h 1m + RTOS 59m = **~29.6 h**

## Gaps: no verified Udemy match (use the free sources and this academy)
| Topic (lesson) | Use instead |
|---|---|
| V4L2 / media controller / ALSA-ASoC (L8) | Video 08 + Lab 07; kernel docs `Documentation/userspace-api/media/v4l/`; Bootlin's free embedded Linux / audio slides |
| UVC / UAC classes in depth (L12) | Video 12; USB-IF UVC 1.5 and UAC 2.0 specs; Linux `drivers/usb/gadget/function/uvc_*.c` |
| Linux USB gadget, configfs, FunctionFS, DWC3 (L13) | Video 13 + Lab 06; kernel `Documentation/usb/gadget_configfs.rst`, `functionfs.rst` |
| Type-C / PD (L14) | Video 14; kernel `Documentation/driver-api/usb/typec.rst` |
| H.264/H.265/SVC tuning, HDMI bridges (L9) | Video 09; your vendor (Qualcomm/Ambarella/Lontium) encoder and bridge docs |
| **UNVERIFIED:** "Debugging Linux Kernel in Deep – Part 1" (ftrace) by Linux Trainer | Only seen via Class Central, not on the Udemy page; optional alternative to pick 9 Module 5 |

## How to use these with the plan
1. Watch the section, then close it and do the matching lab or lesson quiz from memory.
2. Write one paragraph in your notes: "how this applies to our product."
3. Don't buy hobby boards. Skip the board-setup parts and use QEMU (Lab 00) or your work hardware with your team's approval.
