#!/usr/bin/env python3
"""Standalone PID joint simulator matching the hub lab."""
from __future__ import annotations
import argparse, math

def simulate(kp, ki, kd, mode="step", T=8.0, dt=0.02):
    y = dy = integ = prev_e = 0.0
    ts, ys, sps = [], [], []
    t = 0.0
    while t <= T:
        sp = 1.0 if mode == "step" else math.sin(2 * math.pi * 0.3 * t)
        e = sp - y
        integ += e * dt
        integ = max(-3, min(3, integ))
        de = (e - prev_e) / dt
        prev_e = e
        u = kp * e + ki * integ + kd * de
        acc = u - 0.35 * dy - 0.15 * y
        dy += acc * dt
        y += dy * dt
        ts.append(t); ys.append(y); sps.append(sp)
        t += dt
    return ts, ys, sps

def ascii_plot(ts, ys, sps, width=64, height=18):
    lo = min(min(ys), min(sps)) - 0.1
    hi = max(max(ys), max(sps)) + 0.1
    grid = [[' '] * width for _ in range(height)]
    def row(v):
        return height - 1 - int((v - lo) / (hi - lo) * (height - 1))
    for i, (y, sp) in enumerate(zip(ys, sps)):
        x = int(i / max(1, len(ys) - 1) * (width - 1))
        grid[row(sp)][x] = '.'
        grid[row(y)][x] = '#'
    print("\n".join(''.join(r) for r in grid))
    print("# = joint   . = setpoint")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kp", type=float, default=1.2)
    ap.add_argument("--ki", type=float, default=0.4)
    ap.add_argument("--kd", type=float, default=0.15)
    ap.add_argument("--mode", choices=["step", "sine"], default="step")
    ap.add_argument("--matplotlib", action="store_true")
    args = ap.parse_args()
    ts, ys, sps = simulate(args.kp, args.ki, args.kd, args.mode)
    peak = max(ys)
    overshoot = max(0.0, peak - 1.0) if args.mode == "step" else float('nan')
    print(f"gains Kp={args.kp} Ki={args.ki} Kd={args.kd} mode={args.mode}")
    if args.mode == "step":
        print(f"peak={peak:.3f} overshoot={overshoot:.3f}")
    if args.matplotlib:
        try:
            import matplotlib.pyplot as plt
            plt.plot(ts, sps, '--', label='setpoint')
            plt.plot(ts, ys, label='joint')
            plt.legend(); plt.xlabel('t'); plt.ylabel('pos')
            plt.title('PID joint'); plt.grid(True); plt.show()
            return
        except ImportError:
            print("matplotlib not available, ASCII fallback")
    ascii_plot(ts, ys, sps)

if __name__ == "__main__":
    main()
