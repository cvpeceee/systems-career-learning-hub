# 06 · LeetCode-Style Interview Prep (phase 1)

A practice gym for staff/principal systems interviews (NVIDIA, Anthropic, Google, Tesla Optimus, Roblox, Qualcomm, Microsoft Robotics).

## How to open
Download this whole folder (it needs `data.js`, `app.js`, `player.js` and `videos/` next to `index.html`), then open **`index.html` in Chrome** on your laptop or phone. It works fully offline: no internet and no CDN.

## What's inside (phase 1)
| Part | Count | Notes |
|---|---|---|
| Coding problems | 21 | 17 classic patterns + 4 systems-flavored ones (LRU cache, ring buffer, DMA interval merge, trie). Each has a statement, examples, constraints, pattern tags, target companies, course mapping and similar LeetCode problems |
| System design questions | 5 | Rate limiter, distributed KV store, LLM inference serving, fleet telemetry, OTA updates. Each has an animated architecture diagram with failure injection |
| Design components (code) | 5 | Token bucket, consistent hash ring, paged KV-cache allocator, windowed hit counter, A/B OTA state machine |
| Concept videos | 10 | Narrated MP4s, 2–2.5 min each, with an in-page animated version |

Every problem follows the same path:
1. Practice box: timer, code editor, three tiers of hints, a self-grading rubric, and solved/review tracking saved in your browser.
2. Reveal: when you click it you get the plain-words analogy, brute force, then the optimal solution, with time and space cost explained simply.
3. Animated walkthrough of the real example data.
4. Code in C#, Java and C++ with comments and a line-by-line table.
5. Execution visualizer: steps through the C++ run line by line, showing call-stack frames pushing and popping, their local variables, and data structures.
6. Interview script and follow-up questions.

The Mock interview tab picks one coding problem and one design question and runs an 80-minute loop timer.

## How it was verified
- `TEST_RESULTS.txt`: every solution was compiled and run against its test cases in **C++** (g++ 14, `-fsanitize=address,undefined`), **Java** (OpenJDK 21) and **C#** (.NET 8). The result is 123/123 test cases per language.
- Execution traces are **recorded from real runs** of an instrumented C++ build (`-DTRACE`), not hand-written.
- Videos: animation frames are drawn by `player.js` in headless Chrome and encoded with ffmpeg. Narration is Piper offline neural TTS (voice `en_US-lessac-medium`), and captions are burned in, with a `.vtt` file alongside.
- A headless Chrome check of every page found 0 console errors and 0 external requests. All players were stepped end to end, and the mobile viewport was checked at 390 px.

## Rebuild
See `source/`. `python3 gen.py` builds, tests and traces everything. Then `lessons/tts.py` narrates, `node lessons/render.js` renders the videos, and `build_site.py` assembles the site.
