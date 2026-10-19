# P3 — Mini Edge Perception Pipeline

**Maps to:** Months 4–6  
**Goal:** Webcam/file → preprocess → simple detect → latency histogram. Practice the Ambarella/Qualcomm mapping story.

## Dependencies
- Python 3.9+
- Optional: `opencv-python`, `numpy` (see requirements.txt)
- Without OpenCV: falls back to a synthetic motion demo (stdlib only)

```bash
pip install -r requirements.txt   # optional but recommended
python3 pipeline.py --source 0      # webcam
python3 pipeline.py --source sample # synthetic
```

## Ambarella / Qualcomm mapping (interview story)
| Pipeline stage | Typical SoC block |
|----------------|-------------------|
| Capture        | MIPI CSI / sensor I2C |
| Preprocess     | ISP (demosaic, 3A, tone) |
| Detect         | CV/NPU / DSP (CVflow / Hexagon-class) |
| Post / cmd     | CPU + IPC to controller |

Measure **end-to-end** latency, not only model FPS. Document drops & jitter.

## Success criteria
- [ ] Histogram printed for ≥100 frames
- [ ] Written paragraph: how you'd place stages on Ambarella CV7 vs a generic SBC
- [ ] One bottleneck identified (resize? detect? display?)

## Interview talking points
- Budget: photon → cmd within control period
- DRAM bandwidth contention with multi-camera
- Why CUDA-deep isn't required for this edge story
