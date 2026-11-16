"""A toy, offline embedding model.

Real embedding models (e.g. OpenAI text-embedding-3-small, Voyage, or open models via sentence-transformers)
learn from huge amounts of text that "device not detected" and "host can't see the gadget" mean similar things.
We can't ship that here, so this toy fakes the key property honestly: a small synonym table maps words to shared
concepts, then concepts are hashed into a fixed-length vector. Paraphrases that share concepts land close together.
It also ignores tokens containing digits, to mimic how real embedding models blur rare identifiers
(error codes, part numbers, versions) - the reason production RAG adds keyword search (BM25) alongside vectors.
It is NOT a real model; Lab 02's README shows how to swap in a real one with one function change.
"""
from __future__ import annotations
import hashlib, math, re

DIM = 256
CONCEPTS = {
    "DETECT": "detect detected detects detection enumerate enumerates enumeration enumerated recognize recognized recognise see sees seen visible appear appears found",
    "DEVICE": "device devices gadget peripheral accessory dock docks dongle",
    "HOST": "host laptop pc computer notebook",
    "POWER": "power charge charging charger battery watts wattage pd",
    "RESET": "reset resets reboot reboots restart restarts restarting power-cycle",
    "FAIL": "fail fails failed failure error errors broken not cannot can't won't doesn't stop stops stopped drop drops dropped",
    "UPDATE": "update updates updating upgrade firmware flash flashing ota",
    "HEAT": "heat hot overheating overheat temperature thermal warm",
    "DISPLAY": "display monitor screen video displayport hdmi",
    "NETWORK": "network ethernet wifi lan connection connectivity internet",
    "SLOW": "slow slowly lag laggy latency sluggish",
    "SECURE": "secure security signed signature verify verification boot",
}
_lookup = {w: c for c, ws in CONCEPTS.items() for w in ws.split()}
_STOP = set("a an the is are was were to of in on for and or my it its this that with when after be by at from as i".split())

def tokens(text: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9][a-z0-9'\-]*", text.lower()) if w not in _STOP]

def _bucket(feature: str) -> tuple[int, float]:
    h = hashlib.md5(feature.encode()).digest()
    return int.from_bytes(h[:4], "little") % DIM, (1.0 if h[4] % 2 else -1.0)

def embed(text: str) -> list[float]:
    """Text -> unit-length vector of DIM floats."""
    v = [0.0] * DIM
    for w in tokens(text):
        if any(ch.isdigit() for ch in w):
            continue  # simulate a real weakness: embeddings blur rare identifiers like "E-4012" or "5H8T2"
        feat = "C:" + _lookup[w] if w in _lookup else "W:" + w
        weight = 2.0 if w in _lookup else 1.0
        i, sign = _bucket(feat)
        v[i] += sign * weight
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]
