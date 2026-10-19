# P5 — PID Joint Simulator

**Maps to:** Months 4–6 · pairs with hub PID lab  
**Goal:** Tune Kp/Ki/Kd on step and sine references; write findings.

```bash
python3 pid_sim.py                  # stdlib ASCII plot
python3 pid_sim.py --matplotlib     # if matplotlib installed
```

Fill `findings.md` after tuning.

## Success criteria
- [ ] Step response: overshoot < 15%, settles in < 3s (sim time)
- [ ] Sine tracking: describe phase lag vs Kd
- [ ] findings.md completed

## Interview talking points
- Cruise control / joint torque analogy
- When integral windup matters on real actuators
