#!/usr/bin/env python3
"""Lightweight Device Tree fragment checker (teaching tool, not dtc)."""
import re, sys
from pathlib import Path

REQUIRED_IN_SENSOR = ["compatible", "reg"]
RECOMMENDED = ["interrupts", "interrupt-parent"]

def check(path: Path) -> int:
    text = path.read_text()
    errors, warns = [], []
    if "compatible" not in text:
        errors.append("file-level: missing any 'compatible' property")
    # Find sensor-like nodes
    nodes = re.findall(r'(\w+@[\da-fA-F]+)\s*\{([^{}]*)\}', text, re.S)
    if not nodes:
        warns.append("no unit-address nodes (foo@addr) found")
    for name, body in nodes:
        if "sensor" in name or "fake-i2c" in body:
            for req in REQUIRED_IN_SENSOR:
                if not re.search(rf'\b{req}\b\s*=', body):
                    errors.append(f"{name}: missing '{req}'")
            for rec in RECOMMENDED:
                if not re.search(rf'\b{rec}\b\s*=', body):
                    warns.append(f"{name}: recommended '{rec}' missing")
            if 'status = "disabled"' in body:
                warns.append(f"{name}: status disabled")
    for w in warns:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERR:  {e}")
    if errors:
        print("FAIL")
        return 1
    print("OK — structure looks sane (still run real `dtc` before shipping)")
    return 0

if __name__ == "__main__":
    p = Path(sys.argv[1] if len(sys.argv) > 1 else "sample-sensor.dts")
    sys.exit(check(p))
