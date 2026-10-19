# Bring-up checklist

1. **Power** — rails in spec? sequencing? brownout?
2. **Clocks / resets** — rates match datasheet? reset deasserted?
3. **Pinmux / PHY** — I2C/SPI/MIPI pins correct?
4. **Device Tree** — compatible, reg, interrupts, supplies, endpoints
5. **Driver probe** — dmesg success? deferred? EPROBE_DEFER loop?
6. **Userspace** — node permissions, test open/read, stress
7. **Perf / stability** — thermal, error IRQs, long soak

Record: symptom → hypothesis → measurement → fix → prevention note.
