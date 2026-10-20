# Skill map from the two Poly/HP postings

Fetched 2026-10-20 from the Greenhouse API (`boards-api.greenhouse.io/v1/boards/hp/jobs/<id>`). Full text: `posting-*.txt` in this folder.

| | Linux/Android Embedded Firmware Developer (6228640004) | Senior Embedded USB Firmware Developer (6228641004) |
|---|---|---|
| Location | Austin | Austin |
| Experience | 5+ yrs embedded software | 10+ yrs software, strong embedded focus |
| Platform | Android- and/or Linux-based video conferencing devices | Android-based video conferencing devices |
| Must-have | Embedded C/C++, firmware dev + debugging | Same, plus **in-depth, hands-on knowledge of the full USB software stack** |
| Plus | Networking/Wi-Fi, Security, USB, H.264/H.265/SVC, HDMI, Bluetooth | Network & security protocols, USB stack development, Bluetooth, Wi-Fi, H.264/H.265/SVC |
| Preferred | Android internals and Linux | Android internals and Linux |
| Salary listed | $110,000–$150,000 | $116,000–$182,000 |

Shared responsibilities: design/develop firmware; build platform capabilities **below the framework layer**; lead secure, scalable, high-performance embedded C/C++; define architecture/standards/best practices cross-functionally; troubleshoot complex system-level issues; planning, documentation, testing strategy; mentor junior engineers; agile/lean continuous improvement.

## Requirement → lessons → labs

| Requirement | Lessons (index.html) | Labs |
|---|---|---|
| Embedded C/C++ (secure, high-performance) | 2 C/C++ craft, 18 security | 08 |
| Firmware below the framework (Linux) | 3 driver model, 4 DT/I2C/SPI/GPIO, 5 IRQ/DMA, 6 boot, 7 Yocto/BSP | 00–03 |
| Android internals | 15 AOSP/Treble/HAL/init/SELinux/GKI | 11 |
| Full USB software stack | 10 fundamentals, 11 enumeration, 12 classes, 13 gadget/configfs/FunctionFS/Android USB HAL, 14 host/Type-C/PD/DFU/debugging, 16 TinyUSB | 04, 05, 06, 09 |
| Video encode/decode, HDMI | 8 V4L2/ALSA, 9 codecs/SVC/HDMI | 07 |
| Networking/Wi-Fi/BT, Security | 18 power/network/security, 6 secure boot, 19 OTA | 09 |
| Troubleshooting system-level issues | 17 debugging toolbox, 14 USB debugging | 12 |
| Testing strategy, planning, docs | 19 OTA/testing/CI | 00 |
| Mentoring, architecture, agile/lean | 20 senior/staff growth, LEARNING_PLAN.md | – |

Context used (from earlier conversations): Chandra works at Poly on video conferencing devices with C++ codebases and C vendor drivers (NXP, Lontium HDMI bridges, Qualcomm, Ambarella). No other personal facts are assumed.
