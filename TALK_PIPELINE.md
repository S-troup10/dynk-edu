# Talking-head pipeline

One take of you talking to camera in, an edited explainer out: dead air and fluffed lines gone, a drawn board cutting in whenever you explain something, back to your face for the hook, every rehook and the CTA.

## The flow

| Step | Who | Command | Output in `runs/<id>/` |
|---|---|---|---|
| 1. Script | Claude (`talk-scripter`), you approve | `/talk-video script <topic>` | `script.md` (what you say + what the board draws + how to shoot), `say.txt` (exact words) |
| 2. Film | You | one take, drop it in `source/` | `source/take.mov` |
| 3. Ingest | `tools/talk/ingest.py` | (run by `/talk-video edit`) | `work/aroll.mp4` (tight cut), `work/words.json`, `work/words.txt`, `work/ingest-report.md` |
| 4. Edit | Claude (`board-director`) | (run by `/talk-video edit`) | `edl.json` (face/board timeline + board contents, anchored to words) |
| 5. Check | `tools/talk/resolve_edl.py` | automatic | `work/edl-report.md`, `work/props.json` |
| 6. Render | Remotion `TalkVideo` | `tools/talk/render.sh runs/<id> [--draft]` | `final/<id>.mp4`, `review/` contact sheet |

## What the ingest does to your take
- Transcribes with Whisper (word-level timings) and snaps every word to the real speech edges in the audio.
- **Retakes:** if you restart a sentence, the earlier attempt is cut and the last one kept (compared against `say.txt`). Stutters ("which coins which coins") and filler (um, uh) go too.
- **Dead air:** any silence over 0.35 s closes to 0.14 s. Only measured silence is removed, so a word Whisper misheard is never cut out.
- Fixes spelling to the script (DYNK, Solana…) so captions are right.
- Everything it changed is listed in `work/ingest-report.md`. Read it once per video.

## The edit decision list (`edl.json`)
Plain JSON written by the board director; you can hand-edit it and run `/talk-video rerender <id>`. Segments say *when* (by word index from `work/words.txt`), boards say *what*. Full schema with an example: `.claude/agents/board-director.md`.

Board elements: title, text, icon (≈2,100 line icons), flow (A → B → C), numbered list, compare (✓ / ✗), count-up stat, strike-through (old → new), image (real app screens in a phone frame), chips. Marks (circle, underline, cross, check) can be drawn over anything.

## Formats
`"format": "vertical"` (1080×1920, Reels/TikTok, default) or `"horizontal"` (1920×1080, X/YouTube) or `"square"`. Vertical keeps text out of Instagram's UI zones (`brand/tokens.json` safe zone).

## Speed (on a Mac)
- Ingest: ~30–60 s for a 30 s take (first run downloads the ~500 MB `small.en` Whisper model). Faster/rougher: `TALK_WHISPER_MODEL=base.en`.
- Draft render (half res): about real time ×3–5. Final: a few minutes for 30 s.

## Knobs
- `python3 tools/talk/ingest.py runs/<id> --max-gap 0.5` looser cut · `--keep-gap 0.2` more breathing room · `--no-tighten` keep pauses.
- `--edge-pad 0.14` keeps soft word endings that sit under the speech threshold (use when the ingest report shows words "in script but not heard" that you can hear in the take).
- `--no-retakes` uses `say.txt` only for the Whisper hint and spelling, and keeps every attempt. Use it when the takes were already picked by hand (e.g. a take assembled from the last attempt of each line).
- `--protect 2.30-2.75` take-time range that is never cut (a quiet key word the tightener keeps eating). Repeatable.
- Separate mic audio: it has to be synced to the camera audio before ingest (cross-correlate, then replace the take's audio).
- `TALK_CONCURRENCY=50%` if rendering makes the Mac hot.
- `REMOTION_BROWSER=/path/to/chrome` if Remotion can't find a browser.

## Files
- `tools/talk/` — `new_run.sh`, `ingest.py`, `resolve_edl.py`, `render.sh`, `lucide-icons.txt`
- `studio/src/talk/` — `TalkVideo.tsx` (face, punch-ins, captions, hook, SFX), `Board.tsx` (board + element kit), `types.ts`
- `.claude/agents/talk-scripter.md`, `.claude/agents/board-director.md`, `.claude/commands/talk-video.md`
- `references/talking-head-explainer-style.md` — the format rules and research
