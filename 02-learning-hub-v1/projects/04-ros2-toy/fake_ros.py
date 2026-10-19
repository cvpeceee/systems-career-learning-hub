#!/usr/bin/env python3
"""Minimal in-process pub/sub bus teaching ROS 2 mental models."""
from __future__ import annotations
import threading, time, math, queue
from dataclasses import dataclass
from typing import Any, Callable, Dict, List

@dataclass
class Msg:
    topic: str
    data: Any
    stamp: float

class Bus:
    def __init__(self):
        self._subs: Dict[str, List[Callable[[Msg], None]]] = {}
        self._lock = threading.Lock()

    def create_publisher(self, topic: str):
        def publish(data: Any):
            msg = Msg(topic, data, time.time())
            with self._lock:
                subs = list(self._subs.get(topic, []))
            for cb in subs:
                cb(msg)
        return publish

    def create_subscription(self, topic: str, cb: Callable[[Msg], None]):
        with self._lock:
            self._subs.setdefault(topic, []).append(cb)

def sensor_pub(bus: Bus, stop: threading.Event):
    pub = bus.create_publisher("/scan")
    t0 = time.time()
    while not stop.is_set():
        t = time.time() - t0
        # fake "range to obstacle"
        dist = 1.5 + 0.8 * math.sin(t * 1.3)
        pub({"range_m": dist})
        time.sleep(0.05)  # 20 Hz

def controller(bus: Bus, stop: threading.Event):
    cmd_pub = bus.create_publisher("/cmd_vel")
    last = {"range_m": 2.0}
    def on_scan(msg: Msg):
        last.update(msg.data)
    bus.create_subscription("/scan", on_scan)
    while not stop.is_set():
        r = last["range_m"]
        # simple reactive: slow down when close
        linear = max(0.0, min(0.6, (r - 0.6) * 0.5))
        angular = 0.4 if r < 1.0 else 0.0
        cmd_pub({"linear": linear, "angular": angular})
        time.sleep(0.05)

def cmd_visualizer(bus: Bus, stop: threading.Event):
    q: queue.Queue = queue.Queue()
    bus.create_subscription("/cmd_vel", lambda m: q.put(m))
    bus.create_subscription("/scan", lambda m: q.put(m))
    n = 0
    while not stop.is_set():
        try:
            m = q.get(timeout=0.2)
        except queue.Empty:
            continue
        n += 1
        if n % 10 == 0:
            print(f"[{m.topic}] {m.data}")

def main():
    print("Fake ROS bus — topics: /scan, /cmd_vel (Ctrl+C to stop)")
    bus = Bus()
    stop = threading.Event()
    threads = [
        threading.Thread(target=sensor_pub, args=(bus, stop), daemon=True),
        threading.Thread(target=controller, args=(bus, stop), daemon=True),
        threading.Thread(target=cmd_visualizer, args=(bus, stop), daemon=True),
    ]
    for t in threads:
        t.start()
    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        stop.set()
        print("\nstopped — next: map this graph onto rclpy nodes")

if __name__ == "__main__":
    main()
