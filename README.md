# DYNK Education Video Pipeline

> **Cloud:** see `CLOUD.md` (Claude Code on the web: set the setup script to `bash setup-cloud.sh`). **Look:** `references/style-speedy_devv.md` (v3).

> **v2 (26 Oct 2026): "monochrome studio" look modelled on @0x100x.** Real B&W footage cold opens, a greyscale 3D
> world with one orange accent per shot, whisper captions, real sourced numbers, calm 60–90 s pacing.
> Style bible: `references/style-0x100x.md`. Worked example: `runs/2026-10-26-ftx-self-custody-v2-demo/`.
> New in v2: `clipper` agent + `tools/fetch_clip.py` (finds and cuts real interview/news clips, writes credits),
> 3D kit in `studio/src/kit/three.tsx`, 2D kit in `studio/src/kit/index.tsx`, calmer polished voice,
> ambient bed + soft SFX (`tools/make_sfx_v2.sh`), optional AI hero shots (`tools/gen_image.py`, needs
> `GEMINI_API_KEY` or `OPENAI_API_KEY`).

Makes educational Reels for @dynkeducation using a chain of agents: brain → analyzer → hook → adapter → scripter → adapter check → clipper → director → composers (in parallel) → cutter → reviewer. The full contract is in `CLAUDE.md`.

## First time (5 min)
1. Terminal: `cd ~/Desktop/DYNK/video-pipeline && bash setup.sh`
2. Make sure the Claude in Chrome extension is on and you're logged into Instagram in Chrome.
3. `claude --chrome` (in this folder)

## Every video
- `/make-video` (or `/make-video seed phrases for beginners`)
- You approve twice: the **topic** and the **script**. Everything else runs on its own; the reviewer can send it back up to 2 times.
- Output: `runs/<id>/final/<id>.mp4` + caption, hashtags and the trending sound to attach in Instagram.

## Other commands
| Command | What it does |
|---|---|
| `/brand-setup` | Refine and approve the brand doc + tokens, render a test card |
| `/add-reference <file or URL>` | Study a reference video, add notes the director follows |
| `/record-voice <run-id>` | Swap the AI voice for your recording, rebuild from the director stage |
| `/make-video resume <run-id> <stage>` | Re-run from any stage |

## Where to put things
- Footage, app screen recordings, screenshots → `inbox/`
- Reference videos → `/add-reference` (stored in `references/`)
- Royalty-free music → `brand/audio/music/` · SFX → `brand/audio/sfx/`
- Product facts the videos may state → `brand/dynk-context.md` (**confirm the items marked "(confirm)"**)

## Skills used (vendored in `.claude/skills/`)
- Review hooks: [vyralcontent/content-skills](https://github.com/vyralcontent/content-skills) (viral-hooks, viral-instagram-reels, viral-short-form, viral-captions-and-ctas) + `create-shortform` from [hungv47/meta-skills](https://github.com/hungv47/meta-skills)
- Proven hooks: [josiahsiegel/claude-plugin-marketplace](https://github.com/josiahsiegel/claude-plugin-marketplace) → ffmpeg-social-video (proven-hook-templates, platform specs, animated captions)

## Talking-head videos (`/talk-video`)
Film yourself explaining something in one take. The pipeline cuts dead air and retakes, then cuts to a sheet of paper that gets drawn on (marker, highlighter, sticky notes, clippings) as you say it, and back to your face on every rehook. Its own look, separate from the 3D house style.
- `/talk-video script <topic>` → approve → film one take → drop it in `runs/<id>/source/` → `/talk-video edit <id>`
- Already filmed, no script: `/talk-video new <slug>`
- Rules + research: `references/talking-head-explainer-style.md` · how it works: `TALK_PIPELINE.md`
