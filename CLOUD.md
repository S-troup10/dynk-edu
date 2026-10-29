# Running the pipeline in the cloud

The pipeline is a Claude Code project. Anything that runs Claude Code on Linux can run it. The easiest is
**Claude Code on the web** (claude.ai/code), which clones this repo into a cloud box per session.

## One-time setup (claude.ai/code)
1. Open claude.ai/code, pick this repo (`dynk-video-pipeline`), and create or edit its **environment**:
   - **Network access: "Full"** (or a custom allowlist with at least: `speech.platform.bing.com` for the
     free edge-tts voice, `*.youtube.com` + `*.googlevideo.com` for real footage, `www.instagram.com` if you
     want the analyzer to look at reels, `generativelanguage.googleapis.com` or `api.openai.com` for AI hero
     images, plus npm/pip registries).
   - **Environment variables** (optional): `GEMINI_API_KEY` or `OPENAI_API_KEY` for AI hero shots,
     `REMOTION_GL=swangle`. Put keys here, **never in the repo**.
   - **Setup script**: `bash setup-cloud.sh` (installs ffmpeg, edge-tts, yt-dlp, Remotion, sound kit and
     smoke-tests a render).
2. Start a session and type `/make-video` (optionally with a topic, e.g. `/make-video why your wallet app holds no coins`).
3. Gates 1 and 2 are asked in the chat. Answer there.
4. When the reviewer passes, the orchestrator commits `runs/<id>/final/<id>.mp4`, the cover and the
   caption to the session branch and pushes. Download the MP4 from that branch on GitHub (or open a PR
   and merge it to keep a record).

## Differences from the Mac setup
| | Mac (`setup.sh`) | Cloud (`setup-cloud.sh`) |
|---|---|---|
| 3D rendering | GPU (`--gl=angle`) | Software WebGL (`--gl=swangle`): slower, same pixels. `render_scene.sh` picks this automatically on Linux. |
| Analyzer (Instagram) | Claude in Chrome, logged in | No browser. Falls back to `data/hook-bank.md` + the style bibles. Fine for most runs; do analyzer-heavy research on the Mac. |
| Real footage (yt-dlp) | Works | YouTube often blocks datacenter IPs. If `fetch_clip.py` fails, the director uses the 3D/name-card fallback, or drop clips into `inbox/` and commit them. |
| Voice | edge-tts | edge-tts (needs network). Or record on your phone, commit `runs/<id>/audio/vo/S01.recorded.m4a`… and resume at `director`. |
| Opening the result | `open …mp4` | Committed to the branch |

## Cost
Claude usage per video is roughly $3–8 on Sonnet (estimate, not measured: the agent chain, about 15–30
composer renders, and review loops). Gemini hero images are about $0.04 each. Everything else (voice,
footage, rendering) is free. To save money, set `model: haiku` in `.claude/agents/{cutter,clipper,analyzer,adapter}.md`.

## Running locally on Linux / a VM instead
```bash
git clone <this repo> && cd dynk-video-pipeline
bash setup-cloud.sh
claude          # then /make-video
```
