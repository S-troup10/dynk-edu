# DYNK Education Video Pipeline

This folder makes short educational Instagram Reels for **@dynkeducation**: DYNK is a non-custodial crypto wallet, and the account teaches self-custody, data sovereignty and safe, cheap transacting. Everything here is **education**, not promotion or financial advice.

**House look (v3): read `references/style-speedy_devv.md` first.** Hooks, story and pacing modelled on @speedy_devv's top non-avatar reels: a paradox about an everyday object, the answer given away early, magnified 3D cutaways with callout labels, one orange glowing system per shot, sentence-building captions with one boxed keyword, "that's also why" consequences, and a specific "send this to someone who…" CTA. **v3.1 (30 Oct 2026): 50–60 s, fast cuts, a real story spine — read `references/v3.1-pacing-and-story.md`; where it disagrees with the speedy file on length, pacing or hook, v3.1 wins.** No mascot. `references/style-0x100x.md` (v2) still supplies the 3D studio materials, real-footage proof beats and name cards; where they disagree, the speedy file wins.

Start a video with `/make-video` (optionally with a topic hint). Pick up a run part-way with `/make-video resume <run-id> <stage>`.

## The chain

```
brain ─▶ analyzer ─▶ hook ─▶ adapter(structure) ─▶ scripter ─▶ adapter(check) ─▶ clipper ─▶ director
  │ GATE 1: Cooper approves topic                        │ GATE 2: Cooper approves script
                                                                                    │
                    ┌──────────── composer S01 ─┐                                   │
                    ├──────────── composer S02 ─┤  (one fresh composer per scene,   ◀┘
                    ├──────────── composer S0n ─┘   in parallel, each self-reviews)
                    ▼
                  cutter ─▶ reviewer ─▶ PASS ─▶ present
                               │
                               └─ REVISE ─▶ back to scripter (or director / one composer for
                                            visual-only fixes). Max 2 loops, then present anyway.
```

| Stage | Agent | Reads | Writes (in `runs/<id>/`) |
|---|---|---|---|
| 1 | `brain` | `brand/dynk-context.md`, `data/topics-log.md`, `data/own-page-log.md` | `01-brief.md` |
| 2 | `analyzer` | brief; Instagram via Claude in Chrome | `02-analysis.md`; appends `data/hook-bank.md`, `data/own-page-log.md` |
| 3 | `hook` | brief, analysis, review skills (`viral-hooks`, `viral-instagram-reels`) | `03-hooks.md` |
| 4 | `adapter` (mode: structure) | hooks, analysis, proven-hooks skill (`proven-hook-templates`) | `04-structure.md` |
| 5 | `scripter` | hooks, structure, `viral-short-form`, `viral-captions-and-ctas` | `05-script.md`, `05-caption.md`, `vo_lines.json` |
| 6 | `adapter` (mode: check) | script + structure + proven hooks | `05b-adapter-check.md` (PASS / FIX → scripter, max 2 rounds) |
| 6.5 | `clipper` | script, structure, `references/style-0x100x.md`; YouTube via `tools/fetch_clip.py` | `06a-clips.md`, `clips/*.mp4`, `clips/credits.md` |
| 7 | `director` | script, `brand/brand.md`, `brand/tokens.json`, `references/notes.md`, `inbox/` | `06-direction.md`, `direction.json`, VO audio, web captures, scene stubs |
| 8 | `composer` ×N | its scene in `direction.json` + `scenes/<SID>/props.json` | `studio/src/scenes/<run>/<SID>.tsx`, `renders/<SID>.mp4`, `scenes/<SID>/composer-notes.md` |
| 9 | `cutter` | renders | `final/<id>.mp4`, `final/cover.jpg`, `07-cut.md` |
| 10 | `reviewer` | everything | `08-review.md` (PASS / REVISE + route) |

`runs/<id>/STATUS.md` tracks stage, loop count and gates. Every agent updates it when done.

## Models (usage)
Opus (the main session) makes every decision: topic, hook, script, direction, `_shared.tsx`, review. Sonnet does execution: composers (`model: sonnet` in `.claude/agents/composer.md`) and the cutter. Brief composers with a detailed shot list so Sonnet needs no judgement calls. 11 parallel composers can hit the 5-hour usage limit: cap still checks at 2 rounds and 1 full render each; resume stopped composers with SendMessage instead of respawning.

## Talking-head mode (`/talk-video`)
A separate pipeline for one-take, to-camera explainers with its own "paper" look (marker drawings on paper, native TikTok Sans captions), not the 3D house style: `talk-scripter` → (team films) → `tools/talk/ingest.py` → `board-director` writes `edl.json` → `tools/talk/resolve_edl.py` → `tools/talk/render.sh`. Rules: `references/talking-head-explainer-style.md`. Details: `TALK_PIPELINE.md`. The house rules below apply to it too.

