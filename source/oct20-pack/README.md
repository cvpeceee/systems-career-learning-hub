# oct20-pack: Oct 20 job-alert roles (ch37–41, 15 lessons)

Same plugin approach as the earlier packs. `bundle.js` imports austin-pack, oct11-pack and oct12-pack entry files, then `src/entry.js` (ch37–41). On the build box these packs sit side by side in `/workspace/tutorial-review/`; only this pack and oct12 (`../`) are kept in the repo. **Build from this pack from now on**; older inject.py files would drop chapters 37–41.

Roles and sources: `04-interactive-tutorial/docs/new-jobs-oct20-research.md`; skill map: `new-jobs-oct20-skillmap.md`; repo-wide map: `JOB_SKILL_MAP.md`.

    src/data/ch37..41.js, ch37l..41l.js   chapters + lessons
    src/sims/s37..41.jsx                  15 interactive labs
    src/plain.js                          "In plain words" panels (PLAIN_O20)
    snippets/                             lesson code, tests/ (C/C++), go/ module, run_checks.sh
    tools/                                validate, dump + audit, extract, netcheck, phoneperf, shots
    video/voct20.py                       scripts for the 6 videos (render with 07-poly-embedded-firmware/source/video/render.py)

Build: `bun build bundle.js --format=iife --minify --outfile=out/plugin.js && python3 -W ignore inject.py`
Check: `bun tools/validate.js`, `bun tools/dump.js && python3 tools/audit.py` (needs wordfreq), `snippets/run_checks.sh`
Videos: `cd ../../07-poly-embedded-firmware/source/video && python3 render.py OUT voct20` (copy voct20.py next to render.py first).
