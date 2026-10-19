# P2 — Device Tree + Bring-up Notebook

**Maps to:** Months 1–3  
**Goal:** Practice reading/writing DT bindings and a disciplined bring-up order.

## Contents
- `sample-sensor.dts` — fake I2C sensor node
- `CHECKLIST.md` — power → clocks → DT → probe → userspace
- `validate_dt.py` — lightweight structure checks (compatible, reg, interrupts)

```bash
python3 validate_dt.py sample-sensor.dts
```

## Success criteria
- [ ] Validator passes on sample; fails if you remove `compatible`
- [ ] You can narrate bring-up order in 90 seconds
- [ ] You map one Poly bring-up bug onto the checklist

## Interview talking points
- probe deferred → missing clock/regulator/GPIO in DT
- compatible string is the driver binding contract
