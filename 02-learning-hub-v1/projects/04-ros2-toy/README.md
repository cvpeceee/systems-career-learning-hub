# P4 — ROS 2 Toy Robot Sim (fake ROS)

**Maps to:** Months 4–6  
**Goal:** Learn topics / pub-sub / simple control loop without installing ROS yet.

## Run
```bash
python3 fake_ros.py
```
Nodes: `sensor_pub`, `controller`, `cmd_visualizer` on an in-process bus.

## Migrate to real ROS 2
1. Install ROS 2 (Humble/Jazzy) via official docs
2. Replace `Bus` with `rclpy` publishers/subscribers
3. Same graph: `/scan` → controller → `/cmd_vel`
4. Visualize in RViz; follow Albanna or OpenAMR course links from the hub library

## Success criteria
- [ ] See sensor messages driving cmd output
- [ ] Can explain topic vs service vs action at a high level
- [ ] Written note: what changes when you move to multi-process DDS

## Interview talking points
- Decoupling via topics; latency budget still yours to enforce
- QoS matters on real robots (sensor data vs reliable commands)