## House rules (all agents)

- **Education first.** Teach one idea per video. No price talk, no "returns", "gains", "yield", "APY" (annual percentage yield), "passive income", "to the moon", "guaranteed", "not financial advice" bait. No telling people to buy DYNK. CTA is follow/save/share or "try it in the DYNK app" at most.
- **Never invent facts.** Product claims must come from `brand/dynk-context.md`. Crypto facts must be general and correct. If unsure, cut the claim.
- **Never invent data.** View counts, creators and audio names come from what the analyzer actually saw. If something wasn't observed, say so.
- **Pacing (v3.1).** A new fact, part or consequence every 3–5 s, a hard cut or new angle every 0.6–1.5 s (hook: every 0.5–0.8 s), nothing static over 1 s, objects arrive in 4–8 frames. No zoom punches, flashes, wipes or shakes: attention comes from content and camera, not effects.
- **Real footage.** Short clips (0.8–3 s, ~8 s total) of real public interviews/news, always credited in the caption, never used to put words in someone's mouth. Never AI-generate real people, logos or charts.
- **Real numbers.** Every number on screen is real and its source goes in the caption.
- **Hooks have three layers.** Visual (5–6 hard cuts in the first ~4.5 s, orange + motion on frame 0 since it is also the cover), audio (a stakes line from a real story, ≤15 words, paradox complete by ~5 s), on-screen text (the sentence-building caption PLUS a big 2-line text hook, e.g. "$91M GONE. / NOBODY HACKED HIM.", over the first ~1.3 s). Then the loop question by ~7 s and the answer by ~12 s.
- **Audio.** The export carries polished voiceover + v2 SFX + the ambient bed `brand/audio/music/bed_drone.wav`. Trending audio is optional, attached in the Instagram app at upload at 5–8 %, never baked in.
- **Brand.** Colours, type, motion and logo rules come only from `brand/tokens.json` (`v2` + `v3` blocks), `brand/brand.md`, `references/style-speedy_devv.md` and `references/style-0x100x.md`. One orange glowing system per shot. Never open on the logo. No mascot or cartoon presenter.
- **Safe zone.** Text and key visuals stay inside `tokens.video.safeZone` (Instagram's UI covers the top, the caption block and the right-hand buttons).
- **Files are the hand-off.** Agents talk to each other only through files in the run folder. Write the file, then return a 3–5 line summary.
- **Instagram etiquette.** Read-only. No likes, follows, comments, DMs or posting. Pause between pages. If Instagram shows a login wall, challenge or "try again later", stop and report.

## Folders

- `brand/` — `brand.md` (brand doc), `tokens.json` (machine-readable tokens), `dynk-context.md` (approved product facts), `logo/`, `fonts/`, `audio/sfx/`, `audio/music/` (royalty-free only)
- `references/` — reference videos and `notes.md` (what to copy from each). Add with `/add-reference`.
- `inbox/` — drop footage, screenshots, app screen recordings here. The director picks from it.
- `data/` — `hook-bank.md` (every viral hook the analyzer has broken down), `own-page-log.md` (how our videos did), `topics-log.md` (what we've covered)
- `runs/<id>/` — one folder per video
- `studio/` — Remotion project. **`src/kit/` is the scene kit** (`index.tsx` 2D, `three.tsx` 3D objects, `speedy.tsx` v3 captions/callouts/glow/share sheet); `src/components/index.tsx` is the legacy v1 kit. Scenes live in `src/scenes/<run>/`; worked v2 example in `src/scenes/_demo_v2/`.
- `tools/` — `fetch_clip.py` (find/cut real footage), `gen_image.py` (optional AI hero shots), `make_sfx_v2.sh` (v2 sounds + bed), `new_run.sh`, `tts.py`, `use_recorded_vo.py`, `record_web.mjs`, `make_sfx.sh`, `scaffold_scenes.mjs`, `render_scene.sh`, `review_frames.sh`, `stitch.sh`
- `.claude/skills/` — vendored skills: review hooks (`viral-hooks`, `viral-instagram-reels`, `viral-short-form`, `viral-captions-and-ctas`, `create-shortform`) and proven hooks (`proven-hook-templates`, `viral-video-platform-specs`, `viral-video-animated-captions`)

## Video spec

9:16, 1080×1920, 30 fps, H.264, 50–60 seconds unless the brief says otherwise, loudness −14 LUFS (loudness units relative to full scale, Instagram's target), captions burned in.

## Running in the cloud (Claude Code on the web)

See `CLOUD.md`. Short version: the session runs `bash setup-cloud.sh` once, there is no Chrome so the
analyzer uses its fallback (`data/hook-bank.md` + the style bibles), gates are answered in chat, and the
finished `runs/<id>/final/<id>.mp4` + `cover.jpg` are committed to the session branch so Cooper/Simon can
download them from GitHub. Never commit API keys.
