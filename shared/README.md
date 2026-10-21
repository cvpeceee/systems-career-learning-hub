# shared/ — one glossary for every course

- `glossary/glossary.json` — 684 terms (meaning + everyday analogy). 102 come straight from `07-poly-embedded-firmware/source/glossary.py` so definitions match everywhere. Rebuild: `python3 glossary/build.py`.
- `glossary/jargon.js` — inlined into each course HTML by `glossary/inject.py`: highlights the first use of every term in each lesson (tap → meaning + "Like: …" picture), adds a **📖 Words to know** box at the top of each lesson/page, and a **📖 Glossary** button with search. Uses the CSS Highlight API, so lesson text is never rewritten. Re-run `inject.py` after rebuilding any course HTML.
- `glossary/qa/crawl.js` + `glossary/audit.py` → `docs/JARGON_AUDIT.md` (first-use audit, before/after). `qa/qa.js` = headless Chrome desktop + phone check.
- `video/wrap.py` — upgrades 04/06 videos using the 07 synced renderer (`render07.py`): hook story → pause-and-think → original animated lesson with a spoken **NEW WORD** card inserted right after each term is first said → answer → recap. Captions come from the same sentence timeline.
