#!/usr/bin/env python3
"""Mini edge perception pipeline with latency histogram."""
from __future__ import annotations
import argparse, time, statistics, sys
from collections import deque

def try_import_cv2():
    try:
        import cv2
        import numpy as np
        return cv2, np
    except ImportError:
        return None, None

def histogram(values, bins=10):
    if not values:
        return
    lo, hi = min(values), max(values)
    if hi <= lo:
        hi = lo + 1e-6
    width = (hi - lo) / bins
    counts = [0] * bins
    for v in values:
        i = min(bins - 1, int((v - lo) / width))
        counts[i] += 1
    print("\nLatency histogram (ms):")
    for i, c in enumerate(counts):
        a = lo + i * width
        bar = "#" * min(40, c)
        print(f"  {a:6.2f}–{a+width:6.2f} | {bar} ({c})")

def run_opencv(source: str, frames: int):
    cv2, np = try_import_cv2()
    if cv2 is None:
        return False
    if source == "sample":
        cap = None
    else:
        cap = cv2.VideoCapture(0 if source == "0" else source)
        if not cap.isOpened():
            print("Could not open source; falling back to synthetic.", file=sys.stderr)
            cap = None
    lats = []
    prev_gray = None
    for i in range(frames):
        t0 = time.perf_counter()
        if cap is None:
            frame = np.zeros((240, 320, 3), dtype=np.uint8)
            cv2.rectangle(frame, (20 + (i * 3) % 200, 80), (80 + (i * 3) % 200, 140), (255, 255, 255), -1)
        else:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.resize(frame, (320, 240))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        motion = 0
        if prev_gray is not None:
            delta = cv2.absdiff(prev_gray, gray)
            motion = int(np.mean(delta))
        prev_gray = gray
        # "detect" proxy: threshold motion energy
        hit = motion > 8
        dt = (time.perf_counter() - t0) * 1000
        lats.append(dt)
        if i % 20 == 0:
            print(f"frame {i}: {dt:.2f} ms  motion={motion}  hit={hit}")
    if cap is not None:
        cap.release()
    summarize(lats)
    return True

def run_synthetic(frames: int):
    """stdlib-only fallback — still teaches timing discipline."""
    lats = []
    state = 0.0
    for i in range(frames):
        t0 = time.perf_counter()
        # pretend preprocess + detect
        acc = 0.0
        for k in range(5000):
            acc += (k + state) * 0.000001
        state = (state + 0.1 + acc * 0.0) % 50
        hit = state > 25
        time.sleep(0.001)  # stand-in for sensor wait
        dt = (time.perf_counter() - t0) * 1000
        lats.append(dt)
        if i % 20 == 0:
            print(f"frame {i}: {dt:.2f} ms  hit={hit}")
    summarize(lats)

def summarize(lats):
    if not lats:
        print("no frames")
        return
    print(f"\nn={len(lats)}  mean={statistics.mean(lats):.2f} ms  "
          f"p50={statistics.median(lats):.2f} ms  max={max(lats):.2f} ms")
    histogram(lats)
    print("\nMapping note: replace the detect proxy with Haar/DNN later; "
          "keep the same timing harness for Ambarella/QC stories.")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="sample", help="0 | path | sample")
    ap.add_argument("--frames", type=int, default=120)
    args = ap.parse_args()
    if not run_opencv(args.source, args.frames):
        print("OpenCV not installed — running stdlib synthetic pipeline.")
        run_synthetic(args.frames)

if __name__ == "__main__":
    main()
