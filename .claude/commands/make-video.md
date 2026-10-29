---
description: Run the DYNK education video pipeline end to end (or resume a run from a stage)
argument-hint: "[topic hint]  |  resume <run-id> <stage>"
---

You are the **orchestrator** of the DYNK education video pipeline. Read `CLAUDE.md` first. You coordinate; the subagents in `.claude/agents/` do the work. Pass each subagent the run folder path, its mode if any, and nothing else it can read from files.

Arguments: `$ARGUMENTS`

## 0. Set up
- If arguments start with `resume`: use that run folder, read its `STATUS.md`, and start at the named stage (brain, analyzer, hook, structure, scripter, check, clipper, director, compose, cut, review).
- Otherwise: `bash tools/new_run.sh "<short slug from the hint, or 'next'>"` → run id. Make a task list with one item per stage so Cooper can follow along.
- First run ever? If `brand/brand.md` still says DRAFT, tell Cooper in one line and carry on with the draft (he can run `/brand-setup` any time). If `brand/audio/sfx/v2/` or `brand/audio/music/bed_drone.wav` is missing, run `bash tools/make_sfx_v2.sh`. Everyone reads `references/style-speedy_devv.md` first: it is the look (v3). `references/style-0x100x.md` is the v2 support file.

## 1. Brain → GATE 1
Run `brain` (pass the topic hint). Show Cooper the title, takeaway, keywords and two backups from `01-brief.md` and ask: **go / swap to backup 1 / swap to backup 2 / change** (AskUserQuestion). Apply his answer to `01-brief.md` (re-run brain if he changes it). Mark `gates: topic=approved`.

## 2. Analyzer
Run `analyzer`. If it reports a login wall or no Chrome, tell Cooper in one line and continue on the fallback it used.

## 3. Hook → 4. Adapter (structure) → 5. Scripter → 6. Adapter (check)
Run them in that order. If the check says FIX, send it back to `scripter` and re-check — at most 2 rounds, then continue.

## GATE 2 (first pass only)
Show Cooper the script table from `05-script.md` (VO + on-screen text + rehook markers), the length, and the hook's three layers. Ask: **approve / edit**. If he edits, apply his edits through `scripter`, then re-check with `adapter` once. Mark `gates: script=approved`.
On revision loops (from the reviewer) don't stop at this gate — list the script changes in the final hand-over instead.

## 6.5 Clipper
Run `clipper` (real footage for the cold open and proof beats, with credits). If it reports footage missing, carry on: the director plans a ChromeNumber/NameCard opener instead.

## 7. Director
Run `director`. If it reports "footage wanted", tell Cooper what to drop into `inbox/` but don't wait — it has planned a motion-graphic fallback.

## 8. Composers — in parallel
Read `runs/<id>/scenes/index.json`. Spawn **one `composer` per scene in a single message** so they run in parallel, each told its run id and scene id. Wait for all. If any returned PASS-WITH-ISSUES, carry on (the reviewer decides).

## 9. Cutter → 10. Reviewer
Run `cutter`, then `reviewer`.
- **PASS** → step 11.
- **REVISE** and loop < 2 → increment `loop` in `STATUS.md`, then re-enter at the reviewer's earliest route: `scripter` (→ check → clipper if the cold open changed → director → composers → cutter → reviewer), `director` (→ composers → cutter → reviewer), or `composer:<SID>` (just that composer → cutter → reviewer).
- **REVISE** at loop 2 → present anyway with the open issues listed.

## 11. Present
- Open the video for Cooper: `open runs/<id>/final/<id>.mp4` on macOS. In a cloud session (no `open`, Linux): `git add -f runs/<id>/final/<id>.mp4 runs/<id>/final/cover.jpg runs/<id>/0*.md runs/<id>/05-caption.md && git commit -m "video: <id>" && git push`, then give the GitHub link to the file.
- Append the topic to `data/topics-log.md` (`date | title | pillar | keywords | run id`).
- Hand-over message, short:
  - final file path and length, review scores
  - trending sound to attach in Instagram (optional, 5–8 %) or "original audio"
  - caption with sources + footage credits, hashtags and alt text from `05-caption.md` (ready to paste)
  - loops used and any known issues / footage wanted
  - "To use your own voice: record per scene (lines are in `vo_lines.json`), drop files as `S01.recorded.m4a` etc. in `runs/<id>/audio/vo/`, then `/make-video resume <id> director`."
