# Case: DT mismatch

**Symptom:** Driver probes on EVK, fails on custom board; EPROBE_DEFER forever for regulator.  
**Seed facts:** Schematic shows different I2C address; overlay copy-pasted from EVK.

Practice SCCR. Hints: compatible vs actual ASIC, reg address, supply phandles, status okay, dtc warnings.
