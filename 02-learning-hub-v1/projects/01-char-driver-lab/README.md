# P1 — Virtual Char Driver Lab

**Maps to:** Months 1–3 · SoC/drivers depth  
**Goal:** Internalize open/read/write/ioctl → file_operations → “hardware” without needing a board on day 1.

## Skills
- Char-device mental model, ioctl control plane vs data plane
- IRQ → thread wake simulation, ring buffer producer/consumer
- Later: real out-of-tree module stubs + Makefile

## Path A — Userspace mock (start here)
```bash
cd userspace_mock
c++ -std=c++17 -O2 -pthread -o vdev_sim main.cpp virtual_device.cpp
./vdev_sim
```
Exercise: open device, write a command, read response, trigger fake IRQs, call ioctl for status.

## Path B — Kernel stub (when you have QEMU/VM)
See `kernel_stub/` — hello/scull-style stubs + Makefile. Build only inside a kernel-dev VM; do not load unsigned modules on a work laptop without policy clearance.

## Success criteria
- [ ] Explain to a rubber duck what happens on `read()` end-to-end
- [ ] Mock shows IRQ count increasing while a reader blocks then wakes
- [ ] (Stretch) Module loads in QEMU and `dmesg` shows probe

## Interview talking points
- “Everything is a file” — VFS routes to my `file_operations`
- ISR stays short; heavy work in process context
- How I'd add DMA: descriptors + completion IRQ + ring buffer
