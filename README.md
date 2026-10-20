# Systems Career Learning Hub — Chandra Vig

Everything built to grow from senior systems engineer (video devices, C++, C drivers) toward staff/principal systems roles, with robotics (Tesla Optimus) as the long-term goal.

## Courses

| Folder | What it is | Covers |
|---|---|---|
| `01-career-plan/` | 8-page PDF plan | Ranked saved jobs, 6–12 month plan |
| `02-learning-hub-v1/` | First interactive hub | Tutorials, animations, 7 pet projects |
| `03-skills-academy/` | Skills Academy v2 | Skills from job alerts, animated sims (Raft, CUDA, KV cache) |
| `04-interactive-tutorial/` | **Main course** (36 chapters, 146 lessons) | Drivers, CUDA, distributed systems, inference, robotics, staff-level role playbooks, plus the Tesla track |
| `05-tesla-track/` | Tesla track on its own | FSD, AI, Optimus, motor control, ROS 2 |
| `06-leetcode-interview-prep/` | **LeetCode-style interview prep** | 107 coding problems + 25 system design questions with timer/hints/rubrics, C#/Java/C++ solutions (all tested), animated walkthroughs, call-stack execution visualizer (C++, plus Java/C# for many), 31 narrated concept videos, 18 company pages, mock interviews |
| `07-poly-embedded-firmware/` | **Poly on-the-job academy (Linux/Android + USB firmware)** | 20 lessons with animations/quizzes, 13 hands-on labs (kernel modules, configfs USB gadget, V4L2, USB descriptor parser, A/B updates; most verified in QEMU), 30/60/90 + 12-month growth plan |
| `source/` | Build files for the main course | Rebuild instructions in its README |
| `screenshots/` | Preview pictures | One or two per course |

## How to open
Download the `.html` file and open it in Chrome (desktop or phone). Previewing it inside GitHub or a phone file viewer shows raw code instead of the course. The learning hub (`02`), the interview prep (`06`) and the Poly academy (`07`) need their whole folder; open `index.html`.

## Recommended order
1. Read the career plan PDF.
2. Work through `04-interactive-tutorial/Improved_Interactive_Tutorial_with_Tesla_Track.html` (it already includes the Tesla track).
3. Use `03` and `02` for extra sims and pet projects.
4. For the current Poly job: `07-poly-embedded-firmware/index.html` and its `LEARNING_PLAN.md`.
5. Practice interviews in `06-leetcode-interview-prep/index.html` (attempt first, then reveal).

## Note
The main tutorial started from a tutorial Chandra supplied. That original file isn't included here; this repo holds only the improved versions.

## Udemy watch list (exact sections, ~30 h must-watch)

Full details, optional sections and skip list: [`07-poly-embedded-firmware/UDEMY_PICKS.md`](07-poly-embedded-firmware/UDEMY_PICKS.md)

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
