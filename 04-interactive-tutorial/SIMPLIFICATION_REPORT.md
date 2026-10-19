# Plain-language pass: report (Oct 7 2026)

Applies to all three files, rebuilt from source:
- Improved_Interactive_Tutorial_with_Tesla_Track.html
- Improved_Interactive_Tutorial.html (core only)
- /workspace/tesla-track/Tesla_FSD_AI_Optimus_Track.html

## What changed
- **"In plain words" panels: 118 in total.**
  - Every lab gets one, above the controls: 50 core sims, 7 order puzzles, 34 Tesla sims, 5 design drills, 14 core chapter labs and 8 Tesla chapter labs.
  - Each panel has an everyday analogy plus a "Try this:" line.
  - The old goal line now sits below the panel, labelled "The technical version".
- **Two-layer lab text: 275 strings rewritten.** This covers status, verdict and log strings in the core and Tesla sims, the order-puzzle verdicts and the drill verdict.
  - Each one now has a plain sentence first.
  - Below it, a smaller muted line reads "Term: …" and keeps the original technical wording.
- **No more ALL-CAPS emphasis.**
  - It was removed from lab text, lesson text, a quiz prompt, a glossary definition and the story ladder.
  - Acronyms, the bitwise AND and provenance tags such as POSTING and REPORTED are kept.
- **Glossary and tooltips.**
  - Glossary entries: 179 curated → 747 in the integrated file (537 core, 452 Tesla). This adds 230 new plain definitions plus every lesson primer term.
  - The first use of each term on a page becomes a tappable definition with an "Open in glossary →" link.
  - On desktop the definition shows on hover or focus. On phones (≤600px) tapping opens a bottom sheet with an × to close it.
  - Terms inside buttons (quiz options, checklist steps) are not made tappable, so tapping still selects the button.
- **Lead-ins: 556 short plain sentences or analogies** placed before dense paragraphs. The original text follows unchanged.
  - 48 of them are plain reasons at the start of quiz and gym explanations.
  - The other 137 core/Tesla quiz explanations already open with a sentence that the audit rates plain.
  - Data: build/src/simplify/leadins.json. Applied by build/src/simplify/apply.js.

## Audit (build/simplify/audit.py)
The audit checks every lab status/caption string and the first sentence of every paragraph. It flags a string that has 2+ undefined jargon terms, more than 30 words, or ALL-CAPS emphasis. Plain panels and lab plain layers are checked on every sentence.
- Before: 654 flagged.
- After: 0 flagged.
- Dense first sentences (3+ terms, defined or not): 471 → 64. These are tracked for information only. Most of the remaining ones are short lab-step or caption labels, which sit under a plain panel.

## Tests
- Full headless regression, all with 0 failures and 0 console errors:
  - test_improved.js on the integrated and core files
  - test_tesla.js on the integrated and standalone files
- Every lesson lab has a visible plain panel above its controls. Every chapter lab page and every drill also has one.
- Desktop hover check passed.
- Mobile check at 390×844 with touch passed: tapping a term opens an on-screen definition, × closes it, and the glossary link opens the glossary filtered to that term.
- The offline check made 0 external requests.
- A style check confirmed tooltip terms match the surrounding text in every lesson, quiz and lab.

## Screenshots
Saved in screenshots/simplified/:
- before_/after_ 01–07: the CAP lab (CP and AP, minority side), retry storm, ring buffer, PID, Tesla NPU scheduler and Tesla balance.
- after_08 and after_09: the mobile tap definition (core and Tesla).
- after_10: a lead-in paragraph.
- after_11: a quiz plain reason.
