# Chandra Vig — Systems → Robotics Learning Hub

One-stop interactive hub accompanying the career plan PDF. Visual labs, guided tutorials, curated resources, and seven pet-project scaffolds — oriented toward **Optimus-adjacent skills that redeploy** (not CUDA-as-Plan-A).

## Open the hub

```bash
cd /workspace/learning-hub
# Option A: open file directly
xdg-open index.html   # or double-click / open in Chrome/Firefox

# Option B: local server (recommended if browser restricts file://)
python3 -m http.server 8765
# then visit http://localhost:8765/
```

No npm build. Vanilla HTML/CSS/JS. Animations run **offline**; course links need network.

Fonts load from Google Fonts when online; the UI remains usable offline with system fallbacks.

## What’s inside

| Path | Purpose |
|------|---------|
| `index.html` | SPA: roadmap, labs, tutorials, resources, projects, jobs, gym |
| `css/hub.css` | Dark theme |
| `js/` | Progress (localStorage), animations, tutorials, resources, app |
| `projects/01`…`07` | Pet projects with READMEs + starter code |
| Companion PDF | `/workspace/Chandra_Vig_Learning_Hub_Guide.pdf` |

## Weekly how-to-use

1. **Check Home** — tick roadmap boxes as you finish items (stored in this browser only).
2. **2× systems sessions** — one Interactive Lab + notes with analogies; one Guided Tutorial or Bootlin/Branch resource.
3. **3× coding** — Interview Gym page / `projects/07-interview-gym` — timer on, **no AI on attempt**.
4. **1× build** — advance the pet project mapped to your current months.
5. **1× write-up** — diagram or 1-page design note (feeds interview stories).

## Projects ↔ months

| Months | Focus | Projects |
|--------|--------|----------|
| M1–3 | SoC/drivers + coding | P1 char-driver mock, P2 DT bring-up, P7 gym |
| M4–6 | ROS 2 / edge vision / control | P3 perception, P4 fake-ROS, P5 PID |
| M7–9 | Host I/O / realtime | P6 war-story kit + PCIe lab |
| M10–12 | Story + applications | Job board + SCCR polish + mocks |

## Interactive labs (must-play)

A SoC Factory · B Device Tree · C IRQ vs Poll · D PID · E ROS 2 bus · F Memory hierarchy · G PCIe/DMA host path

## North star reminder

Dream: Tesla Optimus — **only** via redeployable embedded/systems/robotics skills (Figure, Apptronik, BD, NVIDIA Isaac, host teams, etc.). Poly C/C++ drivers (NXP, Qualcomm, Ambarella) are the strength to deepen.

## Limitations

- Hub progress is **per-browser** `localStorage` (not synced across machines).
- Kernel module stub requires a proper kernel build env / disposable VM — use the userspace mock first.
- OpenCV / matplotlib / ROS 2 are optional; projects degrade gracefully or document install steps.
- Google Fonts need network once; demos themselves do not.
