"""Generate each lab's starter/ from solution/ by replacing marked regions with TODOs.
In solution files:   # TODO-START: <hint>   ...code...   # TODO-END
becomes:             raise NotImplementedError("TODO: <hint>")   (same indentation)
Run after editing any solution:  python make_starters.py"""
import pathlib, re, shutil
ROOT = pathlib.Path(__file__).parent
for sol in sorted(ROOT.glob("[0-9][0-9]-*/solution")):
    st = sol.parent / "starter"
    if st.exists(): shutil.rmtree(st)
    st.mkdir()
    for f in sol.rglob("*"):
        if f.is_dir() or "__pycache__" in f.parts: continue
        out = st / f.relative_to(sol); out.parent.mkdir(parents=True, exist_ok=True)
        if f.suffix != ".py": shutil.copy(f, out); continue
        lines, res, skip = f.read_text().splitlines(), [], False
        for ln in lines:
            m = re.match(r"^(\s*)# TODO-START: (.*)$", ln)
            if m:
                res.append(f'{m.group(1)}# TODO: {m.group(2)}')
                res.append(f'{m.group(1)}raise NotImplementedError({("TODO: " + m.group(2))!r})'); skip = True; continue
            if re.match(r"^\s*# TODO-END\s*$", ln): skip = False; continue
            if not skip: res.append(ln)
        out.write_text("\n".join(res) + "\n")
    print("starter:", st.relative_to(ROOT))
