"""Re-implemented plain-language jargon audit (original lost in the Oct 8 box reset).
Rules: (1) each lesson's primer text: every sentence <=30 words, <2 undefined jargon terms;
concept first sentence <=30 words and <2 undefined jargon.  (2) "In plain words" panels (a/t), the plain
layer of every two-layer sim status (tl), and the plain part of chapter captions: every sentence <=30
words and <2 jargon hits.  Jargon = acronym not in allow-list, word with wordfreq zipf < 2.6, or a glossary
term.  Backticked code is stripped first."""
import json, re, sys
from wordfreq import zipf_frequency
D = json.load(open("out/dump.json"))
ALLOW = set("""CPU CPUs GPU GPUs OS PC PCs US ID IDs ML AI OK TV UI API APIs USB RAM MB GB KB TB ms µs ns Hz MHz GHz Mb Gb Wi-Fi PHY
A0 FPS fps p50 p99 SoC SoCs x86 Arm Linux C C++ OTA""".split())
GLOSS = set()
for ch in D["chapters"]:
    for l in ch["lessons"]:
        for t, _ in l["primer"]["terms"]:
            for part in re.split(r"\s*/\s*|\s*\(|\)", t):
                part = part.strip()
                if part and len(part) > 2: GLOSS.add(part if re.fullmatch(r"[A-Z0-9/\-]+", part) else part.lower())
def strip(s): return re.sub(r"`[^`]*`", " ", s)
def sentences(s):
    s = strip(s)
    return [x.strip() for x in re.split(r"(?<=[.!?])\s+(?=[A-Z'\"(0-9])", s) if x.strip()]
def words(s): return re.findall(r"[A-Za-z][A-Za-z0-9'+\-]*", s)
def jargon(s, defined=()):
    hits = set(); low = " " + re.sub(r"[^a-z0-9+\- ]", " ", s.lower()) + " "
    for g in GLOSS:
        if g.lower() in defined: continue
        if g.isupper():  # acronym: case-sensitive, so "can" is not CAN
            if re.search(r"(?<![A-Za-z0-9])" + re.escape(g) + r"s?(?![A-Za-z0-9])", s): hits.add(g)
        elif re.search(r"(?<![a-z0-9])" + re.escape(g) + r"(?:s|es)?(?![a-z0-9])", low): hits.add(g)
    for w in words(s):
        bare = w.strip("'-")
        if bare in ALLOW: continue
        if re.fullmatch(r"[A-Z][A-Z0-9]{1,}s?", bare):
            if bare.lower() not in defined and bare.rstrip("s").lower() not in defined: hits.add(bare.rstrip('s') if bare.endswith('s') and bare[:-1].isupper() else bare)
            continue
        lw = bare.lower()
        if any(lw == d or lw in d.split() for d in defined): continue
        if len(lw) > 3 and zipf_frequency(lw, "en") < 2.6 and not any(lw in g.split() for g in hits): hits.add(lw)
    # collapse word hits that are part of a phrase hit
    phr = [h for h in hits if " " in h]
    hits = {h for h in hits if not any(h != p and h in p.split() for p in phr)}
    return {h for h in hits if not (h.islower() and h.upper() in hits)}
flags = []
def check(where, text, defined=(), first_only=False):
    ss = sentences(text)
    for s in (ss[:1] if first_only else ss):
        n = len(words(s)); j = jargon(s, defined)
        if n > 30: flags.append(f"{where}: {n} words: {s[:90]}")
        if len(j) >= 2: flags.append(f"{where}: jargon {sorted(j)}: {s[:90]}")
for ch in D["chapters"]:
    for i, c in enumerate(ch["captions"]):
        check(f"ch{ch['number']} caption {i+1}", re.sub(r"\([^)]*\)", "", c))
    for k, l in enumerate(ch["lessons"]):
        dfn = {t.lower() for t, _ in l["primer"]["terms"]} | {p.strip().lower() for t, _ in l["primer"]["terms"] for p in re.split(r"\s*/\s*|\s*\(|\)", t) if p.strip()}
        check(f"{ch['number']}.{k+1} primer", l["primer"]["text"], dfn)
        check(f"{ch['number']}.{k+1} concept-first", l["concept"].replace("**", ""), dfn, first_only=True)
for key, v in D["plain"].items():
    for f in ("a", "t"):
        if v.get(f): check(f"plain {key}.{f}", v[f])
for t in D["tls"]: check(f"tl {t['file']}", t["text"])
print(f"checked: {sum(len(c['lessons']) for c in D['chapters'])} lessons, {len(D['plain'])} plain panels, {len(D['tls'])} two-layer statuses")
print(f"FLAGS: {len(flags)}"); print("\n".join(flags))
