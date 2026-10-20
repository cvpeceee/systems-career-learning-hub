# Learning and growth plan: Poly embedded firmware (Linux/Android + USB)

**Analogy:** the first 90 days are like learning a new city. First the main roads (build, flash, debug one bug), then a neighborhood you own (a subsystem), then you start giving directions to others (standards, mentoring). Months 4–12 are about changing how the whole city works (staff-level impact).

Course: open `index.html` in Chrome. Lesson numbers below refer to it.

## Weekly cadence (about 5–6 focused hours outside tickets)
| Day | Block | What |
|---|---|---|
| Mon | 45 min | One lesson: analogy, depth, quiz without notes |
| Tue | 60 min | The lesson's lab; write what surprised you |
| Wed | 30 min | Read real code in your product tree for the same topic (e.g. our dwc3/UVC path) |
| Thu | 60 min | Apply it at work: a small fix, a test, or a debug note |
| Fri | 30 min | Brag doc + one-paragraph team note/wiki update |
| Monthly | 60 min | Teach a 20-min deep dive to the team |

## Days 1–30: learn the house
**Lessons 1–6, Labs 00–05**
- Week 1: build, flash, boot every product variant yourself. Write down missing steps in the wiki (first visible contribution).
- Week 2: draw the product's stack: boot chain, partitions (A/B?), kernel version + vendor BSP release, USB topology (device port functions, host ports, Type-C/PD controller), camera/audio pipelines.
- Week 3: get UART + adb/ssh + JTAG (if available) working on your desk; capture a full boot log and a usbmon capture of the device enumerating on Windows, macOS and Linux.
- Week 4: fix 2–3 small bugs end to end with regression tests.
- People: USB, camera/ISP, audio, Android platform, QA/HIL leads; vendor FAEs (Qualcomm/NXP/Ambarella/Lontium) and how tickets are filed.

**Milestone:** you can explain, on a whiteboard, what happens from power-on to "camera visible in Teams on a laptop."

## Days 31–60: own a slice
**Lessons 7–14, Labs 06–07**
- Pick one area to own. For the USB role, the natural one is the device-mode path: DWC3 → composite gadget → UVC/UAC2/HID → userspace streaming → Android USB HAL.
- Capture enumeration + streaming on a hardware analyzer; write "How our USB works" (descriptors, interface numbering rules, bcdDevice policy, known host quirks).
- Add one automated test: enumerate-N-times on a 3-OS host matrix, or `v4l2-compliance` and UVC start-time measurement in CI.
- Start a debugging playbook (symptom → first checks), seeded with lessons 11, 14, 17.

**Milestone:** you're the person others ask about your slice, and one test runs automatically.

## Days 61–90: raise the bar
**Lessons 15–20, Labs 08–12**
- Write one design doc (context, options, trade-offs, rollout, test plan). Candidates: faster time-to-first-frame, accessory MCU A/B updates, a composite-descriptor standard, SELinux cleanup for the USB HAL.
- Run your first team deep dive (e.g. "USB enumeration failures, decoded").
- Agree 2 measurable goals with your manager for months 4–12.

**Milestone:** design doc reviewed, deep dive delivered, goals agreed.

## Months 4–12: toward staff
- Own cross-product architecture for your area; lead one feature from design to field telemetry.
- Remove a class of bugs team-wide through tooling, a CI rule or a standard (e.g. descriptor validation in CI using the Lab 04 parser idea).
- Lead vendor escalations with crisp repro packages; track them.
- Mentor 1–2 engineers; review with teaching comments.
- Optional, with approval: 1–3 upstream kernel patches (fixes in dwc3/uvc gadget/your bridge driver).
- Learn adjacent areas listed as pluses: H.264/H.265/SVC tuning, Wi-Fi/BT bring-up, security (secure boot, fuzzing USB inputs).

## How to show impact
- Use numbers: frame-drop %, enumeration success rate, time-to-first-frame, update failure rate, build/rebase time, time-to-root-cause.
- Keep a weekly brag doc: problem → what you did → measurable result → who benefited.
- Share a short monthly update with your manager tied to their goals.
- Turn each hard bug into: root-cause note + regression test + checklist item.

## Self-check at 90 days
- [ ] Can trace a USB problem from analyzer capture to the line of driver code.
- [ ] Can add a function to the composite gadget and handle Windows driver caching.
- [ ] Can write/modify an AIDL HAL with correct SELinux policy.
- [ ] Can decode an oops and bisect a regression.
- [ ] Own one subsystem's docs, tests and roadmap.
