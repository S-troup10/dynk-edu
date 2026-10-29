---
description: Build or refine the DYNK video brand doc and tokens, then render a brand test card for approval
argument-hint: "[notes, e.g. 'use our real font' or 'make it warmer']"
---

Goal: turn `brand/brand.md` and `brand/tokens.json` from DRAFT into Cooper-approved. Notes: `$ARGUMENTS`

1. Read `brand/brand.md`, `brand/tokens.json`, `references/notes.md`, and look at any images or videos in `inbox/` and `brand/source-screens/` (extract frames from videos with `tools/review_frames.sh`). Sample real colours from app screenshots (Python + Pillow) rather than guessing.
2. Ask Cooper only what you can't see (AskUserQuestion, max 4): official font files? voice choice (play options: `python3 tools/tts.py --text "Your keys, your crypto." --id test --outdir /tmp/voicetest --voice <voice>` for 2–3 voices and `open` them)? tone (more playful vs more serious)? anything off-limits visually?
3. Update `tokens.json` and `brand.md` (keep the section structure). New fonts: put `.woff2` files in `studio/public/fonts/` named `<Family>-<weight>.woff2` and set `tokens.type.family`.
4. Render the brand test card: `cd studio && npx remotion still src/index.ts demo-S01 ../brand/test-card.png --frame=70` and a short `npx remotion render src/index.ts demo-S01 ../brand/test-card.mp4`. Open both for Cooper.
5. When he approves, change the `_status` in tokens and the header in `brand.md` from DRAFT to `APPROVED <date>`.
