---
description: Talking-head explainer — script a one-take video, then turn the filmed take into an edited video with a drawn board cutting in as you explain
argument-hint: "script <topic>  |  edit <run-id>  |  new <slug> (have a take, no script)  |  rerender <run-id>"
---

You are the orchestrator of the **talking-head pipeline**. Read `CLAUDE.md` (house rules) and `references/talking-head-explainer-style.md` (the format) first.

Arguments: `$ARGUMENTS`

```
script ─▶ (you film one take) ─▶ ingest ─▶ board-director ─▶ draft render ─▶ review ─▶ final render
  GATE: approve script                         ⟲ resolve_edl.py checks + contact sheet, max 3 loops
```

## `script <topic>`
1. `bash tools/talk/new_run.sh "<slug>"` → run id. Task list: script, film, ingest, edit, render, review.
2. Run `talk-scripter` with the run id and topic.
3. Show the user the script table from `script.md` (say / FACE-BOARD / board sketch), the length, and the hook's three layers. Ask **approve / edit** (AskUserQuestion). Apply edits to both `script.md` and `say.txt`.
4. Tell them: film it in one take, drop the file in `runs/<id>/source/`, then run `/talk-video edit <id>`. Include the "How to shoot" notes.

## `new <slug>` (they already filmed, no script)
`bash tools/talk/new_run.sh "<slug>"`, ask for the file, put it in `runs/<id>/source/`, continue with `edit`. Without `say.txt` retakes are caught by repeated opening words only, so read the ingest report extra carefully.

## `edit <run-id>`
1. **Ingest:** `python3 tools/talk/ingest.py runs/<id>` (several minutes the first time: it downloads the Whisper model). Read `work/ingest-report.md`. If the final transcript has a dropped or doubled line, fix it before going on: re-run with `--max-gap 0.5` for a looser cut, `--no-tighten` to keep every pause, or edit `say.txt` to what was actually said and re-run.
2. **Edit:** run `board-director` with the run id. It writes `edl.json`, passes `resolve_edl.py`, and loops on draft renders.
3. **Review the draft yourself:** read `review/final.draft/contact_sheet.jpg` and 2–3 full frames from the board sections. Check: hook headline readable, every board element lands on its word, nothing off-screen or overlapping, faces never cropped at the eyes, captions clear of the Instagram UI (bottom 420 px, right 160 px on vertical). Send fixes back to `board-director` (max 2 rounds).
4. **Final:** `bash tools/talk/render.sh runs/<id>` → `runs/<id>/final/<id>.mp4`. Open it for the user (`open runs/<id>/final/<id>.mp4` on macOS).
5. Hand-over, short: file and length, board share, rehooks, what the ingest cut (retakes), any warnings left, and a suggested caption + the trending sound to attach in-app at 5–15 %.

## `rerender <run-id>`
User edited `edl.json` by hand: `bash tools/talk/render.sh runs/<id> --draft`, show the contact sheet, then final on approval.

## Notes
- Format comes from `edl.json` `format`: vertical for Reels/TikTok (default), horizontal for X/YouTube.
- Remotion preview with live scrubbing: `cd studio && npx remotion studio src/index.ts`, pick **TalkVideo**, paste `runs/<id>/work/props.json` into the props panel.
