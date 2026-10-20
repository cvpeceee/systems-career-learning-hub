#!/usr/bin/env python3
"""Patch the combined Oct 8 + Oct 11 + Oct 12 + Oct 20 plugin (bundle.js: austin-pack ch19-24, oct11 ch25-30, oct12 ch31-36, oct20 ch37-41) into the built HTML files.
The original build sources were lost when the box was restored (only the built HTML survived), so new content is
compiled separately (bun build src/entry.js) and spliced into each bundle at fixed, pattern-checked points:
  1. right before the new-chapters array:   __APRT runtime map + plugin IIFE, then `...__AP_CH` appended to the array
  2. the final registry call:               SIMS / PLAIN / GLOSSARY / TESLA extended with the plugin's entries
Always starts from the pristine copies in base/ so it is idempotent."""
import re, sys, json, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from find_names import find
HERE = pathlib.Path(__file__).parent
plugin = (HERE / "out/plugin.js").read_text().replace("</script", "<\\/script").replace("<!--", "<\\!--")
TARGETS = [("int", HERE / "base/int.html", pathlib.Path("/workspace/tutorial-review/Improved_Interactive_Tutorial_with_Tesla_Track.html")),
           ("core", HERE / "base/core.html", pathlib.Path("/workspace/tutorial-review/Improved_Interactive_Tutorial.html")),
           ("tesla", HERE / "base/tesla.html", pathlib.Path("/workspace/tesla-track/Tesla_FSD_AI_Optimus_Track.html"))]
only = set(sys.argv[1:])
for name, src, dst in TARGETS:
    if only and name not in only: continue
    html = src.read_text(); i = html.index("<script>") + 8; j = html.rindex("</script>"); js = html[i:j]
    names = find(js)
    rt = "globalThis.__APRT={" + ",".join(f"{k}:{v}" for k, v in names.items() if v) + "};"
    ph = re.search(r"var (\w+)=\[((?:\.\.\.\w+,?)+)\]\.sort\(\(e,t\)=>e\.number-t\.number\)", js)
    reg = re.search(r"(\w+)\(\{core:[^;]*?STOPTERMS:\w+\}\);", js)
    assert reg, f"{name}: registry call not found"
    if ph:  # core chapters exist in this bundle
        assert names["jsx"] and names["useState"] and names["Slider"], f"{name}: runtime names missing {names}"
        new_arr = f"var {ph.group(1)}=[{ph.group(2)},...(globalThis.__AP_CH||[])].sort((e,t)=>e.number-t.number)"
        js = js[:ph.start()] + rt + plugin + ";" + new_arr + js[ph.end():]
    else:   # Tesla-only bundle: no core chapters, only drills/plain/glossary
        js = js[:reg.start()] + rt + plugin + ";" + js[reg.start():]
    reg = re.search(r"(\w+)\(\{core:[^;]*?STOPTERMS:\w+\}\);", js)
    call = reg.group(0)
    call2 = re.sub(r"SIMS:(\{[^{}]*\}|\w+)", lambda m: "SIMS:{..." + m.group(1) + ",...(globalThis.__AP_SIMS||{})}", call, 1)
    call2 = re.sub(r"PLAIN:(\{[^{}]*\}|\w+)", lambda m: "PLAIN:{..." + m.group(1) + ",...(globalThis.__AP_PLAIN||{})}", call2, 1)
    call2 = re.sub(r"GLOSSARY:(\w+)", r"GLOSSARY:globalThis.__apGl(\1)", call2, 1)
    call2 = re.sub(r"TESLA:(\w+)", r"TESLA:globalThis.__apTesla(\1)", call2, 1)
    assert call2.count("__AP_SIMS") == 1 and call2.count("__AP_PLAIN") == 1 and "__apGl" in call2 and "__apTesla" in call2, call2
    js = js[:reg.start()] + call2 + js[reg.end():]
    out = html[:i] + js + html[j:]
    dst.write_text(out)
    print(f"{name}: wrote {dst} ({len(out)} bytes) names={json.dumps(names)} chapters_patched={bool(ph)}")
