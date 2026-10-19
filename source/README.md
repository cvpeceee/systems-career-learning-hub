# oct12-pack — Oct 12 high-profile roles pack (ch31–36, 24 lessons, 5 drills)

Same plugin approach as `../austin-pack/` (ch19–24) and `../oct11-pack/` (ch25–30): the original build sources were lost
on Oct 8, so new content is bundled and spliced into the built HTML. `bundle.js` imports austin-pack, then oct11-pack,
then `src/entry.js` (ch31–36). Each extends the globals of the one before (`__AP_CH`, `__AP_SIMS`, `__AP_PLAIN`,
`__apTesla`). **Build from THIS pack from now on**; the older packs' inject.py would drop later chapters.

Roles (research: ../new-jobs-oct12-research.md, skill map: ../new-jobs-oct12-skillmap.md)
    ant  Anthropic Staff+ SWE, Infrastructure (Distributed Systems)   ch31 + 36.1 + drill trainsched
    gpu  Roblox Principal SWE, GPU Compute                             ch32 + 36.2 + drill gpuplatform
    ea   Roblox Principal SWE, Engineering Acceleration                ch33 + 36.3 + drill buildci
    qc   Qualcomm Senior Staff Engineer (telematics platform)          ch34 + 36.4 + drill telematicsboot
    ms   Microsoft MTS, Microsoft Robotics                             ch35 + 36.5 + drill robotplatform
    all  STAR bank (10 prompts, placeholders only) + depth ladders     36.6 + ch36 interview room

Layout
    src/data/ch31..36.js, ch31l..36l.js   chapters + lessons
    src/sims/s31..36.jsx                  24 interactive labs (s36 = 5 playbook widgets + STAR bank, with the playbook data)
    src/plain.js, src/drills.js           "In plain words" panels; 5 staff-level drills (deep dives = tradeoffs + failure modes)
    base/                                 pristine Oct 7 bundles
    prev_oct11/                           the three output HTML files before this pack (rollback copy)
    snippets/                             extracted samples, tests/ harnesses, go/ module, run_checks.sh (28 checks)
    tools/                                validate, dump + audit, extract, netcheck, phoneperf, shots

Build and inject (run from this folder):
    bun build bundle.js --format=iife --minify --outfile=out/plugin.js
    python3 -W ignore inject.py
Check:
    bun tools/validate.js
    bun tools/dump.js && ../austin-pack/venv/bin/python tools/audit.py     # FLAGS: 0
    bun tools/extract.js && snippets/run_checks.sh   # C/C++ -Werror + ASan/UBSan (TSan for 34.4, 36.5), OpenSSL for 34.3,
                                                     # gofmt, go vet, go test -race (11 packages)
    node tools/netcheck.js <html...> ; node tools/phoneperf.js <html...>
    node ../tools/test_improved.js <html> <prefix> noshots ; node ../tools/test_tesla.js <html> <prefix> noshots
    node tools/shots.js                   # -> ../screenshots/oct12/
Notes
- test_tesla.js core-chapter count is now 36. netcheck.js regex includes the ch31–36 titles.
- Size decision: integrated 3.06 MB (combined minified plugin 1.01 MB), under the ~3.2 MB limit; phone-viewport load
  median 1253 ms vs 1211 ms before (+3.5%), so content stays integrated and no High_Profile_Roles_Track.html was built.
- Rollback: copy prev_oct11/*.html back over the three outputs.
